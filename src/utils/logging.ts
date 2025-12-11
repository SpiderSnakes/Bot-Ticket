const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function getTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function formatMessage(level: string, color: string, message: string): string {
  return `${colors.bright}[${getTimestamp()}]${colors.reset} ${color}[${level}]${colors.reset} ${message}`;
}

export const log = {
  info: (message: string, ...args: unknown[]): void => {
    console.log(formatMessage('INFO', colors.blue, message), ...args);
  },

  success: (message: string, ...args: unknown[]): void => {
    console.log(formatMessage('SUCCESS', colors.green, message), ...args);
  },

  warn: (message: string, ...args: unknown[]): void => {
    console.warn(formatMessage('WARN', colors.yellow, message), ...args);
  },

  error: (message: string, ...args: unknown[]): void => {
    console.error(formatMessage('ERROR', colors.red, message), ...args);
  },

  debug: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatMessage('DEBUG', colors.magenta, message), ...args);
    }
  },

  command: (commandName: string, userId: string, guildId: string | null): void => {
    console.log(
      formatMessage(
        'CMD',
        colors.cyan,
        `/${commandName} exécutée par ${userId} sur ${guildId || 'DM'}`
      )
    );
  },
};

