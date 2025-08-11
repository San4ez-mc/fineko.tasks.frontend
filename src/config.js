import { API_BASE_URL } from "./config/env";

export const AUTH = {
    ACCESS_STORAGE_KEY: 'ftasks_access_token',
    REFRESH_STORAGE_KEY: 'ftasks_refresh_token',
};

export const APP = {
    DEBUG: process.env.NODE_ENV !== 'production',
};

export { API_BASE_URL };

const config = { API_BASE_URL, AUTH, APP };
export default config;
