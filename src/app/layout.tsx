import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BRAHMO India Legal - AI Drafting Workbench",
  description: "Advanced legal draft generator combining templates, statutory section mappings, and Indian Kanoon API integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased min-h-screen text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
