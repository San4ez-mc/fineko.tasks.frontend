// Єдина точка формування базового URL API.
// Порядок пріоритетів:
// 1) REACT_APP_API_BASE_URL з .env.*
// 2) window.__API_BASE_URL__ (якщо інжектуєш з index.html)
// 3) дефолтний прод-URL

const fromEnv = (process.env.REACT_APP_API_BASE_URL || "").trim();
const fromWindow =
    typeof window !== "undefined" && window.__API_BASE_URL__
        ? String(window.__API_BASE_URL__).trim()
        : "";

const raw = fromEnv || fromWindow || "https://api.tasks.fineko.space";

// Приберемо кінцеві слеші, щоб не було // у запитах
export const API_BASE_URL = raw.replace(/\/+$/, "");

// Telegram Bot Token (за потреби)
const telegramBotTokenEnv = (
    process.env.REACT_APP_TELEGRAM_BOT_TOKEN || ""
).trim();
const telegramBotTokenWindow =
    typeof window !== "undefined" && window.__TELEGRAM_BOT_TOKEN__
        ? String(window.__TELEGRAM_BOT_TOKEN__).trim()
        : "";
export const TELEGRAM_BOT_TOKEN =
    telegramBotTokenEnv || telegramBotTokenWindow || "";

// Можеш додати тут інші конфіги за потреби, напр. таймаути тощо.
// export const REQUEST_TIMEOUT_MS = 20000;

const env = { API_BASE_URL, telegramBotToken: TELEGRAM_BOT_TOKEN };
export default env;
