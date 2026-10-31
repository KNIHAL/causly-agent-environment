import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const title = "Causly Server — Open-source MCP server for AI agents";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),

  title: {
    default: title,
    template: "%s — Causly Server",
  },

  description: site.description,

  applicationName: "Causly Server",
  authors: [{ name: "Kumar Nihal" }],
  creator: "Kumar Nihal",

  keywords: [
    "Causly Server",
    "causly-server",
    "MCP server",
    "Model Context Protocol",
    "AI agent tools",
    "AI technical co-founder",
    "AI DevOps",
    "Claude Desktop MCP",
    "Cursor MCP",
    "open source MCP server",
  ],

  alternates: { canonical: "/" },

  robots: { index: true, follow: true },

  openGraph: {
    title,
    description: site.description,
    url: site.url,
    siteName: "Causly Server",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Causly Server — turn any AI agent into your technical co-founder",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: ["/og.png"],
  },

  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#02090b",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Causly Server",
  description: site.description,
  url: site.url,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Windows, macOS, Linux",
  license: site.license,
  downloadUrl: site.npm,
  codeRepository: site.github,
  author: { "@type": "Person", name: "Kumar Nihal" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
