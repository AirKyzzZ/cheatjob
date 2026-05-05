import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cheatjob.com"),
  title: {
    default: "Cheatjob — Le logiciel qui contacte les recruteurs à ta place",
    template: "%s · Cheatjob",
  },
  description:
    "Cheatjob trouve l'email direct du recruteur et lui écrit à ta place. Tu arrives dans sa boîte, pas dans celle des RH.",
  keywords: [
    "alternance",
    "stage",
    "recherche emploi",
    "cold email",
    "étudiant",
    "recrutement direct",
  ],
  authors: [{ name: "Maxime Mansiet" }],
  creator: "Cheatjob",
  publisher: "Cheatjob",
  openGraph: {
    title: "Cheatjob — L'avantage déloyal",
    description:
      "Pas de réseau ? On t'en fabrique un. Le logiciel qui contacte les recruteurs à ta place.",
    url: "/",
    siteName: "Cheatjob",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cheatjob — L'avantage déloyal",
    description:
      "Pas de réseau ? On t'en fabrique un. Le logiciel qui contacte les recruteurs à ta place.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${instrumentSerif.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-svh bg-cream text-ink">
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
