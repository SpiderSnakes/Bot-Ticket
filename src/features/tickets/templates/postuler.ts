import { MessageFlags } from 'discord.js';
import {
  createContainer,
  createTextDisplay,
  createSeparator,
  V2MessageOptions,
  COLORS,
} from '../../../componentsV2/builder.js';

/**
 * Template automatique pour les tickets "Postuler"
 */
export function buildPostulerTemplate(): V2MessageOptions {
  const container = createContainer(COLORS.SUCCESS)
    .addTextDisplayComponents(createTextDisplay('## 📝 Candidature'))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        'Merci pour votre intérêt à rejoindre notre équipe ! 🎉'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**Pour que nous puissions étudier votre candidature, veuillez nous fournir :**'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**1. Présentation**\n' +
          '   - Prénom et âge\n' +
          '   - Votre disponibilité (heures/semaine)\n' +
          '   - Votre fuseau horaire'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**2. Expérience**\n' +
          '   - Avez-vous déjà été staff sur d\'autres serveurs ?\n' +
          '   - Si oui, lesquels et quelles étaient vos responsabilités ?\n' +
          '   - Compétences particulières (modération, graphisme, développement...)'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '**3. Motivation**\n' +
          '   - Pourquoi souhaitez-vous rejoindre l\'équipe ?\n' +
          '   - Qu\'est-ce que vous pourriez apporter ?\n' +
          '   - Pour quel poste postulez-vous ?'
      )
    )
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        '📌 **Informations importantes**\n' +
          '• Toutes les candidatures sont étudiées avec attention\n' +
          '• Vous recevrez une réponse sous 7 jours\n' +
          '• En cas de refus, vous pourrez postuler à nouveau après 30 jours'
      )
    )
    .addTextDisplayComponents(
      createTextDisplay(
        '*Bonne chance pour votre candidature !* 🍀'
      )
    );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

