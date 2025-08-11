import axios from "axios";
import { API_BASE_URL } from "../../config"; // джерело правди

// ВАЖЛИВО: без withCredentials (кукі не шлемо)
const client = axios.create({
    baseURL: API_BASE_URL.replace(/\/+$/, ""), // прибираємо кінцевий /
    headers: { Accept: "application/json" },
    // withCredentials: false  // не вмикати
});

// Додаємо токен з localStorage (де ти вже його зберігаєш після логіну)
client.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Опційно: авто-оновлення токена (якщо у тебе є /auth/refresh)
let isRefreshing = false;
let queue = [];
client.interceptors.response.use(
    (r) => r,
    async (error) => {
        const { response, config } = error || {};
        if (response?.status === 401 && !config._retry) {
            if (isRefreshing) {
                return new Promise((res, rej) => queue.push({ res, rej })).then(() => {
                    config.headers.Authorization = `Bearer ${localStorage.getItem("access_token") || ""}`;
                    return client(config);
                });
            }
            config._retry = true;
            isRefreshing = true;
            try {
                const refreshToken = localStorage.getItem("refresh_token");
                if (!refreshToken) throw error;
                const r = await axios.post(`${API_BASE_URL.replace(/\/+$/, "")}/auth/refresh`, { refresh_token: refreshToken });
                const newAccess = r.data?.access_token;
                if (!newAccess) throw error;
                localStorage.setItem("access_token", newAccess);
                queue.forEach(({ res }) => res());
                queue = [];
                return client(config);
            } catch (e) {
                queue.forEach(({ rej }) => rej(e));
                queue = [];
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                // TODO: редірект на /login при потребі
                throw e;
            } finally {
                isRefreshing = false;
            }
        }
        throw error;
    }
);

export default client;
