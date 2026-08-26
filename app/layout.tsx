import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "van-garf",
  description: "van-garf",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
