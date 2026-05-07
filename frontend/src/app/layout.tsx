import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { TRPCProvider } from "@/lib/trpc-provider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "AU.NONGTOTA - WAREHOUSE SYSTEM",
  description: "ระบบจัดการคลังอะไหล่",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning>
        <TRPCProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
