import {
  Client,
  REST,
  Routes,
  ChatInputCommandInteraction,
  Collection,
  PermissionFlagsBits,
} from 'discord.js';
import { env } from '../config/env.js';
import { log } from '../utils/logging.js';
import { Command } from '../types/command.js';
import { getGuildConfig } from '../config/guildConfig.js';
import { isStaffMember } from '../utils/permissions.js';
import { isTicketChannel } from '../features/tickets/ticketManager.js';
import { replyV2 } from '../utils/v2Messages.js';
import { createErrorV2Message } from '../componentsV2/builder.js';

// Import des commandes
import setupCommand from '../commands/admin/setup.js';
import ticketCommand from '../commands/tickets/ticket.js';
import deleteCommand from '../commands/tickets/delete.js';
import renameCommand from '../commands/tickets/rename.js';
import transcriptCommand from '../commands/tickets/transcript.js';
import snippetCommand from '../commands/snippets/snippet.js';
import setupCheckCommand from '../commands/admin/setupCheck.js';

// Collection des commandes
const commands = new Collection<string, Command>();

// Enregistrer toutes les commandes
const commandList: Command[] = [
  setupCommand,
  setupCheckCommand,
  ticketCommand,
  deleteCommand,
  renameCommand,
  transcriptCommand,
  snippetCommand,
];

for (const command of commandList) {
  commands.set(command.data.name, command);
}

export async function registerCommands(_client: Client): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

  const commandsData = commandList.map((cmd) => cmd.data.toJSON());

  try {
    log.info(`Enregistrement de ${commandsData.length} commandes slash...`);

    if (env.DISCORD_GUILD_ID) {
      // Nettoyage des commandes globales existantes pour éviter les doublons visibles
      try {
        await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body: [] });
        log.info('Commandes globales supprimées (mode guild activé)');
      } catch (cleanupError) {
        log.warn('Impossible de supprimer les commandes globales (non bloquant)', cleanupError);
      }

      // Enregistrement sur un serveur spécifique (dev)
      await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID), {
        body: commandsData,
      });
      log.success(`Commandes enregistrées sur le serveur ${env.DISCORD_GUILD_ID}`);
    } else {
      // Enregistrement global
      await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), {
        body: commandsData,
      });
      log.success('Commandes enregistrées globalement');
    }
  } catch (error) {
    log.error('Erreur lors de l\'enregistrement des commandes:', error);
    throw error;
  }
}

export async function handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const command = commands.get(interaction.commandName);

  if (!command) {
    log.warn(`Commande inconnue: ${interaction.commandName}`);
    await replyV2(interaction, createErrorV2Message('Commande inconnue', 'Cette commande n\'existe pas.'));
    return;
  }

  // Log de la commande
  log.command(interaction.commandName, interaction.user.id, interaction.guildId);

  // Vérification: commande admin uniquement
  if (command.adminOnly) {
    if (
      !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) &&
      interaction.user.id !== interaction.guild?.ownerId
    ) {
      await replyV2(
        interaction,
        createErrorV2Message('Accès refusé', 'Cette commande est réservée aux administrateurs.')
      );
      return;
    }
  }

  // Vérification: commande staff uniquement
  if (command.staffOnly && interaction.guildId) {
    const config = getGuildConfig(interaction.guildId);
    if (config && !isStaffMember(interaction.member, config.staffRoleIds)) {
      await replyV2(
        interaction,
        createErrorV2Message('Accès refusé', 'Cette commande est réservée au staff.')
      );
      return;
    }
  }

  // Vérification: commande ticket uniquement
  if (command.ticketOnly && interaction.channel) {
    if (!isTicketChannel(interaction.channel)) {
      await replyV2(
        interaction,
        createErrorV2Message(
          'Contexte invalide',
          'Cette commande ne peut être utilisée que dans un salon de ticket.'
        )
      );
      return;
    }
  }

  // Exécution de la commande
  await command.execute(interaction);
}

