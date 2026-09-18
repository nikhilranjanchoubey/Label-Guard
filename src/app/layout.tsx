import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { InspectionProvider } from "@/context/InspectionContext";
import { GovernmentTopBar } from "@/components/GovernmentTopBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Label Guard — Packaged Commodity Compliance & Inspection Platform",
  description:
    "AI-assisted packaged commodity inspection and compliance analysis platform under the Legal Metrology (Packaged Commodities) Rules, 2011. Smart India Hackathon Problem Statement 26034.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <InspectionProvider>
              {/* Scroll progress line at very top */}
              <span
                aria-hidden="true"
                className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-indigo-500 via-sky-400 to-orange-400"
              />

              {/* Official Government Top Bar */}
              <GovernmentTopBar />

              {/* Main App Navbar */}
              <Navbar />

              {/* Page Content with Prototype Route Protection */}
              <main id="main" className="flex-1">
                <AuthGuard>{children}</AuthGuard>
              </main>

              {/* Official Footer */}
              <Footer />
            </InspectionProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
