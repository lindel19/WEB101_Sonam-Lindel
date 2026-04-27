import "./globals.css";
import { AuthProvider } from "@/contexts/authContext";
import MainLayout from "@/components/layout/MainLayout";
import QueryProvider from "@/components/QueryProvider";

export const metadata = {
  title: "TikTok Clone",
  description: "TikTok fullstack app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <QueryProvider>
          <AuthProvider>
            <MainLayout>{children}</MainLayout>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}