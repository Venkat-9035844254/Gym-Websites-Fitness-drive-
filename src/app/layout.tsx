import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { GymBranchProvider } from "@/context/GymBranchContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DemoUserSwitcher } from "@/components/layout/DemoUserSwitcher";

export const metadata: Metadata = {
  title: "Apex Athletics | High-Performance Commercial Fitness & Gym Club",
  description: "Experience premier gym facility access, certified master personal trainers, Olympic lifting arenas, HIIT group classes, and customized nutrition coaching.",
  keywords: "gym, fitness center, personal trainer, gym membership, strength training, workout classes, HIIT, yoga, nutrition coaching",
  authors: [{ name: "Apex Athletics Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
        <ThemeProvider>
          <AuthProvider>
            <GymBranchProvider>
              <NotificationProvider>
                <Navbar />
                <main className="flex-1 w-full">{children}</main>
                <Footer />
              </NotificationProvider>
            </GymBranchProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
