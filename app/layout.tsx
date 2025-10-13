import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin-Driven Global Unlock",
  description: "A minimalist web experience centered around a luminous Locker and interactive world map",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
