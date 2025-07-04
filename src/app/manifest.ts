import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gym Hustle",
    short_name: "GymHustle",
    description: "Track your workouts and progress",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/icons/ios/192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/ios/192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/ios/512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/ios/512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    id: "gym-hustle",
    orientation: "portrait",
    shortcuts: [
      {
        name: "Macros",
        url: "https://gym-hustle.vercel.app/macros",
        description: "View your Macros",
      },
    ],
    categories: ["lifestyle", "productivity", "sports"],
  };
}
