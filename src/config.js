// Загальний конфіг фронтенду

// База API. Підтримує REACT_APP_API_BASE_URL з .env.*
// При відсутності — дефолт на прод:
//   https://api.tasks.fineko.space
export const API_BASE_URL =
    (process.env.REACT_APP_API_BASE_URL || 'https://api.tasks.fineko.space').trim();

// Ключі для сховища токенів (локал/сешн)
export const AUTH = {
    ACCESS_STORAGE_KEY: 'ftasks_access_token',
    REFRESH_STORAGE_KEY: 'ftasks_refresh_token',
};

// Утилітарні прапорці додатку
export const APP = {
    DEBUG: process.env.NODE_ENV !== 'production',
};

// На випадок, якщо десь імпортували як default
const _default = { API_BASE_URL, AUTH, APP };
export default _default;