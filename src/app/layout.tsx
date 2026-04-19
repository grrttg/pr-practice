import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Practice Manager",
  description: "Practice management MVP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <nav className="border-b bg-white px-6 py-3 flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/appointments" className="hover:underline">
            Appointments
          </Link>
          <Link href="/clients" className="hover:underline">
            Clients
          </Link>
          <Link href="/intake" className="hover:underline">
            Intake Form
          </Link>
          <Link href="/memberships" className="hover:underline">
            Memberships
          </Link>
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
        </nav>
        <main className="p-6 max-w-5xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
