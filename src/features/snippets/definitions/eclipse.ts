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
 * Snippet de base pour Eclipse - première réponse
 */
export const eclipseBaseSnippet: SnippetDefinition = {
  id: 'eclipse_base',
  label: 'Eclipse - Réponse initiale',
  description: 'Message de bienvenue et demande de documents pour Eclipse',
  category: 'eclipse',
  plainText:
    "Bonjour et merci d'avoir ouvert un ticket pour l'activation d'Eclipse !\n\n" +
    "Pour procéder à l'activation, j'ai besoin des éléments suivants :\n\n" +
    "1. Une capture d'écran de votre reçu/facture d'achat\n" +
    "2. L'email ou identifiant associé à votre compte\n\n" +
    "Une fois ces informations reçues, je procéderai à l'activation dans les plus brefs délais. 🚀",
  buildMessage: (): V2MessageOptions => {
    const container = createContainer(COLORS.INFO)
      .addTextDisplayComponents(createTextDisplay('## 🌙 Activation Eclipse'))
      .addSeparatorComponents(createSeparator())
      .addTextDisplayComponents(
        createTextDisplay(
          'Bonjour et merci d\'avoir ouvert un ticket pour l\'activation d\'Eclipse !\n\n' +
            'Pour procéder à l\'activation, j\'ai besoin des éléments suivants :\n\n' +
            '**1.** Une capture d\'écran de votre reçu/facture d\'achat\n' +
            '**2.** L\'email ou identifiant associé à votre compte\n\n' +
            'Une fois ces informations reçues, je procéderai à l\'activation dans les plus brefs délais. 🚀'
        )
      );

    return {
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    };
  },
};

/**
 * Snippet de relance pour Eclipse
 */
export const eclipseRelanceSnippet: SnippetDefinition = {
  id: 'eclipse_relance',
  label: 'Eclipse - Relance',
  description: 'Message de relance si pas de réponse',
  category: 'eclipse',
  plainText:
    'Bonjour !\n\n' +
    'Je me permets de vous relancer concernant votre demande d\'activation Eclipse.\n\n' +
    'Nous n\'avons pas encore reçu les documents nécessaires :\n' +
    "• Capture d'écran du reçu/facture\n" +
    '• Email ou identifiant du compte\n\n' +
    'Sans réponse de votre part sous 48h, ce ticket sera automatiquement fermé.\n\n' +
    'N’hésitez pas à nous contacter si vous avez des questions ! 😊',
  buildMessage: (): V2MessageOptions => {
    const container = createContainer(COLORS.WARNING)
      .addTextDisplayComponents(createTextDisplay('## ⏰ Rappel'))
      .addSeparatorComponents(createSeparator())
      .addTextDisplayComponents(
        createTextDisplay(
          'Bonjour !\n\n' +
            'Je me permets de vous relancer concernant votre demande d\'activation Eclipse.\n\n' +
            'Nous n\'avons pas encore reçu les documents nécessaires :\n' +
            '• Capture d\'écran du reçu/facture\n' +
            '• Email ou identifiant du compte\n\n' +
            'Sans réponse de votre part sous **48h**, ce ticket sera automatiquement fermé.\n\n' +
            'N\'hésitez pas à nous contacter si vous avez des questions ! 😊'
        )
      );

    return {
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    };
  },
};

