export interface AppConfig {
  database: {
    connectionString: string;
  };
  mailer: {
    host: string;
    port: number;
    secure: boolean;
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
      auth: {
        user: process.env.MAIL_USER ?? '',
        pass: process.env.MAIL_PASSWORD ?? '',
      },
    },
  };
};
