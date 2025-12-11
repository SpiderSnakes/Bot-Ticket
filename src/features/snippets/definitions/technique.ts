import { MessageFlags } from 'discord.js';
import {
  createContainer,
  createTextDisplay,
  createSeparator,
  V2MessageOptions,
  COLORS,
} from '../../../componentsV2/builder.js';
import { SnippetDefinition } from '../snippetManager.js';

/**
 * Snippet de base pour les problèmes techniques
 */
export const techniqueBaseSnippet: SnippetDefinition = {
  id: 'technique_base',
  label: 'Technique - Réponse initiale',
  description: 'Message de bienvenue et demande d\'informations techniques',
  category: 'technique',
  plainText:
    "Bonjour et merci d'avoir signalé ce problème !\n\n" +
    'Pour nous aider à diagnostiquer le souci, pourriez-vous nous fournir :\n\n' +
    '1. Une description détaillée du problème\n' +
    "2. Des captures d'écran de l'erreur\n" +
    '3. Votre système d’exploitation (Windows, macOS, etc.)\n' +
    '4. Les étapes pour reproduire le bug\n\n' +
    'Plus vous nous donnez d’informations, plus vite nous pourrons vous aider ! 💪',
  buildMessage: (): V2MessageOptions => {
    const container = createContainer(COLORS.INFO)
      .addTextDisplayComponents(createTextDisplay('## 🔧 Support Technique'))
      .addSeparatorComponents(createSeparator())
      .addTextDisplayComponents(
        createTextDisplay(
          'Bonjour et merci d\'avoir signalé ce problème !\n\n' +
            'Pour nous aider à diagnostiquer le souci, pourriez-vous nous fournir :\n\n' +
            '**1.** Une description détaillée du problème\n' +
            '**2.** Des captures d\'écran de l\'erreur\n' +
            '**3.** Votre système d\'exploitation (Windows, macOS, etc.)\n' +
            '**4.** Les étapes pour reproduire le bug\n\n' +
            'Plus vous nous donnez d\'informations, plus vite nous pourrons vous aider ! 💪'
        )
      );

    return {
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    };
  },
};

/**
 * Snippet de vérification pour les problèmes techniques
 */
export const techniqueVerifSnippet: SnippetDefinition = {
  id: 'technique_verif',
  label: 'Technique - Vérifications de base',
  description: 'Liste des vérifications de base à effectuer',
  category: 'technique',
  plainText:
    "Avant d'aller plus loin, pourriez-vous vérifier les points suivants :\n\n" +
    '1. Redémarrer l’application/le navigateur\n' +
    '2. Vider le cache et les cookies\n' +
    '3. Vérifier votre connexion internet\n' +
    "4. Mettre à jour l'application vers la dernière version\n" +
    '5. Désactiver temporairement les extensions/antivirus\n\n' +
    'Si le problème persiste après ces vérifications, merci de nous le signaler ! 🔍',
  buildMessage: (): V2MessageOptions => {
    const container = createContainer(COLORS.INFO)
      .addTextDisplayComponents(createTextDisplay('## ✅ Vérifications de base'))
      .addSeparatorComponents(createSeparator())
      .addTextDisplayComponents(
        createTextDisplay(
          'Avant d\'aller plus loin, pourriez-vous vérifier les points suivants :\n\n' +
            '**1.** Redémarrer l\'application/le navigateur\n' +
            '**2.** Vider le cache et les cookies\n' +
            '**3.** Vérifier votre connexion internet\n' +
            '**4.** Mettre à jour l\'application vers la dernière version\n' +
            '**5.** Désactiver temporairement les extensions/antivirus\n\n' +
            'Si le problème persiste après ces vérifications, merci de nous le signaler ! 🔍'
        )
      );

    return {
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    };
  },
};

