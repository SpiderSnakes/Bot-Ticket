import { MessageFlags } from 'discord.js';
import {
  createContainer,
  createTextDisplay,
  createSeparator,
  V2MessageOptions,
  COLORS,
} from '../../../componentsV2/builder.js';

/**
 * Template automatique pour les tickets "Réduction étudiante"
 */
export function buildEtudiantTemplate(): V2MessageOptions {
  const container = createContainer(COLORS.INFO)
    .addTextDisplayComponents(createTextDisplay('## 🎓 Réduction Étudiante'))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        'Pour bénéficier de la réduction étudiante, veuillez nous fournir les documents suivants :'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**1. Justificatif de scolarité**\n' +
          '   - Carte étudiante en cours de validité\n' +
          '   - OU certificat de scolarité de l\'année en cours\n' +
          '   - OU relevé de notes récent'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**2. Informations requises**\n' +
          '   - Votre nom complet (tel qu\'il apparaît sur le justificatif)\n' +
          '   - Votre établissement scolaire\n' +
          '   - L\'email associé à votre compte'
      )
    )
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        '🔒 **Confidentialité**\n' +
          'Vos documents seront traités de manière confidentielle et ne seront utilisés que pour la vérification de votre statut étudiant.'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '⏳ *Le traitement de votre demande peut prendre jusqu\'à 48h ouvrées.*'
      )
    );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

