import { MessageFlags } from 'discord.js';
import {
  createContainer,
  createTextDisplay,
  createSeparator,
  V2MessageOptions,
  COLORS,
} from '../../../componentsV2/builder.js';

/**
 * Template automatique pour les tickets "Autres"
 */
export function buildAutresTemplate(): V2MessageOptions {
  const container = createContainer(COLORS.PRIMARY)
    .addTextDisplayComponents(createTextDisplay('## 📋 Autre demande'))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        'Merci d\'avoir ouvert un ticket !'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**Afin de mieux comprendre votre demande, veuillez préciser :**\n\n' +
          '• La nature de votre demande\n' +
          '• Les détails pertinents\n' +
          '• Ce que vous attendez comme aide'
      )
    )
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        '💡 *Si votre demande concerne un sujet spécifique (activation Eclipse, réduction étudiante, problème technique, question ou candidature), n\'hésitez pas à changer le type de ticket pour un traitement plus rapide.*'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '⏳ *Notre équipe vous répondra dès que possible.*'
      )
    );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

