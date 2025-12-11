import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextChannel,
  ChannelType,
  MessageFlags,
} from 'discord.js';
import { Command } from '../../types/command.js';
import { getAllSnippets, getSnippetById } from '../../features/snippets/snippetManager.js';
import { createErrorV2Message, createSuccessV2Message } from '../../componentsV2/builder.js';
import { replyV2, editReplyV2, sendV2 } from '../../utils/v2Messages.js';
import { buildSnippetPreviewMessage } from '../../componentsV2/snippets.js';

const snippetCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('snippet')
    .setDescription('Envoie un message prédéfini (raccourci)')
    .addStringOption((option) =>
      option
        .setName('id')
        .setDescription('Le snippet à envoyer')
        .setRequired(true)
        .addChoices(
          ...getAllSnippets().map((snippet) => ({
            name: `[${snippet.category}] ${snippet.label}`,
            value: snippet.id,
          }))
        )
    )
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('Mode d\'envoi du message')
        .setRequired(false)
        .addChoices(
          { name: 'Envoyer par le bot', value: 'bot' },
          { name: 'Aperçu privé (pour copier)', value: 'ephemere' }
        )
    ),

  staffOnly: true,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const snippetId = interaction.options.getString('id', true);
    const mode = interaction.options.getString('mode') || 'bot';

    const snippet = getSnippetById(snippetId);

    if (!snippet) {
      await replyV2(
        interaction,
        createErrorV2Message('Snippet introuvable', 'Le snippet demandé n\'existe pas.')
      );
      return;
    }

    const messagePayload = snippet.buildMessage();

    if (mode === 'ephemere') {
      // Mode aperçu : envoyer en ephemeral pour que le staff puisse voir/copier
      if (snippet.plainText) {
        const preview = buildSnippetPreviewMessage(snippet.label, snippet.plainText, 'txt');
        await replyV2(interaction, { ...preview, flags: preview.flags | MessageFlags.Ephemeral });
      } else {
        await replyV2(
          interaction,
          { ...messagePayload, flags: messagePayload.flags | MessageFlags.Ephemeral }
        );
      }
    } else {
      // Mode bot : envoyer directement dans le salon
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
        await editReplyV2(
          interaction,
          createErrorV2Message('Envoi impossible', 'Impossible d\'envoyer le message dans ce salon.')
        );
        return;
      }

      await sendV2(interaction.channel as TextChannel, messagePayload);

      await editReplyV2(
        interaction,
        createSuccessV2Message('Snippet envoyé', `Le snippet \`${snippet.label}\` a été envoyé.`)
      );
    }
  },
};

export default snippetCommand;

