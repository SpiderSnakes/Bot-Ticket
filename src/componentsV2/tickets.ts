import {
  ButtonStyle,
  MessageFlags,
  User,
} from 'discord.js';
import {
  createContainer,
  createTextDisplay,
  createSeparator,
  createSelectMenu,
  createButton,
  createButtonRow,
  V2MessageOptions,
  COLORS,
} from './builder.js';
import { TICKET_TYPES, TicketType } from '../features/tickets/ticketTypes.js';

/**
 * Construit le message de base (panneau) pour le salon de création de tickets
 */
export function buildTicketPanelMessage(): V2MessageOptions {
  const container = createContainer(COLORS.TICKET)
    .addTextDisplayComponents(createTextDisplay('## 🎫 Ouvrir un ticket'))
    .addTextDisplayComponents(
      createTextDisplay(
        'Besoin d\'aide ? Sélectionnez le sujet de votre demande ci-dessous pour ouvrir un ticket.'
      )
    )
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        '📌 **Comment ça marche ?**\n' +
          '1. Choisissez le type de ticket correspondant à votre demande\n' +
          '2. Un salon privé sera créé pour vous\n' +
          '3. Décrivez votre problème et notre équipe vous répondra rapidement'
      )
    );

  const selectMenu = createSelectMenu({
    customId: 'ticket_type_select',
    placeholder: '📋 Sélectionnez un type de ticket...',
    options: TICKET_TYPES.map((type) => ({
      label: type.label,
      value: type.id,
      description: type.description,
      emoji: type.emoji,
    })),
  });

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container, selectMenu],
  };
}

/**
 * Construit le message initial dans un salon de ticket
 */
export function buildTicketInitialMessage(
  ticketType: TicketType,
  user: User
): V2MessageOptions {
  const container = createContainer(COLORS.TICKET)
    .addTextDisplayComponents(createTextDisplay(`${user}`))
    .addTextDisplayComponents(
      createTextDisplay(`## 🎫 Ticket – ${ticketType.label}`)
    )
    .addTextDisplayComponents(
      createTextDisplay(`Bienvenue ${user} ! Ce ticket a été créé pour votre demande.`)
    )
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(
      createTextDisplay(
        '📝 **Veuillez décrire votre demande en détail.**\n' +
          'Notre équipe vous répondra dès que possible.\n\n' +
          '*Un message avec des instructions spécifiques sera envoyé dans quelques instants.*'
      )
    );

  const buttons = createButtonRow([
    createButton({
      customId: 'ticket_close',
      label: 'Fermer le ticket',
      style: ButtonStyle.Danger,
      emoji: '🔒',
    }),
    createButton({
      customId: 'ticket_change_type_btn',
      label: 'Changer le type',
      style: ButtonStyle.Secondary,
      emoji: '🔄',
    }),
  ]);

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container, buttons],
  };
}

/**
 * Construit le message de sélection pour changer le type de ticket
 */
export function buildTicketTypeChangeMessage(): V2MessageOptions {
  const container = createContainer(COLORS.INFO)
    .addTextDisplayComponents(createTextDisplay('## 🔄 Changer le type de ticket'))
    .addTextDisplayComponents(
      createTextDisplay('Sélectionnez le nouveau type pour ce ticket :')
    );

  const selectMenu = createSelectMenu({
    customId: 'ticket_change_type',
    placeholder: '📋 Sélectionnez un nouveau type...',
    options: TICKET_TYPES.map((type) => ({
      label: type.label,
      value: type.id,
      description: type.description,
      emoji: type.emoji,
    })),
  });

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container, selectMenu],
  };
}

/**
 * Construit le message de confirmation de fermeture
 */
export function buildTicketCloseConfirmMessage(): V2MessageOptions {
  const container = createContainer(COLORS.WARNING)
    .addTextDisplayComponents(createTextDisplay('## ⚠️ Confirmation de fermeture'))
    .addTextDisplayComponents(
      createTextDisplay(
        'Êtes-vous sûr de vouloir fermer ce ticket ?\n' +
          'Cette action est irréversible et le salon sera supprimé.'
      )
    );

  const buttons = createButtonRow([
    createButton({
      customId: 'ticket_close_confirm',
      label: 'Confirmer la fermeture',
      style: ButtonStyle.Danger,
      emoji: '🗑️',
    }),
    createButton({
      customId: 'ticket_close_cancel',
      label: 'Annuler',
      style: ButtonStyle.Secondary,
      emoji: '❌',
    }),
  ]);

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container, buttons],
  };
}

/**
 * Construit le message de changement de type réussi
 */
export function buildTicketTypeChangedMessage(
  oldType: TicketType,
  newType: TicketType,
  changedBy: User
): V2MessageOptions {
  const container = createContainer(COLORS.INFO)
    .addTextDisplayComponents(createTextDisplay('## 🔄 Type de ticket modifié'))
    .addTextDisplayComponents(
      createTextDisplay(
        `Le type de ce ticket a été changé par ${changedBy}.\n\n` +
          `**Ancien type :** ${oldType.emoji} ${oldType.label}\n` +
          `**Nouveau type :** ${newType.emoji} ${newType.label}`
      )
    );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

/**
 * Construit le message indiquant que le salon va être supprimé
 */
export function buildTicketClosingMessage(): V2MessageOptions {
  const container = createContainer(COLORS.DANGER)
    .addTextDisplayComponents(createTextDisplay('## 🔒 Fermeture du ticket'))
    .addTextDisplayComponents(
      createTextDisplay(
        '⏳ Ce ticket va être fermé et le salon supprimé dans **5 secondes**...'
      )
    );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

/**
 * Construit le message de ticket créé (réponse ephemeral)
 */
export function buildTicketCreatedMessage(channelId: string): V2MessageOptions {
  const container = createContainer(COLORS.SUCCESS)
    .addTextDisplayComponents(createTextDisplay('## ✅ Ticket créé !'))
    .addTextDisplayComponents(
      createTextDisplay(`Votre ticket a été créé avec succès.\n\n👉 Rendez-vous dans <#${channelId}>`)
    );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

