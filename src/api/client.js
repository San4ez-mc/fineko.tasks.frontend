import axios from 'axios';

const client = axios.create({
    baseURL: 'https://api.tasks.fineko.space',
    withCredentials: true, // важливо для cookie-сесії
    headers: {
        'Content-Type': 'application/json',
    },
});

// Перехоплювач для зручнішого дебагу
client.interceptors.response.use(
    (r) => r,
    (err) => {
        console.error('API error:', err?.response?.status, err?.response?.data || err.message);
        return Promise.reject(err);
    }
);

export default client;
