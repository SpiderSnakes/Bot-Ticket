import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
} from 'discord.js';
import { Command } from '../../types/command.js';

const renameCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDescription('Renomme ce salon de ticket'),

  staffOnly: true,
  ticketOnly: true,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Créer le modal
    const modal = new ModalBuilder()
      .setCustomId('ticket_rename_modal')
      .setTitle('Renommer le salon');

    // Champ de texte pour le nouveau nom
    const nameInput = new TextInputBuilder()
      .setCustomId('new_name')
      .setLabel('Nouveau nom du salon')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('exemple: support-jean')
      .setMinLength(1)
      .setMaxLength(100)
      .setRequired(true);

    // Ajouter le champ au modal
    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
      nameInput
    );

    modal.addComponents(actionRow);

    // Afficher le modal
    await interaction.showModal(modal);
  },
};

export default renameCommand;

