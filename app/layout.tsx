import type { Metadata } from "next";
import "./globals.css";
import "./register.css";

export const metadata: Metadata = {
  title: "Xoài Go — Cùng nhau mua tốt hơn",
  description: "Khám phá ưu đãi thành viên, mua chung cộng đồng và cửa hàng địa phương cùng Xoài Go. Bắt đầu từ Đà Nẵng.",
  applicationName: "Xoài Go",
  metadataBase: new URL("https://xoaigo.vercel.app"),
  openGraph: {
    title: "Xoài Go — Cùng nhau mua tốt hơn",
    description: "Kết nối người mua với cửa hàng địa phương. Ưu đãi thiết thực, mua chung cộng đồng.",
    siteName: "Xoài Go",
    locale: "vi_VN",
    type: "website",
  },
  icons: { icon: "/xoai-mark.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
