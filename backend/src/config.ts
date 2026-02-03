export interface AppConfig {
  database: {
    connectionString: string;
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
  };
};
