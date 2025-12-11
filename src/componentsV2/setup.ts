import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} from 'discord.js';
import {
  createContainer,
  createSeparator,
  createTextDisplay,
  V2MessageOptions,
} from './builder.js';

/**
 * Message V2 pour gérer la sélection des rôles staff.
 */
export function buildStaffRoleManagerMessage(staffRoleIds: string[]): V2MessageOptions {
  const container = createContainer()
    .addTextDisplayComponents(createTextDisplay('## 👥 Rôles Staff'))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        'Sélectionnez les rôles qui auront accès aux tickets.\n' +
          '- Minimum : 1 rôle\n' +
          '- Maximum : 10 rôles'
      )
    );

  const roleSelect = new RoleSelectMenuBuilder()
    .setCustomId('setup_staff_select')
    .setPlaceholder('Choisir les rôles staff')
    .setMinValues(1)
    .setMaxValues(10);

  if (staffRoleIds.length > 0) {
    roleSelect.setDefaultRoles(staffRoleIds);
  }

  const selectRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelect);

  const validateRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('setup_staff_save')
      .setStyle(ButtonStyle.Primary)
      .setLabel('Valider')
  );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container, selectRow, validateRow],
  };
}

export function buildFullSetupMessage(
  defaults: {
    baseChannelId?: string;
    categoryId?: string;
    transcriptChannelId?: string;
    staffRoleIds?: string[];
  } = {}
): V2MessageOptions {
  const container = createContainer()
    .addTextDisplayComponents(createTextDisplay('## ⚙️ Configuration du système de tickets'))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        'Sélectionnez tous les éléments requis :\n' +
          '- Salon de création (text)\n' +
          '- Catégorie des tickets\n' +
          '- Salon transcripts (text)\n' +
          '- Rôles staff (1 à 10)\n' +
          'Puis validez.'
      )
    );

  const baseChannelSelect = new ChannelSelectMenuBuilder()
    .setCustomId('setup_full_base_channel')
    .setPlaceholder('Salon de création (text)')
    .setChannelTypes(ChannelType.GuildText)
    .setMinValues(1)
    .setMaxValues(1);
  if (defaults.baseChannelId) baseChannelSelect.setDefaultChannels(defaults.baseChannelId);

  const categorySelect = new ChannelSelectMenuBuilder()
    .setCustomId('setup_full_category')
    .setPlaceholder('Catégorie des tickets')
    .setChannelTypes(ChannelType.GuildCategory)
    .setMinValues(1)
    .setMaxValues(1);
  if (defaults.categoryId) categorySelect.setDefaultChannels(defaults.categoryId);

  const transcriptSelect = new ChannelSelectMenuBuilder()
    .setCustomId('setup_full_transcript')
    .setPlaceholder('Salon transcripts (text)')
    .setChannelTypes(ChannelType.GuildText)
    .setMinValues(1)
    .setMaxValues(1);
  if (defaults.transcriptChannelId) transcriptSelect.setDefaultChannels(defaults.transcriptChannelId);

  const roleSelect = new RoleSelectMenuBuilder()
    .setCustomId('setup_full_staff_roles')
    .setPlaceholder('Rôles staff (1 à 10)')
    .setMinValues(1)
    .setMaxValues(10);
  if (defaults.staffRoleIds?.length) roleSelect.setDefaultRoles(defaults.staffRoleIds);

  const validateRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('setup_full_save')
      .setStyle(ButtonStyle.Primary)
      .setLabel('Valider la configuration')
  );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      container,
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(baseChannelSelect) as any,
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(categorySelect) as any,
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(transcriptSelect) as any,
      new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelect),
      validateRow,
    ],
  };
}


