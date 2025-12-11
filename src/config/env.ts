import { config } from 'dotenv';

// Charger les variables d'environnement
config();

interface EnvConfig {
  DISCORD_TOKEN: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_GUILD_ID?: string;
}

function validateEnv(): EnvConfig {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token) {
    throw new Error('DISCORD_TOKEN est manquant dans les variables d\'environnement');
  }

  if (!clientId) {
    throw new Error('DISCORD_CLIENT_ID est manquant dans les variables d\'environnement');
  }

  return {
    DISCORD_TOKEN: token,
    DISCORD_CLIENT_ID: clientId,
    DISCORD_GUILD_ID: guildId || undefined,
  };
}

export const env = validateEnv();

