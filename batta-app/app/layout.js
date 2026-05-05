import { Inter } from "next/font/google";
import "./globals.css";
import BottomNavBar from "@/components/navigation/BottomNavBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Batta Factory Management",
  description: "Mobile-first factory management system for brick production operations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 flex flex-col font-sans">
        {/* Page content — padded at bottom so it's never hidden behind the fixed nav bar */}
        <main className="flex-1 pb-20">
          {children}
        </main>

        <BottomNavBar />
      </body>
    </html>
  );
}
