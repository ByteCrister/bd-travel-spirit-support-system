// lib/axiosClient.ts
import axios from 'axios';

const client = axios.create({ baseURL: process.env.NEXT_PUBLIC_DOMAIN });

client.interceptors.request.use((config) => {
    const token = localStorage.getItem(process.env.NEXT_TOKEN!);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

client.interceptors.response.use(
    (res) => res,
    async (err) => {
        if (err.response.status === 401) {
            try {
                const refresh = await axios.get('/api/auth/refresh');
                localStorage.setItem(process.env.NEXT_TOKEN!, refresh.data.accessToken);
                err.config.headers['Authorization'] = `Bearer ${refresh.data.accessToken}`;
                return axios(err.config);
            } catch {
                window.location.href = '/';
            }
        }
        return Promise.reject(err);
    }
);

export default client;
