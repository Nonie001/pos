import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { RestaurantProvider } from "@/contexts/RestaurantContext";

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "ระบบสั่งอาหาร - POS",
  description: "ระบบสั่งอาหารสำหรับร้านอาหาร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} font-sans antialiased`}>
        <RestaurantProvider>
          {children}
        </RestaurantProvider>
      </body>
    </html>
  );
}
