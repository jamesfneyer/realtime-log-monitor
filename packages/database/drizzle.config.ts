import { dbConfig } from './src/config';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.DATABASE_URL);

const drizzleConfig = {
    dialect: "postgresql",
    schema: "./src/index.ts",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
    verbose: true,
    strict: true,
    out: "./drizzle",
};

export default drizzleConfig;
  