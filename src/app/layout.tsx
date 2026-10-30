import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "College Application Tracker",
  description: "Track deadlines, status, and requirements for college applications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
