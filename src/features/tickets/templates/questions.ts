import { MessageFlags } from 'discord.js';
import {
  createContainer,
  createTextDisplay,
  createSeparator,
  V2MessageOptions,
  COLORS,
} from '../../../componentsV2/builder.js';

/**
 * Template automatique pour les tickets "Questions"
 */
export function buildQuestionsTemplate(): V2MessageOptions {
  const container = createContainer(COLORS.PRIMARY)
    .addTextDisplayComponents(createTextDisplay('## ❓ Question'))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        'Merci d\'avoir ouvert un ticket pour poser votre question !'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**Pour vous aider au mieux, veuillez préciser :**\n\n' +
          '• Le sujet de votre question\n' +
          '• Le contexte de votre demande\n' +
          '• Ce que vous avez déjà essayé (si applicable)'
      )
    )
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        '📚 **Ressources utiles**\n' +
          'Avant de poser votre question, vous pouvez consulter :\n' +
          '• Notre FAQ\n' +
          '• Les salons d\'aide de la communauté\n' +
          '• Notre documentation en ligne'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '⏳ *Un membre de notre équipe vous répondra dès que possible.*'
      )
    );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

