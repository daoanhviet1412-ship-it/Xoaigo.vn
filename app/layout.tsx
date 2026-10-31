import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xoài Go — Cùng nhau mua tốt hơn",
  description: "Xoài Go kết nối bạn với cửa hàng địa phương, ưu đãi thành viên và chương trình mua chung tiết kiệm tại Đà Nẵng.",
  icons: { icon: "/xoai-mark.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
