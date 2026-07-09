import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const pretendard = localFont({
  src: [
    { path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: "지원금 레이더 — AI 지원사업 신청 준비 OS",
  description: "예비창업자·초기창업자·소상공인을 위한 맞춤 지원사업 매칭과 제출 전 준비도 진단",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
