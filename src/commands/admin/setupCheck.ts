import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from 'discord.js';
import { Command } from '../../types/command.js';
import { getGuildConfig } from '../../config/guildConfig.js';
import { createErrorV2Message, createInfoV2Message } from '../../componentsV2/builder.js';
import { replyV2, editReplyV2 } from '../../utils/v2Messages.js';

const REQUIRED_PERMS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.AttachFiles,
  PermissionFlagsBits.EmbedLinks,
  PermissionFlagsBits.ManageMessages,
] as const;

function formatStatus(ok: boolean, label: string, detail?: string): string {
  return `${ok ? '✅' : '❌'} ${label}${detail ? ` : ${detail}` : ''}`;
}

const setupCheckCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('setup-check')
    .setDescription('Vérifie la configuration et les permissions du bot')
    .setDMPermission(false),

  adminOnly: true,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await replyV2(
        interaction,
        createErrorV2Message('Contexte invalide', 'Cette commande se fait sur un serveur.')
      );
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const config = getGuildConfig(interaction.guild.id);
    if (!config) {
      await editReplyV2(
        interaction,
        createErrorV2Message(
          'Configuration absente',
          'Lancez `/setup` pour configurer le système de tickets.'
        )
      );
      return;
    }

    const botMember = interaction.guild.members.me;

    const baseChannel = await interaction.guild.channels
      .fetch(config.ticketBaseChannelId)
      .catch(() => null);
    const category = await interaction.guild.channels.fetch(config.ticketCategoryId).catch(() => null);
    const transcriptChannel = await interaction.guild.channels
      .fetch(config.transcriptChannelId)
      .catch(() => null);

    const staffRoles = config.staffRoleIds;

    const baseChannelOk = !!baseChannel && baseChannel.type === ChannelType.GuildText;
    const categoryOk = !!category && category.type === ChannelType.GuildCategory;
    const transcriptOk = !!transcriptChannel && transcriptChannel.type === ChannelType.GuildText;
    const staffRolesOk = staffRoles.length > 0;

    const baseText = baseChannelOk ? (baseChannel as TextChannel) : null;
    const transcriptText = transcriptOk ? (transcriptChannel as TextChannel) : null;

    const permsOk =
      botMember &&
      baseText?.permissionsFor(botMember)?.has(REQUIRED_PERMS) === true &&
      transcriptText?.permissionsFor(botMember)?.has(REQUIRED_PERMS) === true;

    const lines: string[] = [
      formatStatus(baseChannelOk, 'Salon de base', baseChannelOk ? `<#${config.ticketBaseChannelId}>` : 'introuvable'),
      formatStatus(categoryOk, 'Catégorie tickets', categoryOk ? `<#${config.ticketCategoryId}>` : 'introuvable'),
      formatStatus(
        transcriptOk,
        'Salon transcripts',
        transcriptOk ? `<#${config.transcriptChannelId}>` : 'introuvable'
      ),
      formatStatus(staffRolesOk, 'Rôles staff', staffRolesOk ? staffRoles.map((r) => `<@&${r}>`).join(', ') : 'aucun'),
      formatStatus(permsOk, 'Permissions bot (salon base/transcripts)', permsOk ? 'OK' : 'manquantes'),
    ];

    const infoMessage = createInfoV2Message('Diagnostic configuration', lines.join('\n'));
    await editReplyV2(interaction, { ...infoMessage, flags: infoMessage.flags | MessageFlags.Ephemeral });
  },
};

export default setupCheckCommand;

