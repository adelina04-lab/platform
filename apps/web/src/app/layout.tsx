import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono, Manrope, Onest } from "next/font/google";
import "./globals.css";

// Дизайн-система называет Space Grotesk, но у него нет кириллицы — русские
// заголовки молча падали бы в системный шрифт. Onest — тот же геометрический
// характер, но с настоящей кириллицей.
const onest = Onest({
  subsets: ["cyrillic", "latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-onest",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Итого — сколько на самом деле стоит отпуск",
  description:
    "Считаем полную стоимость поездки: перелёт, проживание, питание вне отеля, трансфер, страховку, экскурсии и визу. Диапазон вместо одной цифры и честный список того, что не входит.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} ${manrope.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
