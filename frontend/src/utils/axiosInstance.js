import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://travel-app-backend-7eko.onrender.com',
    // timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true // Adaugă această linie dacă ai nevoie de cookies/token-uri
});


axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
