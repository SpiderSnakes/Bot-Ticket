import {
  RepliableInteraction,
  TextChannel,
  MessageFlags,
  Message,
} from 'discord.js';
import { V2MessageOptions } from '../componentsV2/builder.js';

/**
 * Typage minimal d'un payload Components V2.
 * On réutilise V2MessageOptions (flags + components) pour éviter les envois non V2.
 */
export type V2MessagePayload = V2MessageOptions;

export async function replyV2(
  interaction: RepliableInteraction,
  payload: V2MessagePayload
): Promise<unknown> {
  return interaction.reply(payload);
}

export async function editReplyV2(
  interaction: RepliableInteraction,
  payload: V2MessagePayload
): Promise<unknown> {
  return interaction.editReply(payload);
}

export async function followUpV2(
  interaction: RepliableInteraction,
  payload: V2MessagePayload
): Promise<unknown> {
  return interaction.followUp(payload);
}

export async function sendV2(
  channel: TextChannel,
  payload: V2MessagePayload
): Promise<Message<boolean>> {
  // Sécurité : s'assurer que le flag Components V2 est présent.
  if ((payload.flags & MessageFlags.IsComponentsV2) !== MessageFlags.IsComponentsV2) {
    payload.flags = (payload.flags ?? 0) | MessageFlags.IsComponentsV2;
  }
  return channel.send(payload);
}

