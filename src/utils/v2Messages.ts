import {
  RepliableInteraction,
  TextChannel,
  MessageFlags,
} from 'discord.js';
import { V2MessageOptions } from '../componentsV2/builder.js';

/**
 * Typage minimal d'un payload Components V2.
 * On réutilise V2MessageOptions (flags + components) pour éviter les envois non V2.
 */
export type V2MessagePayload = V2MessageOptions;

export async function replyV2(interaction: RepliableInteraction, payload: V2MessagePayload) {
  return interaction.reply(payload as any);
}

export async function editReplyV2(
  interaction: RepliableInteraction,
  payload: V2MessagePayload
) {
  return interaction.editReply(payload as any);
}

export async function followUpV2(
  interaction: RepliableInteraction,
  payload: V2MessagePayload
) {
  return interaction.followUp(payload as any);
}

export async function sendV2(channel: TextChannel, payload: V2MessagePayload) {
  // Sécurité : s'assurer que le flag Components V2 est présent.
  if ((payload.flags & MessageFlags.IsComponentsV2) !== MessageFlags.IsComponentsV2) {
    payload.flags = (payload.flags ?? 0) | MessageFlags.IsComponentsV2;
  }
  return channel.send(payload);
}

