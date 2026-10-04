import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Telemetry dashboard",
  description: "Live charts of decoded device telemetry",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
