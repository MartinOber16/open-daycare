import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka-src",
  weight: ["500", "600"],
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito-src",
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenDayCare",
  description: "Muro de la guardería · Sala Soles",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${nunito.variable} h-full`}
    >
      <body className="min-h-full bg-cream font-nunito text-brown antialiased">
        {children}
      </body>
    </html>
  );
}
