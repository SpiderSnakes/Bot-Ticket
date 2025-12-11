import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { Command } from '../../types/command.js';
import { getGuildConfig } from '../../config/guildConfig.js';
import { createErrorV2Message } from '../../componentsV2/builder.js';
import { buildFullSetupMessage } from '../../componentsV2/setup.js';
import { log } from '../../utils/logging.js';
import { replyV2, editReplyV2 } from '../../utils/v2Messages.js';
import { setDraftFromConfig } from '../../features/setup/setupManager.js';

const setupCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure le système de tickets pour ce serveur'),

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

    try {
      const defaults = getGuildConfig(interaction.guild.id) || undefined;
      setDraftFromConfig(interaction.guild.id, interaction.user.id, defaults);
      const setupMessage = buildFullSetupMessage({
        baseChannelId: defaults?.ticketBaseChannelId,
        categoryId: defaults?.ticketCategoryId,
        transcriptChannelId: defaults?.transcriptChannelId,
        staffRoleIds: defaults?.staffRoleIds,
      });
      await editReplyV2(interaction, { ...setupMessage, flags: setupMessage.flags | MessageFlags.Ephemeral });
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

