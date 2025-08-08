import axios from 'axios';

const client = axios.create({
    baseURL: 'https://api.tasks.fineko.space',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
    (r) => r,
    (err) => {
        console.error('API error:', err?.response?.status, err?.response?.data || err.message);
        return Promise.reject(err);
    }
);

export default client;
