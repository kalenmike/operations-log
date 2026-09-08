import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

function versionFile(version: string, buildTime: string): Plugin {
    const payload = JSON.stringify({ version, buildTime }, null, 2);
    return {
        name: "aar-version-file",
        configureServer(server) {
            server.middlewares.use(
                "/version.json",
                (_req: IncomingMessage, res: ServerResponse) => {
                    res.setHeader("Content-Type", "application/json");
                    res.end(payload);
                },
            );
        },
        writeBundle() {
            const outDir = resolve(process.cwd(), "dist");
            mkdirSync(outDir, { recursive: true });
            writeFileSync(resolve(outDir, "version.json"), payload);
        },
    };
}

function computeVersion(): string {
    try {
        return execSync("git rev-parse --short=8 HEAD", { encoding: "utf8" }).trim();
    } catch {
        return `t${Math.floor(Date.now() / 1000)}`;
    }
}

export default defineConfig(({ mode }) => {
    const isDev = mode === "development";
    const buildVersion = isDev ? "dev" : computeVersion();
    const buildTime = new Date().toISOString();

    return {
        base: "/",
        server: { allowedHosts: ["retro.km"] },
        define: {
            __APP_VERSION__: JSON.stringify(buildVersion),
            __APP_BUILD_TIME__: JSON.stringify(buildTime),
        },
        plugins: [
        react(),
        tailwindcss(),
        versionFile(buildVersion, buildTime),
        VitePWA({
            registerType: "prompt",
            injectRegister: false,
            includeAssets: ["favicon.svg", "icons.svg"],
            manifest: {
                name: "Operations Log - AAR Journal",
                short_name: "Ops Log",
                description: "Weekly After Action Review journal with daily check-ins. Local-only, private, no backend.",
                theme_color: "#1e1a16",
                background_color: "#faf6f0",
                display: "standalone",
                orientation: "portrait",
                scope: "/",
                start_url: "/",
                categories: ["productivity", "health", "personalization"],
                icons: [
                    { src: "icon-192.png", sizes: "192x192", type: "image/png" },
                    { src: "icon-512.png", sizes: "512x512", type: "image/png" },
                    { src: "icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
                globIgnores: ["**/version.json"],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google-fonts-css",
                            expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 365 },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google-fonts",
                            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                        },
                    },
                ],
            },
        }),
    ],
    };
});
