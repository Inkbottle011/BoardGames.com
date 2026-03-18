import axios from "axios";

const api = axios.create({
    baseURL: "/",
    headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')
            ?.content,
    },
});

// handle errors globally in one place
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // player session expired, redirect to login
            window.location.href = "/login";
        }
        if (error.response?.status === 422) {
            // validation error — invalid move etc
            console.warn("Invalid action:", error.response.data.message);
        }
        return Promise.reject(error);
    },
);

export default api;
