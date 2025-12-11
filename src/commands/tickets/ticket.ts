import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { Command } from '../../types/command.js';
import { getGuildConfig } from '../../config/guildConfig.js';
import { TICKET_TYPES, getTicketTypeById, TicketTypeId } from '../../features/tickets/ticketTypes.js';
import { createTicket, findExistingTicket } from '../../features/tickets/ticketManager.js';
import { buildTicketCreatedMessage } from '../../componentsV2/tickets.js';
import { createErrorV2Message, createInfoV2Message } from '../../componentsV2/builder.js';
import { replyV2, editReplyV2 } from '../../utils/v2Messages.js';

const ticketCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Crée un nouveau ticket')
    .addStringOption((option) =>
      option
        .setName('sujet')
        .setDescription('Le sujet de votre ticket')
        .setRequired(true)
        .addChoices(
          ...TICKET_TYPES.map((type) => ({
            name: `${type.emoji} ${type.label}`,
            value: type.id,
          }))
        )
    )
    .addUserOption((option) =>
      option
        .setName('membre')
        .setDescription('Créer le ticket pour un autre membre (staff uniquement)')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await replyV2(
        interaction,
        createErrorV2Message(
          'Contexte invalide',
          'Cette commande ne peut être utilisée que sur un serveur.'
        )
      );
      return;
    }

    // Vérifier la configuration
    const config = getGuildConfig(interaction.guild.id);
    if (!config) {
      const errorMessage = createErrorV2Message(
        'Configuration manquante',
        'Le système de tickets n\'est pas configuré sur ce serveur.\n' +
          'Un administrateur doit utiliser la commande `/setup` pour configurer le système.'
      );
      await replyV2(interaction, { ...errorMessage, flags: errorMessage.flags | MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const typeId = interaction.options.getString('sujet', true) as TicketTypeId;
    const targetUser = interaction.options.getUser('membre') || interaction.user;

    const ticketType = getTicketTypeById(typeId);
    if (!ticketType) {
      await editReplyV2(
        interaction,
        createErrorV2Message('Type invalide', 'Le type de ticket sélectionné est invalide.')
      );
      return;
    }

    // Vérifier si l'utilisateur essaie de créer un ticket pour quelqu'un d'autre
    if (targetUser.id !== interaction.user.id) {
      // Vérifier si l'utilisateur est staff
      const member = interaction.member;
      const isStaff =
        member &&
        'roles' in member &&
        (Array.isArray(member.roles)
          ? member.roles.some((r) => config.staffRoleIds.includes(r))
          : member.roles.cache.some((r) => config.staffRoleIds.includes(r.id)));

      if (!isStaff) {
        await editReplyV2(
          interaction,
          createErrorV2Message(
            'Accès refusé',
            'Seuls les membres du staff peuvent créer des tickets pour d\'autres utilisateurs.'
          )
        );
        return;
      }
    }

    // Anti-duplication : vérifier l'existence d'un ticket du même type pour cet utilisateur
    const existingChannel = await findExistingTicket(interaction.guild, targetUser.id, ticketType.id);
    if (existingChannel) {
      const infoMessage = createInfoV2Message(
        'Ticket déjà ouvert',
        `Un ticket ${ticketType.emoji} **${ticketType.label}** existe déjà : <#${existingChannel.id}>`
      );
      await editReplyV2(interaction, { ...infoMessage, flags: infoMessage.flags | MessageFlags.Ephemeral });
      return;
    }

    // Créer le ticket
    const channel = await createTicket(interaction.guild, targetUser, ticketType);

    if (channel) {
      const successMessage = buildTicketCreatedMessage(channel.id);
      await editReplyV2(interaction, successMessage);
    } else {
      await editReplyV2(
        interaction,
        createErrorV2Message(
          'Erreur de création',
          'Impossible de créer le ticket. Veuillez contacter un administrateur.'
        )
      );
    }
  },
};

export default ticketCommand;

