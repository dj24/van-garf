import tailwindcss from "@tailwindcss/vite";
import vinext from "vinext";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import vercelConfig from "./vercel.json" with { type: "json" };

export default defineConfig(({ command }) => ({
  define: {
    "process.env.NEXT_PUBLIC_VERCEL_IMAGES": JSON.stringify(
      process.env.VERCEL === "1" || process.env.NITRO_PRESET === "vercel",
    ),
  },
  plugins: [
    // React 19.3 provides these APIs natively. Vinext's canary fallback
    // rewrites React imports and loses named exports in Vite development.
    vinext().filter(
      (plugin) =>
        !plugin ||
        typeof plugin !== "object" ||
        !("name" in plugin) ||
        plugin.name !== "vinext:react-canary",
    ),
    tailwindcss(),
    command === "build" && nitro({
      vercel: {
        config: {
          version: 3,
          images: {
            ...vercelConfig.images,
            formats: vercelConfig.images.formats.map((format) => {
              if (format !== "image/avif" && format !== "image/webp") {
                throw new Error(`Unsupported image format: ${format}`);
              }
              return format;
            }),
          },
        },
      },
    }),
  ],
}));
