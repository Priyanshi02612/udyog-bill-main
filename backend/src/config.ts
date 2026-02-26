export interface AppConfig {
  database: {
    connectionString: string;
  };
  mailer: {
    host: string;
    port: number;
    secure: boolean;
    pool: {
      maxConnections: number;
      maxMessages: number;
      rateDelta: number;
      rateLimit: number;
    };
    timeoutMs: {
      connection: number;
      greeting: number;
      socket: number;
      dns: number;
      send: number;
    };
    auth: {
      user: string;
      pass: string;
    };
  };
}

export default (): AppConfig => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  return {
    database: {
      connectionString: databaseUrl,
    },
    mailer: {
      host: process.env.MAIL_HOST ?? '',
      port: Number(process.env.MAIL_PORT ?? 587),
      secure: process.env.MAIL_SECURE === 'true',
      pool: {
        maxConnections: Number(process.env.MAIL_MAX_CONNECTIONS ?? 5),
        maxMessages: Number(process.env.MAIL_MAX_MESSAGES ?? 100),
        rateDelta: Number(process.env.MAIL_RATE_DELTA ?? 1000),
        rateLimit: Number(process.env.MAIL_RATE_LIMIT ?? 5),
      },
      timeoutMs: {
        connection: Number(process.env.MAIL_CONNECTION_TIMEOUT ?? 10000),
        greeting: Number(process.env.MAIL_GREETING_TIMEOUT ?? 5000),
        socket: Number(process.env.MAIL_SOCKET_TIMEOUT ?? 20000),
        dns: Number(process.env.MAIL_DNS_TIMEOUT ?? 5000),
        send: Number(process.env.MAIL_SEND_TIMEOUT ?? 12000),
      },
      auth: {
        user: process.env.MAIL_USER ?? '',
        pass: process.env.MAIL_PASSWORD ?? '',
      },
    },
  };
};
