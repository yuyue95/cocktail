import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "调酒笔记 · 在家也能调出好酒",
    template: "%s · 调酒笔记",
  },
  description:
    "一个属于你的调酒记录本：探索配方、记录每一杯的口感与心得，管理你的吧台与材料。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-cream text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
