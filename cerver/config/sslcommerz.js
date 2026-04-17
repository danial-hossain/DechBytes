// cerver/config/sslcommerz.js
import axios from 'axios';
import querystring from 'querystring';
import dotenv from 'dotenv';

dotenv.config();

const store_id = process.env.SSLCOMMERZ_STORE_ID || 'testbox';
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || 'qwerty123';
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';

export const BASE_URL = process.env.NGROK_URL || 'http://localhost:5001';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// SSLCommerz API URLs
const API_URL = is_live 
    ? 'https://secure.sslcommerz.com/gwprocess/v4/api.php'
    : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

const VALIDATION_URL = is_live
    ? 'https://secure.sslcommerz.com/validator/api/validationserverAPI.php'
    : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

// কাস্টম SSLCommerz ক্লাস
class SSLCommerzService {
    async init(paymentData) {
        try {
            const postData = {
                store_id: store_id,
                store_passwd: store_passwd,
                ...paymentData
            };
            
            console.log('🔵 SSLCommerz Request URL:', API_URL);
            console.log('🔵 Store ID:', store_id);
            console.log('🔵 Payment Data:', { ...postData, store_passwd: '******' });
            
            const response = await axios.post(
                API_URL,
                querystring.stringify(postData),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    timeout: 30000
                }
            );
            
            console.log('🟢 SSLCommerz Response Status:', response.data?.status);
            
            return response.data;
        } catch (error) {
            console.error('🔴 SSLCommerz Init Error:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    async validate(validationData) {
        try {
            const postData = {
                store_id: store_id,
                store_passwd: store_passwd,
                format: 'json',
                ...validationData
            };
            
            console.log('🔵 Validation Request:', { ...postData, store_passwd: '******' });
            
            const response = await axios.post(
                VALIDATION_URL,
                querystring.stringify(postData),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout: 30000
                }
            );
            
            console.log('🟢 Validation Response:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('🔴 Validation Error:', error.message);
            throw error;
        }
    }
}

export const sslcz = new SSLCommerzService();