import {
  ButtonInteraction,
  RoleSelectMenuInteraction,
  ChannelSelectMenuInteraction,
  ChannelType,
  MessageFlags,
} from 'discord.js';
import {
  updateGuildConfig,
  getGuildConfig,
  setGuildConfig,
  setTicketPanelMessageId,
} from '../../config/guildConfig.js';
import { followUpV2, replyV2 } from '../../utils/v2Messages.js';
import { createErrorV2Message, createSuccessV2Message } from '../../componentsV2/builder.js';
import { buildTicketPanelMessage } from '../../componentsV2/tickets.js';
import { sendV2 } from '../../utils/v2Messages.js';

export async function handleSetupRoleSelectMenu(
  interaction: RoleSelectMenuInteraction
): Promise<void> {
  if (!interaction.guild) {
    await replyV2(
      interaction,
      createErrorV2Message('Contexte invalide', 'Cette action doit être faite sur un serveur.')
    );
    return;
  }

  const selectedRoles = interaction.values;

  updateGuildConfig(interaction.guild.id, { staffRoleIds: selectedRoles });

  await interaction.deferUpdate();
  await followUpV2(
    interaction,
    createSuccessV2Message(
      'Rôles staff mis à jour',
      `Rôles sélectionnés : ${selectedRoles.map((id) => `<@&${id}>`).join(', ')}`
    )
  );
}

export async function handleSetupRoleSaveButton(
  interaction: ButtonInteraction
): Promise<void> {
  if (!interaction.guild || interaction.channel?.type === ChannelType.DM) {
    await replyV2(
      interaction,
      createErrorV2Message('Contexte invalide', 'Cette action doit être faite sur un serveur.')
    );
    return;
  }

  const config = getGuildConfig(interaction.guild.id);
  if (!config) {
    await replyV2(
      interaction,
      createErrorV2Message('Configuration manquante', 'Aucune configuration trouvée.')
    );
    return;
  }

  const roles = config.staffRoleIds ?? [];

  await replyV2(
    interaction,
    {
      ...createSuccessV2Message(
        'Rôles staff enregistrés',
        roles.length ? roles.map((id) => `<@&${id}>`).join(', ') : 'Aucun rôle sélectionné'
      ),
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    }
  );
}

// Stockage temporaire pour la configuration /setup (ephemeral, par user/guild)
type SetupDraft = {
  baseChannelId?: string;
  categoryId?: string;
  transcriptChannelId?: string;
  staffRoleIds: string[];
};

const draftByGuildUser = new Map<string, SetupDraft>();

function draftKey(guildId: string, userId: string): string {
  return `${guildId}:${userId}`;
}

function getDraft(guildId: string, userId: string): SetupDraft {
  const key = draftKey(guildId, userId);
  const existing = draftByGuildUser.get(key);
  if (existing) return existing;
  const draft: SetupDraft = { staffRoleIds: [] };
  draftByGuildUser.set(key, draft);
  return draft;
}

export function setDraftFromConfig(
  guildId: string,
  userId: string,
  defaults?: {
    baseChannelId?: string;
    categoryId?: string;
    transcriptChannelId?: string;
    staffRoleIds?: string[];
  }
): void {
  const draft = getDraft(guildId, userId);
  if (defaults?.baseChannelId) draft.baseChannelId = defaults.baseChannelId;
  if (defaults?.categoryId) draft.categoryId = defaults.categoryId;
  if (defaults?.transcriptChannelId) draft.transcriptChannelId = defaults.transcriptChannelId;
  if (defaults?.staffRoleIds?.length) draft.staffRoleIds = defaults.staffRoleIds;
}

export async function handleSetupChannelSelect(
  interaction: ChannelSelectMenuInteraction
): Promise<void> {
  if (!interaction.guild) {
    await replyV2(
      interaction,
      createErrorV2Message('Contexte invalide', 'Cette action doit être faite sur un serveur.')
    );
    return;
  }

  const draft = getDraft(interaction.guild.id, interaction.user.id);
  const selected = interaction.values[0];

  if (interaction.customId === 'setup_full_base_channel') {
    draft.baseChannelId = selected;
  } else if (interaction.customId === 'setup_full_category') {
    draft.categoryId = selected;
  } else if (interaction.customId === 'setup_full_transcript') {
    draft.transcriptChannelId = selected;
  }

  await interaction.deferUpdate();
}

export async function handleSetupFullRoleSelect(
  interaction: RoleSelectMenuInteraction
): Promise<void> {
  if (!interaction.guild) {
    await replyV2(
      interaction,
      createErrorV2Message('Contexte invalide', 'Cette action doit être faite sur un serveur.')
    );
    return;
  }

  const draft = getDraft(interaction.guild.id, interaction.user.id);
  draft.staffRoleIds = interaction.values;

  await interaction.deferUpdate();
}

export async function handleSetupFullSave(
  interaction: ButtonInteraction
): Promise<void> {
  if (!interaction.guild) {
    await replyV2(
      interaction,
      createErrorV2Message('Contexte invalide', 'Cette action doit être faite sur un serveur.')
    );
    return;
  }

  const draft = getDraft(interaction.guild.id, interaction.user.id);

  // Récupérer config existante pour pré-remplir si l'utilisateur n'a pas changé un champ
  const existing = getGuildConfig(interaction.guild.id);

  const baseChannelId = draft.baseChannelId ?? existing?.ticketBaseChannelId;
  const categoryId = draft.categoryId ?? existing?.ticketCategoryId;
  const transcriptChannelId = draft.transcriptChannelId ?? existing?.transcriptChannelId;
  const staffRoleIds =
    draft.staffRoleIds.length > 0
      ? draft.staffRoleIds
      : existing?.staffRoleIds && existing.staffRoleIds.length > 0
        ? existing.staffRoleIds
        : [];

  const missing: string[] = [];
  if (!baseChannelId) missing.push('Salon de création');
  if (!categoryId) missing.push('Catégorie des tickets');
  if (!transcriptChannelId) missing.push('Salon transcripts');
  if (staffRoleIds.length === 0) missing.push('Au moins un rôle staff');

  if (missing.length > 0) {
    await replyV2(
      interaction,
      {
        ...createErrorV2Message(
          'Champs manquants',
          'Sélectionnez :\n- ' + missing.join('\n- ')
        ),
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      }
    );
    return;
  }

  setGuildConfig({
    guildId: interaction.guild.id,
    ticketBaseChannelId: baseChannelId!,
    ticketCategoryId: categoryId!,
    transcriptChannelId: transcriptChannelId!,
    staffRoleIds,
  });

  draftByGuildUser.delete(draftKey(interaction.guild.id, interaction.user.id));

  // Envoyer le panneau de tickets dans le salon configuré
  try {
    const baseChannel = await interaction.guild.channels.fetch(baseChannelId!);
    if (baseChannel && baseChannel.type === ChannelType.GuildText) {
      const panel = buildTicketPanelMessage();
      const sent = await sendV2(baseChannel, panel);
      await sent.pin();
      setTicketPanelMessageId(interaction.guild.id, sent.id);
    }
  } catch (err) {
    // On log mais on n'empêche pas la confirmation
    console.error('Impossible d\'envoyer le panneau de tickets:', err);
  }

  await replyV2(
    interaction,
    {
      ...createSuccessV2Message(
        'Configuration enregistrée',
        `Salons/Catégorie/Rôles enregistrés avec succès.`
      ),
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    }
  );
}


