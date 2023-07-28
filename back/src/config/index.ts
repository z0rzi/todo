import { config } from 'dotenv';
config({ path: `.env` });
import path from 'path';

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN, API_KEY } = process.env;
export const dbPath = path.join(__dirname, '../../todo.db');
