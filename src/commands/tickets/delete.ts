import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags } from 'discord.js';
import { Command } from '../../types/command.js';
import { closeTicket } from '../../features/tickets/ticketManager.js';
import { buildTicketCloseConfirmMessage } from '../../componentsV2/tickets.js';
import { replyV2 } from '../../utils/v2Messages.js';
import { createWarningV2Message } from '../../componentsV2/builder.js';

const deleteCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Ferme et supprime ce ticket'),

  staffOnly: true,
  ticketOnly: true,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Option 1: Demander confirmation
    const confirmMessage = buildTicketCloseConfirmMessage();
    await replyV2(interaction, { ...confirmMessage, flags: confirmMessage.flags | MessageFlags.Ephemeral });

    // Note: La fermeture réelle se fait via le bouton de confirmation
    // dans interactionHandler.ts -> handleTicketButton
  },
};

// Alternative: fermeture directe sans confirmation
export async function deleteTicketDirect(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const channel = interaction.channel as TextChannel;

  await replyV2(
    interaction,
    createWarningV2Message('Fermeture', '🔒 Fermeture du ticket en cours...')
  );

  await closeTicket(channel);
}

export default deleteCommand;

