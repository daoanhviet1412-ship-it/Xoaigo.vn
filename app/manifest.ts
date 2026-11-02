import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Xoài Go — Cùng nhau mua tốt hơn",
    short_name: "Xoài Go",
    description: "Ưu đãi thành viên, mua chung cộng đồng và cửa hàng địa phương.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fff8e8",
    theme_color: "#087c3e",
    lang: "vi",
    icons: [
      { src: "/xoai-app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
    ]
  };
}