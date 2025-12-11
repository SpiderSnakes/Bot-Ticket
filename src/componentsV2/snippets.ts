import { MessageFlags } from 'discord.js';
import {
  createContainer,
  createTextDisplay,
  createSeparator,
  V2MessageOptions,
  COLORS,
} from './builder.js';

/**
 * Construit un message snippet simple
 */
export function buildSnippetMessage(
  title: string,
  content: string,
  color: number = COLORS.PRIMARY
): V2MessageOptions {
  void color;
  const container = createContainer(color)
    .addTextDisplayComponents(createTextDisplay(`## ${title}`))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(createTextDisplay(content));

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

/**
 * Construit un message snippet avec plusieurs sections
 */
export function buildSnippetMessageWithSections(
  title: string,
  sections: Array<{ title?: string; content: string }>,
  color: number = COLORS.PRIMARY
): V2MessageOptions {
  void color;
  const container = createContainer(color).addTextDisplayComponents(
    createTextDisplay(`## ${title}`)
  );

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    if (i > 0 || section.title) {
      container.addSeparatorComponents(createSeparator());
    }

    if (section.title) {
      container.addTextDisplayComponents(createTextDisplay(`### ${section.title}`));
    }

    container.addTextDisplayComponents(createTextDisplay(section.content));
  }

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

/**
 * Construit un message snippet avec liste à puces
 */
export function buildSnippetMessageWithList(
  title: string,
  introduction: string,
  items: string[],
  conclusion?: string,
  color: number = COLORS.PRIMARY
): V2MessageOptions {
  void color;
  const listContent = items.map((item) => `• ${item}`).join('\n');

  let fullContent = introduction + '\n\n' + listContent;

  if (conclusion) {
    fullContent += '\n\n' + conclusion;
  }

  return buildSnippetMessage(title, fullContent, color);
}

/**
 * Construit un message d'aperçu (preview) avec un bloc de code
 * pour permettre au staff de copier facilement le snippet.
 */
export function buildSnippetPreviewMessage(
  title: string,
  plainText: string,
  language: 'txt' | 'md' = 'txt'
): V2MessageOptions {
  const container = createContainer()
    .addTextDisplayComponents(createTextDisplay(`## ${title}`))
    .addSeparatorComponents(createSeparator())
    .addTextDisplayComponents(createTextDisplay('```' + language + '\n' + plainText + '\n```'));

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

