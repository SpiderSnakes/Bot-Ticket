import { Guild, TextChannel, CategoryChannel } from 'discord.js';
import { TicketType } from './ticketTypes.js';

/**
 * Simplifie un pseudo pour le nom de salon
 * - Convertit en minuscules
 * - Remplace les espaces par des tirets
 * - Supprime les caractères spéciaux
 * - Limite à 20 caractères
 */
export function simplifyUsername(username: string): string {
  return username
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 20);
}

/**
 * Compte le nombre de tickets existants pour un utilisateur et un type donné
 */
export function countExistingTickets(
  category: CategoryChannel,
  prefix: string,
  simplifiedUsername: string
): number {
  const pattern = new RegExp(`^${prefix}-${simplifiedUsername}(-\\d+)?$`);
  
  let count = 0;
  category.children.cache.forEach((channel) => {
    if (channel instanceof TextChannel && pattern.test(channel.name)) {
      count++;
    }
  });

  return count;
}

/**
 * Génère un nom de salon pour un ticket
 * Format: <prefix>-<pseudo>[-<index>]
 */
export function generateTicketChannelName(
  guild: Guild,
  ticketType: TicketType,
  username: string,
  categoryId: string
): string {
  const prefix = ticketType.channelPrefix;
  const simplifiedUsername = simplifyUsername(username);
  
  // Récupérer la catégorie
  const category = guild.channels.cache.get(categoryId);
  
  if (!category || !(category instanceof CategoryChannel)) {
    // Si pas de catégorie, retourne le nom simple
    return `${prefix}-${simplifiedUsername}`;
  }

  // Compter les tickets existants
  const existingCount = countExistingTickets(category, prefix, simplifiedUsername);

  if (existingCount === 0) {
    return `${prefix}-${simplifiedUsername}`;
  }

  return `${prefix}-${simplifiedUsername}-${existingCount + 1}`;
}

/**
 * Extrait les informations d'un nom de salon de ticket
 */
export function parseTicketChannelName(
  channelName: string
): { prefix: string; username: string; index: number | null } | null {
  const match = channelName.match(/^([a-z]+)-([a-z0-9-]+?)(?:-(\d+))?$/);

  if (!match) {
    return null;
  }

  return {
    prefix: match[1],
    username: match[2],
    index: match[3] ? parseInt(match[3], 10) : null,
  };
}

