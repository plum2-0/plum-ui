import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { BrandProvider } from "@/contexts/BrandContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlumSprout - Amplify your Brand's Presence",
  description:
    "Multiply your marketing team with PlumSprout AI to listen and sprout your Brand's Community",
  icons: {
    icon: [
      { url: "/plum-favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/plum-favicon.svg",
    apple: "/plum-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/plum-favicon.svg?v=6" type="image/svg+xml" />
        <link rel="shortcut icon" href="/plum-favicon.svg?v=6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <QueryProvider>
            <BrandProvider>
              <ToastProvider>{children}</ToastProvider>
            </BrandProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
