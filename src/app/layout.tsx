import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { BrandProvider } from "@/contexts/BrandContext";
import { UserProvider } from "@/contexts/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlumSprout - Find Your First 100 Customers",
  description:
    "Engage Reddit communities to find leads and validate your product.",
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
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-7Y0RT2J0PQ"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7Y0RT2J0PQ');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <QueryProvider>
            <UserProvider>
              <BrandProvider>
                <ToastProvider>{children}</ToastProvider>
              </BrandProvider>
            </UserProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
