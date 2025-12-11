import { MessageFlags } from 'discord.js';
import {
  createContainer,
  createTextDisplay,
  createSeparator,
  V2MessageOptions,
  COLORS,
} from '../../../componentsV2/builder.js';

/**
 * Template automatique pour les tickets "Activer Eclipse"
 */
export function buildEclipseTemplate(): V2MessageOptions {
  const container = createContainer(COLORS.INFO)
    .addTextDisplayComponents(createTextDisplay('## 🌙 Activation Eclipse'))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        'Pour activer Eclipse sur votre compte, veuillez nous fournir les informations suivantes :'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**1. Capture d\'écran de votre reçu/facture**\n' +
          '   - Le reçu doit être lisible et montrer clairement la transaction\n' +
          '   - Assurez-vous que la date d\'achat est visible'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**2. Identifiant ou email associé**\n' +
          '   - L\'email utilisé lors de l\'achat\n' +
          '   - Ou votre identifiant de compte'
      )
    )
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        '⏳ Notre équipe traitera votre demande dès que possible.\n' +
          '*Merci de patienter et de ne pas ouvrir plusieurs tickets pour la même demande.*'
      )
    );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

