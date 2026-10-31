import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xoài Go — Đi ăn vui hơn, mua sắm lợi hơn",
  description: "Xoài Go kết nối bạn với cửa hàng địa phương, ưu đãi thành viên và chương trình mua chung tiết kiệm tại Đà Nẵng.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
