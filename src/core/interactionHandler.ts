import {
  Interaction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  RoleSelectMenuInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import { log } from '../utils/logging.js';
import { handleTicketSelectMenu, handleTicketButton, handleTicketModal } from '../features/tickets/ticketManager.js';
import {
  handleSetupRoleSelectMenu,
  handleSetupRoleSaveButton,
  handleSetupChannelSelect,
  handleSetupFullRoleSelect,
  handleSetupFullSave,
} from '../features/setup/setupManager.js';
import { replyV2 } from '../utils/v2Messages.js';
import { createErrorV2Message } from '../componentsV2/builder.js';

export async function handleInteraction(interaction: Interaction): Promise<void> {
  // Gestion des boutons
  if (interaction.isButton()) {
    if (interaction.customId === 'setup_staff_save') {
      await handleSetupRoleSaveButton(interaction);
      return;
    }
    if (interaction.customId === 'setup_full_save') {
      await handleSetupFullSave(interaction);
      return;
    }
    await handleButtonInteraction(interaction);
    return;
  }

  // Gestion des menus déroulants (string select)
  if (interaction.isStringSelectMenu()) {
    await handleSelectMenuInteraction(interaction);
    return;
  }

  // Gestion des menus de sélection de rôles (incluant full setup)
  if (interaction.isRoleSelectMenu && interaction.isRoleSelectMenu()) {
    await handleRoleSelectMenuInteraction(interaction as RoleSelectMenuInteraction);
    return;
  }

  // Gestion des menus de sélection de salons (full setup)
  if (interaction.isChannelSelectMenu && interaction.isChannelSelectMenu()) {
    await handleChannelSelectMenuInteraction(interaction);
    return;
  }

  // Gestion des modals
  if (interaction.isModalSubmit()) {
    await handleModalInteraction(interaction);
    return;
  }
}

async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const customId = interaction.customId;

  log.debug(`Button cliqué: ${customId} par ${interaction.user.tag}`);

  // Boutons liés aux tickets
  if (customId.startsWith('ticket_')) {
    await handleTicketButton(interaction);
    return;
  }

  // Bouton inconnu
  log.warn(`Button inconnu: ${customId}`);
  await replyV2(
    interaction,
    createErrorV2Message('Action inconnue', 'Ce bouton n\'est pas reconnu.')
  );
}

async function handleSelectMenuInteraction(interaction: StringSelectMenuInteraction): Promise<void> {
  const customId = interaction.customId;

  log.debug(`Select menu: ${customId} par ${interaction.user.tag}`);

  // Menu de sélection de type de ticket
  if (customId === 'ticket_type_select' || customId === 'ticket_change_type') {
    await handleTicketSelectMenu(interaction);
    return;
  }

  // Menu inconnu
  log.warn(`Select menu inconnu: ${customId}`);
  await replyV2(
    interaction,
    createErrorV2Message('Action inconnue', 'Ce menu n\'est pas reconnu.')
  );
}

async function handleRoleSelectMenuInteraction(
  interaction: RoleSelectMenuInteraction
): Promise<void> {
  const customId = interaction.customId;

  log.debug(`Role select menu: ${customId} par ${interaction.user.tag}`);

  if (customId === 'setup_staff_select') {
    await handleSetupRoleSelectMenu(interaction);
    return;
  }

  if (customId === 'setup_full_staff_roles') {
    await handleSetupFullRoleSelect(interaction);
    return;
  }

  log.warn(`Role select inconnu: ${customId}`);
  await replyV2(
    interaction,
    createErrorV2Message('Action inconnue', 'Ce menu n\'est pas reconnu.')
  );
}

async function handleChannelSelectMenuInteraction(interaction: any): Promise<void> {
  const customId = interaction.customId;

  log.debug(`Channel select menu: ${customId} par ${interaction.user.tag}`);

  if (
    customId === 'setup_full_base_channel' ||
    customId === 'setup_full_category' ||
    customId === 'setup_full_transcript'
  ) {
    await handleSetupChannelSelect(interaction);
    return;
  }

  log.warn(`Channel select inconnu: ${customId}`);
  await replyV2(
    interaction,
    createErrorV2Message('Action inconnue', 'Ce menu n\'est pas reconnu.')
  );
}

async function handleModalInteraction(interaction: ModalSubmitInteraction): Promise<void> {
  const customId = interaction.customId;

  log.debug(`Modal soumis: ${customId} par ${interaction.user.tag}`);

  // Modals liés aux tickets
  if (customId.startsWith('ticket_')) {
    await handleTicketModal(interaction);
    return;
  }

  // Modal inconnu
  log.warn(`Modal inconnu: ${customId}`);
  await replyV2(
    interaction,
    createErrorV2Message('Action inconnue', 'Ce formulaire n\'est pas reconnu.')
  );
}

