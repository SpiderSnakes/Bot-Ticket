import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextChannel,
  AttachmentBuilder,
  Message,
  Collection,
  MessageFlags,
} from 'discord.js';
import { Command } from '../../types/command.js';
import { getGuildConfig } from '../../config/guildConfig.js';
import { createSuccessV2Message, createErrorV2Message } from '../../componentsV2/builder.js';
import { log } from '../../utils/logging.js';
import { replyV2, editReplyV2 } from '../../utils/v2Messages.js';

const transcriptCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('transcript')
    .setDescription('Génère un transcript de ce ticket')
    .addStringOption((option) =>
      option
        .setName('format')
        .setDescription('Format du fichier de transcript')
        .setRequired(false)
        .addChoices(
          { name: 'Texte (.txt)', value: 'txt' },
          { name: 'Markdown (.md)', value: 'md' }
        )
    )
    .addUserOption((option) =>
      option
        .setName('envoyer_a')
        .setDescription('Envoyer le transcript en MP à cet utilisateur')
        .setRequired(false)
    ),

  staffOnly: true,
  ticketOnly: true,

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await replyV2(
        interaction,
        createErrorV2Message(
          'Contexte invalide',
          'Cette commande ne peut être utilisée que sur un serveur.'
        )
      );
      return;
    }

    const config = getGuildConfig(interaction.guild.id);
    if (!config) {
      await replyV2(
        interaction,
        createErrorV2Message('Configuration manquante', 'Le système de tickets est absent.')
      );
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const format = (interaction.options.getString('format') || 'txt') as 'txt' | 'md';
    const targetUser = interaction.options.getUser('envoyer_a');
    const channel = interaction.channel as TextChannel;

    try {
      // Récupérer tous les messages du salon
      const messages = await fetchAllMessages(channel);

      // Générer le transcript
      const transcriptContent = generateTranscript(messages, format, channel.name);
      const fileName = `transcript-${channel.name}-${Date.now()}.${format}`;

      // Créer le fichier
      const attachment = new AttachmentBuilder(Buffer.from(transcriptContent, 'utf-8'), {
        name: fileName,
      });

      // Envoyer dans le salon des transcripts
      const transcriptChannel = interaction.guild.channels.cache.get(
        config.transcriptChannelId
      ) as TextChannel | undefined;

      if (transcriptChannel) {
        await transcriptChannel.send({
          content: `📄 **Transcript du ticket** \`${channel.name}\`\n` +
            `Généré par ${interaction.user} le ${new Date().toLocaleDateString('fr-FR')}`,
          files: [attachment],
        });
      }

      // Si un utilisateur est spécifié, envoyer en MP
      if (targetUser) {
        try {
          const dmAttachment = new AttachmentBuilder(Buffer.from(transcriptContent, 'utf-8'), {
            name: fileName,
          });

          await targetUser.send({
            content: `📄 **Transcript du ticket** \`${channel.name}\` de ${interaction.guild.name}`,
            files: [dmAttachment],
          });

          log.info(`Transcript envoyé en MP à ${targetUser.tag}`);
        } catch {
          log.warn(`Impossible d'envoyer le transcript en MP à ${targetUser.tag}`);
        }
      }

      const successMessage = createSuccessV2Message(
        'Transcript généré !',
        `Le transcript a été généré avec succès.\n\n` +
          `📁 **Fichier :** \`${fileName}\`\n` +
          `📊 **Messages :** ${messages.size}\n` +
          (transcriptChannel ? `📤 **Envoyé dans :** <#${transcriptChannel.id}>\n` : '') +
          (targetUser ? `📨 **Envoyé en MP à :** ${targetUser}` : '')
      );

      await editReplyV2(interaction, successMessage);
    } catch (error) {
      log.error('Erreur lors de la génération du transcript:', error);

      const errorMessage = createErrorV2Message(
        'Erreur',
        'Impossible de générer le transcript.'
      );

      await editReplyV2(interaction, errorMessage);
    }
  },
};

/**
 * Récupère tous les messages d'un salon
 */
async function fetchAllMessages(channel: TextChannel): Promise<Collection<string, Message>> {
  const allMessages = new Collection<string, Message>();
  let lastId: string | undefined;

  while (true) {
    const options: { limit: number; before?: string } = { limit: 100 };
    if (lastId) {
      options.before = lastId;
    }

    const messages = await channel.messages.fetch(options);

    if (messages.size === 0) {
      break;
    }

    messages.forEach((msg) => allMessages.set(msg.id, msg));
    lastId = messages.last()?.id;

    if (messages.size < 100) {
      break;
    }
  }

  return allMessages;
}

/**
 * Génère le contenu du transcript
 */
function generateTranscript(
  messages: Collection<string, Message>,
  format: 'txt' | 'md',
  channelName: string
): string {
  // Trier les messages par date (du plus ancien au plus récent)
  const sortedMessages = [...messages.values()].sort(
    (a, b) => a.createdTimestamp - b.createdTimestamp
  );

  if (format === 'md') {
    return generateMarkdownTranscript(sortedMessages, channelName);
  }

  return generateTextTranscript(sortedMessages, channelName);
}

/**
 * Génère un transcript au format texte
 */
function generateTextTranscript(messages: Message[], channelName: string): string {
  const lines: string[] = [
    `========================================`,
    `TRANSCRIPT - ${channelName}`,
    `Généré le ${new Date().toLocaleString('fr-FR')}`,
    `Nombre de messages: ${messages.length}`,
    `========================================`,
    '',
  ];

  for (const msg of messages) {
    const date = msg.createdAt.toLocaleString('fr-FR');
    const author = msg.author.tag;
    const content = msg.content || '[Aucun contenu textuel]';

    lines.push(`[${date}] ${author}:`);
    lines.push(content);

    // Ajouter les pièces jointes
    if (msg.attachments.size > 0) {
      lines.push(`[Pièces jointes: ${msg.attachments.map((a) => a.name).join(', ')}]`);
    }

    // Ajouter les embeds (juste le titre s'il y en a)
    if (msg.embeds.length > 0) {
      lines.push(`[${msg.embeds.length} embed(s)]`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Génère un transcript au format Markdown
 */
function generateMarkdownTranscript(messages: Message[], channelName: string): string {
  const lines: string[] = [
    `# Transcript - ${channelName}`,
    '',
    `> Généré le ${new Date().toLocaleString('fr-FR')}`,
    `> Nombre de messages: ${messages.length}`,
    '',
    '---',
    '',
  ];

  for (const msg of messages) {
    const date = msg.createdAt.toLocaleString('fr-FR');
    const author = msg.author.tag;
    const content = msg.content || '*[Aucun contenu textuel]*';

    lines.push(`### ${author}`);
    lines.push(`*${date}*`);
    lines.push('');
    lines.push(content);

    // Ajouter les pièces jointes
    if (msg.attachments.size > 0) {
      lines.push('');
      lines.push('**Pièces jointes:**');
      msg.attachments.forEach((attachment) => {
        lines.push(`- [${attachment.name}](${attachment.url})`);
      });
    }

    // Ajouter les embeds
    if (msg.embeds.length > 0) {
      lines.push('');
      lines.push(`*[${msg.embeds.length} embed(s)]*`);
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

export default transcriptCommand;

