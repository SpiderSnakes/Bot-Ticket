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
 * Snippet de base général
 */
export const generalBaseSnippet: SnippetDefinition = {
  id: 'general_base',
  label: 'Général - Bienvenue',
  description: 'Message de bienvenue général',
  category: 'general',
  plainText:
    "Bonjour et merci d'avoir ouvert un ticket !\n\n" +
    'Un membre de notre équipe prendra en charge votre demande dans les plus brefs délais.\n\n' +
    "En attendant, n'hésitez pas à nous donner un maximum de détails sur votre demande. 😊",
  buildMessage: (): V2MessageOptions => {
    const container = createContainer(COLORS.PRIMARY)
      .addTextDisplayComponents(createTextDisplay('## 👋 Bienvenue !'))
      .addSeparatorComponents(createSeparator())
      .addTextDisplayComponents(
        createTextDisplay(
          'Bonjour et merci d\'avoir ouvert un ticket !\n\n' +
            'Un membre de notre équipe prendra en charge votre demande dans les plus brefs délais.\n\n' +
            'En attendant, n\'hésitez pas à nous donner un maximum de détails sur votre demande. 😊'
        )
      );

    return {
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    };
  },
};

/**
 * Snippet d'attente
 */
export const generalAttenteSnippet: SnippetDefinition = {
  id: 'general_attente',
  label: 'Général - En attente de réponse',
  description: 'Message d\'attente de réponse du membre',
  category: 'general',
  plainText:
    'Nous attendons votre réponse pour pouvoir continuer à vous aider.\n\n' +
    "Si vous n'avez plus besoin d'assistance, vous pouvez fermer ce ticket.\n\n" +
    '*Ce ticket sera automatiquement fermé sous 48h sans réponse.*',
  buildMessage: (): V2MessageOptions => {
    const container = createContainer(COLORS.INFO)
      .addTextDisplayComponents(createTextDisplay('## ⏳ En attente'))
      .addSeparatorComponents(createSeparator())
      .addTextDisplayComponents(
        createTextDisplay(
          'Nous attendons votre réponse pour pouvoir continuer à vous aider.\n\n' +
            'Si vous n\'avez plus besoin d\'assistance, vous pouvez fermer ce ticket.\n\n' +
            '*Ce ticket sera automatiquement fermé sous 48h sans réponse.*'
        )
      );

    return {
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    };
  },
};

/**
 * Snippet de clôture
 */
export const generalCloturerSnippet: SnippetDefinition = {
  id: 'general_cloturer',
  label: 'Général - Clôture du ticket',
  description: 'Message avant fermeture du ticket',
  category: 'general',
  plainText:
    'Votre demande a été traitée avec succès !\n\n' +
    "Si vous avez d'autres questions, n'hésitez pas à ouvrir un nouveau ticket.\n\n" +
    '**Ce ticket va être fermé dans quelques instants.**\n\n' +
    'Merci de nous avoir contactés et bonne continuation ! 🎉',
  buildMessage: (): V2MessageOptions => {
    const container = createContainer(COLORS.SUCCESS)
      .addTextDisplayComponents(createTextDisplay('## ✅ Résolution'))
      .addSeparatorComponents(createSeparator())
      .addTextDisplayComponents(
        createTextDisplay(
          'Votre demande a été traitée avec succès !\n\n' +
            'Si vous avez d\'autres questions, n\'hésitez pas à ouvrir un nouveau ticket.\n\n' +
            '**Ce ticket va être fermé dans quelques instants.**\n\n' +
            'Merci de nous avoir contactés et bonne continuation ! 🎉'
        )
      );

    return {
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    };
  },
};

