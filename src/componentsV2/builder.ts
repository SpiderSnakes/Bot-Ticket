import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  RoleSelectMenuBuilder,
  MessageFlags,
  MessageCreateOptions,
  InteractionReplyOptions,
} from 'discord.js';

// Type pour les components V2
type V2Component =
  | ContainerBuilder
  | TextDisplayBuilder
  | SeparatorBuilder
  | SectionBuilder
  | ActionRowBuilder<StringSelectMenuBuilder>
  | ActionRowBuilder<RoleSelectMenuBuilder>
  | ActionRowBuilder<ButtonBuilder>;

// Types pour les payloads Components V2
export interface V2MessagePayload {
  flags: MessageFlags.IsComponentsV2;
  components: V2Component[];
}

// Type compatible avec les méthodes de discord.js
export type V2MessageOptions = MessageCreateOptions & {
  flags: MessageFlags.IsComponentsV2;
  components: V2Component[];
};

export type V2ReplyOptions = InteractionReplyOptions & {
  flags: MessageFlags.IsComponentsV2;
  components: V2Component[];
};

// Couleurs prédéfinies pour les containers
export const COLORS = {
  PRIMARY: 0x5865f2, // Bleu Discord
  SUCCESS: 0x57f287, // Vert
  WARNING: 0xfee75c, // Jaune
  DANGER: 0xed4245, // Rouge
  INFO: 0x3498db, // Bleu clair
  TICKET: 0x9b59b6, // Violet
};

/**
 * Crée un TextDisplayBuilder avec le contenu spécifié
 */
export function createTextDisplay(content: string): TextDisplayBuilder {
  return new TextDisplayBuilder().setContent(content);
}

/**
 * Crée un SeparatorBuilder
 */
export function createSeparator(
  divider: boolean = true,
  spacing: SeparatorSpacingSize = SeparatorSpacingSize.Small
): SeparatorBuilder {
  return new SeparatorBuilder().setDivider(divider).setSpacing(spacing);
}

/**
 * Crée une section avec texte et thumbnail optionnel
 */
export function createSectionWithThumbnail(
  texts: string[],
  thumbnailUrl?: string
): SectionBuilder {
  const section = new SectionBuilder();

  for (const text of texts) {
    section.addTextDisplayComponents(createTextDisplay(text));
  }

  if (thumbnailUrl) {
    section.setThumbnailAccessory(new ThumbnailBuilder({ media: { url: thumbnailUrl } }));
  }

  return section;
}

/**
 * Crée une section avec texte et bouton accessoire
 */
export function createSectionWithButton(
  texts: string[],
  button: ButtonBuilder
): SectionBuilder {
  const section = new SectionBuilder();

  for (const text of texts) {
    section.addTextDisplayComponents(createTextDisplay(text));
  }

  section.setButtonAccessory(button);

  return section;
}

/**
 * Crée un bouton
 */
export function createButton(options: {
  customId?: string;
  label: string;
  style: ButtonStyle;
  url?: string;
  emoji?: string;
  disabled?: boolean;
}): ButtonBuilder {
  const button = new ButtonBuilder().setLabel(options.label).setStyle(options.style);

  if (options.customId) {
    button.setCustomId(options.customId);
  }

  if (options.url) {
    button.setURL(options.url);
  }

  if (options.emoji) {
    button.setEmoji(options.emoji);
  }

  if (options.disabled) {
    button.setDisabled(options.disabled);
  }

  return button;
}

/**
 * Crée une row de boutons
 */
export function createButtonRow(
  buttons: ButtonBuilder[]
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
}

/**
 * Crée un menu déroulant avec des options
 */
export function createSelectMenu(options: {
  customId: string;
  placeholder: string;
  options: Array<{
    label: string;
    value: string;
    description?: string;
    emoji?: string;
  }>;
  minValues?: number;
  maxValues?: number;
}): ActionRowBuilder<StringSelectMenuBuilder> {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(options.customId)
    .setPlaceholder(options.placeholder);

  if (options.minValues !== undefined) {
    selectMenu.setMinValues(options.minValues);
  }

  if (options.maxValues !== undefined) {
    selectMenu.setMaxValues(options.maxValues);
  }

  const menuOptions = options.options.map((opt) => {
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(opt.label)
      .setValue(opt.value);

    if (opt.description) {
      option.setDescription(opt.description);
    }

    if (opt.emoji) {
      option.setEmoji(opt.emoji);
    }

    return option;
  });

  selectMenu.addOptions(...menuOptions);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
}

/**
 * Crée un container complet avec accent color
 */
export function createContainer(accentColor: number = COLORS.PRIMARY): ContainerBuilder {
  // Pas de couleur : Components V2 sans accentColor
  void accentColor;
  return new ContainerBuilder();
}

/**
 * Crée un message V2 simple avec un container et du texte
 */
export function createSimpleV2Message(
  title: string,
  description: string,
  color: number = COLORS.PRIMARY
): V2MessageOptions {
  void color;
  const container = createContainer(color)
    .addTextDisplayComponents(createTextDisplay(`## ${title}`))
    .addTextDisplayComponents(createTextDisplay(description));

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

/**
 * Crée un message V2 d'erreur
 */
export function createErrorV2Message(
  title: string,
  description: string
): V2MessageOptions {
  return createSimpleV2Message(`❌ ${title}`, description, COLORS.DANGER);
}

/**
 * Crée un message V2 de succès
 */
export function createSuccessV2Message(
  title: string,
  description: string
): V2MessageOptions {
  return createSimpleV2Message(`✅ ${title}`, description, COLORS.SUCCESS);
}

/**
 * Crée un message V2 d'information
 */
export function createInfoV2Message(
  title: string,
  description: string
): V2MessageOptions {
  return createSimpleV2Message(`ℹ️ ${title}`, description, COLORS.INFO);
}

/**
 * Crée un message V2 d'avertissement
 */
export function createWarningV2Message(
  title: string,
  description: string
): V2MessageOptions {
  return createSimpleV2Message(`⚠️ ${title}`, description, COLORS.WARNING);
}

