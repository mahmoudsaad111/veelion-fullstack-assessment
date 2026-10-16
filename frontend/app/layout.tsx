import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Tasks, activity log and reports",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Some browser extensions add attributes to <html> before React loads;
    // suppressHydrationWarning prevents the resulting development warning.
    <html lang="en" suppressHydrationWarning>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
