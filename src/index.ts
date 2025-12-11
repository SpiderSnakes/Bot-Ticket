import { env } from './config/env.js';
import { createClient } from './client.js';
import { registerCommands, handleCommand } from './core/commandHandler.js';
import { handleInteraction } from './core/interactionHandler.js';
import { log } from './utils/logging.js';
import { replyV2 } from './utils/v2Messages.js';
import { createErrorV2Message } from './componentsV2/builder.js';

const client = createClient();

// Événement: Bot prêt
client.once('clientReady', async () => {
  if (!client.user) return;

  log.info(`Bot connecté en tant que ${client.user.tag}`);

  // Enregistrer les commandes slash
  await registerCommands(client);

  log.success('Bot prêt et opérationnel !');
});

// Événement: Interaction (slash commands, boutons, menus, modals)
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    } else {
      await handleInteraction(interaction);
    }
  } catch (error) {
    log.error('Erreur lors du traitement de l\'interaction:', error);

    // Répondre à l'utilisateur en cas d'erreur
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await replyV2(
        interaction,
        createErrorV2Message(
          'Erreur',
          'Une erreur est survenue lors du traitement de votre demande.'
        )
      );
    }
  }
});

// Gestion des erreurs non capturées
client.on('error', (error) => {
  log.error('Erreur client Discord:', error);
});

process.on('unhandledRejection', (error) => {
  log.error('Promesse rejetée non gérée:', error);
});

// Connexion du bot
client.login(env.DISCORD_TOKEN);

