import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/layout/navbar';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Futurise - AI Career Mentor',
  description: 'Navigate Your Career with Futurise – AI Career Mentor. AI-powered career prediction, skill-gap analysis, daily learning, and community support.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <SidebarProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-grow flex w-full">
                  {children}
                </div>
              </div>
              <Toaster />
            </SidebarProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
