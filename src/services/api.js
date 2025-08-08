import axios from "axios";
import config from "../config/env";

const api = axios.create({
    baseURL: `${config.apiBaseUrl}/`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    console.log(token);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
