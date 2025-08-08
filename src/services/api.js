import axios from "axios";
import config from "../config/env";

const api = axios.create({
    baseURL: `${config.apiBaseUrl}/`,
});

// ⬇️ Додамо надійну постановку хедера + лог
api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem("access_token");
    const hasToken = Boolean(token);
    // інколи headers буває undefined — гарантуємо об’єкт
    cfg.headers = cfg.headers || {};
    if (hasToken) {
        cfg.headers.Authorization = `Bearer ${token}`;
    } else {
        delete cfg.headers.Authorization;
    }
    console.log("API →", cfg.method?.toUpperCase(), cfg.baseURL + cfg.url, hasToken ? "[WITH TOKEN]" : "[NO TOKEN]");
    return cfg;
});


api.interceptors.response.use((res) => {
    try {
        const url = (res.config?.url || "").toString();
        if (url.includes("/auth/login") && res.data) {
            if (res.data.access_token) localStorage.setItem("access_token", res.data.access_token);
            if (res.data.refresh_token) localStorage.setItem("refresh_token", res.data.refresh_token);
            console.log("LOGIN OK → токени збережено в localStorage");
        }
    } catch (e) { }
    return res;
});



export default api;
