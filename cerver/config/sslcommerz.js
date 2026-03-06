import { SslCommerz } from '@siamf/sslcommerz';
import dotenv from 'dotenv';

dotenv.config();

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';

export const sslcz = new SslCommerz(store_id, store_passwd, is_live);

export const BASE_URL = process.env.NGROK_URL || 'http://localhost:5001';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';