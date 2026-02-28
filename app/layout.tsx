import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
  title: "Coach Lab — Tactical Board",
  description: "Interactive tactical board for football coaching — formations, drawings, keyframes and set piece planning. By Daniel de Sousa, UEFA B Coach.",
  keywords: ["football coaching", "tactical board", "formations", "set pieces", "treino futebol"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} ${barlowCondensed.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
