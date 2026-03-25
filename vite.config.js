import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
<<<<<<< Updated upstream
            input: ["resources/css/app.css", "resources/js/app.jsx"],
=======
            input: ["resources/css/app.css", "resources/js/app.js"],
>>>>>>> Stashed changes
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    server: {
        watch: {
            ignored: ["**/storage/framework/views/**"],
        },
    },
});
