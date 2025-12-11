import { MessageFlags } from 'discord.js';
import {
  createContainer,
  createTextDisplay,
  createSeparator,
  V2MessageOptions,
  COLORS,
} from '../../../componentsV2/builder.js';

export function buildEclipseTemplate(): V2MessageOptions {
  const container = createContainer(COLORS.INFO)
    .addTextDisplayComponents(
      createTextDisplay('## 🌙 Activation Eclipse')
    )
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        'Pour activer Eclipse sur votre compte, merci de nous envoyer une capture d’écran **claire et lisible** de votre reçu d’achat. 😊'
      )
    );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}
