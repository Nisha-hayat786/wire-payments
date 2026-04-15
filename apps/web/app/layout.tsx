import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/providers";
import "@rainbow-me/rainbowkit/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WirePayments | Crypto Payment Gateway",
  description: "Accept crypto payments with Stripe-like simplicity. Non-custodial, instant settlement on Wirefluid network.",
  keywords: ["crypto payments", "bitcoin payments", "ethereum payments", "payment gateway", "wirefluid", "defi"],
  authors: [{ name: "WirePayments" }],
  creator: "WirePayments",
  publisher: "WirePayments",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wirepayments.com",
    siteName: "WirePayments",
    title: "WirePayments | Crypto Payment Gateway",
    description: "Accept crypto payments with Stripe-like simplicity.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WirePayments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WirePayments | Crypto Payment Gateway",
    description: "Accept crypto payments with Stripe-like simplicity.",
    images: ["/og-image.png"],
    creator: "@wirepayments",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove browser extension attributes that cause hydration mismatch
              (function() {
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                      if (node.nodeType === 1) {
                        const element = node;
                        // Remove cz-shortcut-listen attribute added by browser extensions
                        element.removeAttribute('cz-shortcut-listen');
                        element.removeAttribute('data-cz-shortcut-listen');
                      }
                    });
                  });
                });

                // Observe body for changes
                if (document.body) {
                  observer.observe(document.body, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white dark:bg-slate-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


