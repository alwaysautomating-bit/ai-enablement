import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Enablement Workspace",
  description:
    "A governed AI workspace for connected research, human review, and approved deliverables.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
