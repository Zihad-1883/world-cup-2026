import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PredictionModeProvider } from "@/context/PredictionModeContext";
import { PredictionStateProvider } from "@/context/PredictionStateContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FIFA World Cup 2026 Prediction App",
  description: "Predict the bracket and compete with others for the 2026 World Cup!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-900 text-slate-100 h-full antialiased`}>
        <AuthProvider>
          <PredictionModeProvider>
            <PredictionStateProvider>
              {children}
            </PredictionStateProvider>
          </PredictionModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
