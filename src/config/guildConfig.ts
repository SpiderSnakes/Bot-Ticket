import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { log } from '../utils/logging.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface GuildConfig {
  guildId: string;
  ticketBaseChannelId: string;
  ticketCategoryId: string;
  transcriptChannelId: string;
  staffRoleIds: string[];
  ticketPanelMessageId?: string;
}

interface ConfigStore {
  guilds: Record<string, GuildConfig>;
}

// Chemin vers le fichier de configuration
const DATA_DIR = join(__dirname, '../../data');
const CONFIG_FILE = join(DATA_DIR, 'guilds.json');

/**
 * Assure que le dossier data existe
 */
function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Charge la configuration depuis le fichier
 */
function loadConfig(): ConfigStore {
  ensureDataDir();

  if (!existsSync(CONFIG_FILE)) {
    return { guilds: {} };
  }

  try {
    const data = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data) as ConfigStore;
  } catch (error) {
    log.error('Erreur lors du chargement de la configuration:', error);
    return { guilds: {} };
  }
}

/**
 * Sauvegarde la configuration dans le fichier
 */
function saveConfig(config: ConfigStore): void {
  ensureDataDir();

  try {
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    log.error('Erreur lors de la sauvegarde de la configuration:', error);
  }
}

/**
 * Récupère la configuration d'un serveur
 */
export function getGuildConfig(guildId: string): GuildConfig | null {
  const config = loadConfig();
  return config.guilds[guildId] || null;
}

/**
 * Enregistre ou met à jour la configuration d'un serveur
 */
export function setGuildConfig(config: GuildConfig): void {
  const store = loadConfig();
  store.guilds[config.guildId] = config;
  saveConfig(store);
  log.info(`Configuration mise à jour pour le serveur ${config.guildId}`);
}

/**
 * Met à jour partiellement la configuration d'un serveur
 */
export function updateGuildConfig(
  guildId: string,
  updates: Partial<Omit<GuildConfig, 'guildId'>>
): GuildConfig | null {
  const existing = getGuildConfig(guildId);

  if (!existing) {
    return null;
  }

  const updated: GuildConfig = {
    ...existing,
    ...updates,
  };

  setGuildConfig(updated);
  return updated;
}

/**
 * Supprime la configuration d'un serveur
 */
export function deleteGuildConfig(guildId: string): boolean {
  const store = loadConfig();

  if (!store.guilds[guildId]) {
    return false;
  }

  delete store.guilds[guildId];
  saveConfig(store);
  log.info(`Configuration supprimée pour le serveur ${guildId}`);
  return true;
}

/**
 * Vérifie si un serveur est configuré
 */
export function isGuildConfigured(guildId: string): boolean {
  return getGuildConfig(guildId) !== null;
}

/**
 * Met à jour l'ID du message de panneau de tickets
 */
export function setTicketPanelMessageId(guildId: string, messageId: string): void {
  updateGuildConfig(guildId, { ticketPanelMessageId: messageId });
}

