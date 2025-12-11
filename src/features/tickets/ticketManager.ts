import {
  Guild,
  User,
  TextChannel,
  ChannelType,
  PermissionFlagsBits,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
  Channel,
  GuildBasedChannel,
  MessageFlags,
  Message,
} from 'discord.js';
import type { Timeout } from 'node:timers';
import { getGuildConfig } from '../../config/guildConfig.js';
import { TicketType, TicketTypeId, getTicketTypeById, getTicketTypeByPrefix } from './ticketTypes.js';
import { generateTicketChannelName, parseTicketChannelName } from './channelNaming.js';
import {
  buildTicketInitialMessage,
  buildTicketCreatedMessage,
  buildTicketTypeChangeMessage,
  buildTicketTypeChangedMessage,
  buildTicketCloseConfirmMessage,
  buildTicketClosingMessage,
} from '../../componentsV2/tickets.js';
import {
  createErrorV2Message,
  createSuccessV2Message,
  createInfoV2Message,
} from '../../componentsV2/builder.js';
import { getAutoTemplate } from './templates/index.js';
import { log } from '../../utils/logging.js';
import { replyV2, editReplyV2, followUpV2, sendV2 } from '../../utils/v2Messages.js';

// Stockage temporaire des infos de tickets (en mémoire)
// En production, utiliser une base de données
interface TicketInfo {
  channelId: string;
  guildId: string;
  userId: string;
  typeId: TicketTypeId;
  createdAt: Date;
  templateMessageIds: string[];
  templateTimeout: Timeout | null;
}

const activeTickets = new Map<string, TicketInfo>();

/**
 * Vérifie si un channel est un salon de ticket
 */
export function isTicketChannel(channel: Channel | GuildBasedChannel | null): boolean {
  if (!channel || channel.type !== ChannelType.GuildText) {
    return false;
  }

  const textChannel = channel as TextChannel;
  
  // Vérifier via le stockage en mémoire
  if (activeTickets.has(textChannel.id)) {
    return true;
  }

  // Vérifier via le nom du salon (fallback)
  const parsed = parseTicketChannelName(textChannel.name);
  if (parsed) {
    const ticketType = getTicketTypeByPrefix(parsed.prefix);
    return ticketType !== undefined;
  }

  return false;
}

/**
 * Récupère les informations d'un ticket
 */
export function getTicketInfo(channelId: string): TicketInfo | undefined {
  return activeTickets.get(channelId);
}

/**
 * Retire un ticket du cache (ex: salon supprimé manuellement)
 */
export function removeTicket(channelId: string): void {
  const ticket = activeTickets.get(channelId);
  if (ticket?.templateTimeout) {
    clearTimeout(ticket.templateTimeout);
  }
  activeTickets.delete(channelId);
}

/**
 * Recherche un ticket existant pour un user + type
 */
export async function findExistingTicket(
  guild: Guild,
  userId: string,
  typeId: TicketTypeId
): Promise<TextChannel | null> {
  for (const ticket of activeTickets.values()) {
    if (ticket.guildId === guild.id && ticket.userId === userId && ticket.typeId === typeId) {
      const channel = await guild.channels.fetch(ticket.channelId).catch(() => null);
      if (channel && channel.type === ChannelType.GuildText) {
        return channel as TextChannel;
      }
    }
  }
  return null;
}

async function logTicketEvent(
  channel: TextChannel,
  title: string,
  description: string
): Promise<Message<boolean>> {
  const logMessage = createInfoV2Message(title, description);
  return sendV2(channel, logMessage);
}

/**
 * Crée un nouveau ticket
 */
export async function createTicket(
  guild: Guild,
  user: User,
  ticketType: TicketType
): Promise<TextChannel | null> {
  const config = getGuildConfig(guild.id);

  if (!config) {
    log.error(`Configuration non trouvée pour le serveur ${guild.id}`);
    return null;
  }

  // Vérifier la catégorie de tickets
  const category = guild.channels.cache.get(config.ticketCategoryId);
  if (!category || category.type !== ChannelType.GuildCategory) {
    log.error(
      `Catégorie de tickets introuvable ou invalide (${config.ticketCategoryId}) pour le serveur ${guild.id}`
    );
    return null;
  }

  // Générer le nom du salon
  const channelName = generateTicketChannelName(
    guild,
    ticketType,
    user.username,
    config.ticketCategoryId
  );

  try {
    // Créer le salon
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: config.ticketCategoryId,
      permissionOverwrites: [
        // Interdire l'accès à @everyone
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        // Autoriser l'utilisateur
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks,
          ],
        },
        // Autoriser les rôles staff
        ...config.staffRoleIds.map((roleId) => ({
          id: roleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.ManageMessages,
          ],
        })),
      ],
    });

    // Stocker les infos du ticket
    activeTickets.set(channel.id, {
      channelId: channel.id,
      guildId: guild.id,
      userId: user.id,
      typeId: ticketType.id,
      createdAt: new Date(),
      templateMessageIds: [],
      templateTimeout: null,
    });

    // Envoyer le message initial
    const initialMessage = buildTicketInitialMessage(ticketType, user);
    const sentMessage = await sendV2(channel, initialMessage);

    // Épingler le message
    await sentMessage.pin();

    // Programmer l'envoi du template automatique (20 secondes)
    const timeout = setTimeout(async () => {
      try {
        const currentTicket = activeTickets.get(channel.id);
        if (!currentTicket) {
          return;
        }

        const currentType = getTicketTypeById(currentTicket.typeId);
        if (!currentType) {
          return;
        }

        const template = getAutoTemplate(currentType.autoTemplateId);
        if (template) {
          const templateMessage = await sendV2(channel, template);
          const updatedTicket = activeTickets.get(channel.id);

          if (updatedTicket) {
            updatedTicket.templateMessageIds = [
              ...(updatedTicket.templateMessageIds ?? []),
              templateMessage.id,
            ];
            updatedTicket.templateTimeout = null;
            activeTickets.set(channel.id, updatedTicket);
          }
        } else {
          log.warn(
            `Aucun template automatique trouvé pour le type ${currentType.id} lors de la création du ticket ${channel.id}`
          );
        }
      } catch (error) {
        log.error(`Erreur lors de l'envoi du template automatique:`, error);
      }
    }, 20000);

    const ticket = activeTickets.get(channel.id);
    if (ticket) {
      ticket.templateTimeout = timeout;
      activeTickets.set(channel.id, ticket);
    }

    log.success(`Ticket créé: ${channel.name} pour ${user.tag}`);
    return channel;
  } catch (error) {
    log.error(`Erreur lors de la création du ticket:`, error);
    return null;
  }
}

/**
 * Ferme et supprime un ticket
 */
export async function closeTicket(channel: TextChannel): Promise<boolean> {
  try {
    // Supprimer du stockage
    const ticket = activeTickets.get(channel.id);
    if (ticket?.templateTimeout) {
      clearTimeout(ticket.templateTimeout);
    }
    activeTickets.delete(channel.id);

    // Envoyer un message de fermeture
    const closingMessage = buildTicketClosingMessage();
    await sendV2(channel, closingMessage);

    // Attendre 5 secondes puis supprimer
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await channel.delete('Ticket fermé');

    log.info(`Ticket fermé: ${channel.name}`);
    return true;
  } catch (error) {
    log.error(`Erreur lors de la fermeture du ticket:`, error);
    return false;
  }
}

/**
 * Change le type d'un ticket
 */
export async function changeTicketType(
  channel: TextChannel,
  newTypeId: TicketTypeId,
  changedBy: User
): Promise<boolean> {
  const ticketInfo = activeTickets.get(channel.id);
  
  if (!ticketInfo) {
    return false;
  }

  const oldType = getTicketTypeById(ticketInfo.typeId);
  const newType = getTicketTypeById(newTypeId);

  if (!oldType || !newType) {
    return false;
  }

  // Supprimer les anciens messages de template et annuler le timer
  if (ticketInfo.templateTimeout) {
    clearTimeout(ticketInfo.templateTimeout);
    ticketInfo.templateTimeout = null;
  }
  // Supprimer les anciens messages de template
  const templateMessageIds = ticketInfo.templateMessageIds ?? [];
  for (const messageId of templateMessageIds) {
    try {
      const message = await channel.messages.fetch(messageId);
      await message.delete();
    } catch (error) {
      log.warn(`Impossible de supprimer l'ancien template ${messageId}:`, error);
    }
  }

  // Mettre à jour le stockage
  ticketInfo.typeId = newTypeId;
  ticketInfo.templateMessageIds = [];
  activeTickets.set(channel.id, ticketInfo);

  // Optionnel: renommer le salon
  const guild = channel.guild;
  const config = getGuildConfig(guild.id);

  if (config) {
    // Récupérer l'utilisateur du ticket
    const user = await guild.members.fetch(ticketInfo.userId).catch(() => null);
    if (user) {
      const newName = generateTicketChannelName(
        guild,
        newType,
        user.user.username,
        config.ticketCategoryId
      );
      await channel.setName(newName);
    }
  }

  // Envoyer un message de notification
  const changeMessage = buildTicketTypeChangedMessage(oldType, newType, changedBy);
  await sendV2(channel, changeMessage);

  // Envoyer le nouveau template correspondant
  const newTemplate = getAutoTemplate(newType.autoTemplateId);
  if (newTemplate) {
    try {
      const newTemplateMessage = await sendV2(channel, newTemplate);
      const updatedTicket = activeTickets.get(channel.id);

      if (updatedTicket) {
        updatedTicket.templateMessageIds = [newTemplateMessage.id];
        updatedTicket.templateTimeout = null;
        activeTickets.set(channel.id, updatedTicket);
      }
    } catch (error) {
      log.error(`Erreur lors de l'envoi du nouveau template automatique:`, error);
    }
  } else {
    log.warn(`Aucun template automatique trouvé pour le type ${newType.id} lors du changement de type`);
  }

  log.info(`Type de ticket changé: ${channel.name} de ${oldType.label} à ${newType.label}`);
  return true;
}

/**
 * Gère les interactions select menu pour les tickets
 */
export async function handleTicketSelectMenu(
  interaction: StringSelectMenuInteraction
): Promise<void> {
  const customId = interaction.customId;
  const selectedValue = interaction.values[0] as TicketTypeId;

  if (customId === 'ticket_type_select') {
    // Création d'un nouveau ticket
    const ticketType = getTicketTypeById(selectedValue);

    if (!ticketType) {
      await replyV2(interaction, createErrorV2Message('Type invalide', 'Type de ticket invalide.'));
      return;
    }

    if (!interaction.guild) {
      await replyV2(
        interaction,
        createErrorV2Message('Contexte invalide', 'Cette action se fait uniquement sur un serveur.')
      );
      return;
    }

    const existingChannel = await findExistingTicket(
      interaction.guild,
      interaction.user.id,
      ticketType.id
    );
    if (existingChannel) {
      const infoMessage = createInfoV2Message(
        'Ticket déjà ouvert',
        `Un ticket ${ticketType.emoji} **${ticketType.label}** existe déjà : <#${existingChannel.id}>`
      );
      await replyV2(interaction, { ...infoMessage, flags: infoMessage.flags | MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const channel = await createTicket(interaction.guild, interaction.user, ticketType);

    if (channel) {
      const successMessage = buildTicketCreatedMessage(channel.id);
      await editReplyV2(interaction, successMessage);
    } else {
      await editReplyV2(
        interaction,
        createErrorV2Message(
          'Création impossible',
          'Impossible de créer le ticket. Veuillez contacter un administrateur.'
        )
      );
    }
  } else if (customId === 'ticket_change_type') {
    // Changement de type de ticket
    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
      await replyV2(
        interaction,
        createErrorV2Message(
          'Contexte invalide',
          'Cette action ne peut être effectuée que dans un salon de ticket.'
        )
      );
      return;
    }

    await interaction.deferUpdate();

    const success = await changeTicketType(
      interaction.channel as TextChannel,
      selectedValue,
      interaction.user
    );

    if (!success) {
      await followUpV2(
        interaction,
        createErrorV2Message('Action impossible', 'Impossible de changer le type du ticket.')
      );
    }
  }
}

/**
 * Gère les interactions boutons pour les tickets
 */
export async function handleTicketButton(interaction: ButtonInteraction): Promise<void> {
  const customId = interaction.customId;

  if (customId === 'ticket_close') {
    // Demander confirmation avant fermeture
    const confirmMessage = buildTicketCloseConfirmMessage();
    await replyV2(interaction, { ...confirmMessage, flags: confirmMessage.flags | MessageFlags.Ephemeral });
  } else if (customId === 'ticket_close_confirm') {
    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
      await replyV2(
        interaction,
        createErrorV2Message(
          'Contexte invalide',
          'Cette action ne peut être effectuée que dans un salon de ticket.'
        )
      );
      return;
    }

    await interaction.deferUpdate();
    await closeTicket(interaction.channel as TextChannel);
  } else if (customId === 'ticket_close_cancel') {
    await interaction.update({
      content: '❌ Fermeture annulée.',
      components: [],
    });
  } else if (customId === 'ticket_change_type_btn') {
    // Afficher le menu de changement de type
    const changeTypeMessage = buildTicketTypeChangeMessage();
    await replyV2(interaction, { ...changeTypeMessage, flags: changeTypeMessage.flags | MessageFlags.Ephemeral });
  }
}

/**
 * Gère les interactions modals pour les tickets
 */
export async function handleTicketModal(interaction: ModalSubmitInteraction): Promise<void> {
  const customId = interaction.customId;

  if (customId === 'ticket_rename_modal') {
    const newName = interaction.fields.getTextInputValue('new_name');

    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
      await replyV2(
        interaction,
        createErrorV2Message(
          'Contexte invalide',
          'Cette action ne peut être effectuée que dans un salon de ticket.'
        )
      );
      return;
    }

    try {
      const channel = interaction.channel as TextChannel;
      const oldName = channel.name;
      await channel.setName(newName);

      await replyV2(
        interaction,
        createSuccessV2Message('Salon renommé', `\`${oldName}\` → \`${newName}\``)
      );

      await logTicketEvent(
        channel,
        'Renommage',
        `Salon renommé par ${interaction.user}: \`${oldName}\` → \`${newName}\``
      );
    } catch (error) {
      log.error('Erreur lors du renommage du salon:', error);
      await replyV2(
        interaction,
        createErrorV2Message('Erreur', 'Impossible de renommer le salon.')
      );
    }
  }
}

