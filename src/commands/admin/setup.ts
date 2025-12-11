import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
  TextChannel,
  MessageFlags,
} from 'discord.js';
import { Command } from '../../types/command.js';
import { setGuildConfig, getGuildConfig, setTicketPanelMessageId } from '../../config/guildConfig.js';
import { buildTicketPanelMessage } from '../../componentsV2/tickets.js';
import { createSuccessV2Message, createErrorV2Message } from '../../componentsV2/builder.js';
import { log } from '../../utils/logging.js';
import { replyV2, editReplyV2, sendV2 } from '../../utils/v2Messages.js';

const setupCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure le système de tickets pour ce serveur')
    .addChannelOption((option) =>
      option
        .setName('salon_tickets')
        .setDescription('Salon où le message de création de tickets sera envoyé')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('categorie')
        .setDescription('Catégorie où les salons de tickets seront créés')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('salon_transcripts')
        .setDescription('Salon où les transcripts seront envoyés')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName('role_staff_1')
        .setDescription('Premier rôle staff ayant accès aux tickets')
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName('role_staff_2')
        .setDescription('Deuxième rôle staff (optionnel)')
        .setRequired(false)
    )
    .addRoleOption((option) =>
      option
        .setName('role_staff_3')
        .setDescription('Troisième rôle staff (optionnel)')
        .setRequired(false)
    ),

  adminOnly: true,

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

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const ticketBaseChannel = interaction.options.getChannel('salon_tickets', true);
    const ticketCategory = interaction.options.getChannel('categorie', true);
    const transcriptChannel = interaction.options.getChannel('salon_transcripts', true);

    // Collecter les rôles staff
    const staffRoleIds: string[] = [];
    const role1 = interaction.options.getRole('role_staff_1', true);
    staffRoleIds.push(role1.id);

    const role2 = interaction.options.getRole('role_staff_2');
    if (role2) staffRoleIds.push(role2.id);

    const role3 = interaction.options.getRole('role_staff_3');
    if (role3) staffRoleIds.push(role3.id);

    try {
      // Vérifier l'ancienne configuration
      const existingConfig = getGuildConfig(interaction.guild.id);
      
      // Si un ancien message de panneau existe, essayer de le supprimer
      if (existingConfig?.ticketPanelMessageId && existingConfig.ticketBaseChannelId) {
        try {
          const oldChannel = await interaction.guild.channels.fetch(
            existingConfig.ticketBaseChannelId
          );
          if (oldChannel && oldChannel.type === ChannelType.GuildText) {
            const oldMessage = await (oldChannel as TextChannel).messages.fetch(
              existingConfig.ticketPanelMessageId
            );
            if (oldMessage) {
              await oldMessage.delete();
            }
          }
        } catch {
          // Ignorer les erreurs si le message/salon n'existe plus
        }
      }

      // Sauvegarder la nouvelle configuration
      setGuildConfig({
        guildId: interaction.guild.id,
        ticketBaseChannelId: ticketBaseChannel.id,
        ticketCategoryId: ticketCategory.id,
        transcriptChannelId: transcriptChannel.id,
        staffRoleIds,
      });

      // Envoyer le message de panneau de tickets
      const baseChannel = interaction.guild.channels.cache.get(
        ticketBaseChannel.id
      ) as TextChannel;

      const panelMessage = buildTicketPanelMessage();
      const sentMessage = await sendV2(baseChannel, panelMessage);

      // Épingler le message
      await sentMessage.pin();

      // Sauvegarder l'ID du message
      setTicketPanelMessageId(interaction.guild.id, sentMessage.id);

      log.success(`Configuration terminée pour le serveur ${interaction.guild.name}`);

      const successMessage = createSuccessV2Message(
        'Configuration terminée !',
        `Le système de tickets a été configuré avec succès.\n\n` +
          `📌 **Salon de création :** <#${ticketBaseChannel.id}>\n` +
          `📁 **Catégorie des tickets :** ${ticketCategory.name}\n` +
          `📄 **Salon des transcripts :** <#${transcriptChannel.id}>\n` +
          `👥 **Rôles staff :** ${staffRoleIds.map((id) => `<@&${id}>`).join(', ')}`
      );

      await editReplyV2(interaction, successMessage);
    } catch (error) {
      log.error('Erreur lors de la configuration:', error);

      const errorMessage = createErrorV2Message(
        'Erreur de configuration',
        'Une erreur est survenue lors de la configuration. Vérifiez les permissions du bot.'
      );

      await editReplyV2(interaction, errorMessage);
    }
  },
};

export default setupCommand;

