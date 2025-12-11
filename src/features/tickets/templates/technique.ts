import { MessageFlags } from 'discord.js';
import {
  createContainer,
  createTextDisplay,
  createSeparator,
  V2MessageOptions,
  COLORS,
} from '../../../componentsV2/builder.js';

/**
 * Template automatique pour les tickets "Problèmes techniques"
 */
export function buildTechniqueTemplate(): V2MessageOptions {
  const container = createContainer(COLORS.WARNING)
    .addTextDisplayComponents(createTextDisplay('## 🔧 Problème Technique'))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        'Afin de vous aider efficacement, veuillez nous fournir les informations suivantes :'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**1. Description du problème**\n' +
          '   - Décrivez le problème rencontré en détail\n' +
          '   - Quand est-il apparu pour la première fois ?\n' +
          '   - Est-ce que le problème est récurrent ?'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**2. Captures d\'écran**\n' +
          '   - Screenshots du bug/erreur\n' +
          '   - Messages d\'erreur si affichés'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**3. Informations système**\n' +
          '   - Système d\'exploitation (Windows, macOS, Linux, iOS, Android)\n' +
          '   - Version de l\'application/navigateur\n' +
          '   - Appareil utilisé'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**4. Étapes pour reproduire**\n' +
          '   - Décrivez les étapes exactes pour reproduire le problème\n' +
          '   - Cela nous aidera à identifier et corriger le bug plus rapidement'
      )
    )
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        '💡 *Plus vous fournissez d\'informations, plus vite nous pourrons résoudre votre problème !*'
      )
    );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

