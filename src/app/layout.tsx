import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Todo App",
  description: "A fullstack todo app powered by localStorage",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
