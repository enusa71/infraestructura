import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { NetworkStatus } from "@/components/NetworkStatus";
import { Providers } from "./providers";
import { LayoutWithSidebar } from "@/components/LayoutWithSidebar";

export const metadata: Metadata = {
  title: "Custodia de Herramientas - ZFB",
  description: "Control de entrada/salida de herramientas - Zona Franca Barranquilla",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Custodia",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#111c29" />
      </head>
      <body className="h-full m-0 p-0 antialiased overflow-hidden">
        <Providers>
          <ServiceWorkerRegister />
          <NetworkStatus />
          <LayoutWithSidebar>{children}</LayoutWithSidebar>
        </Providers>
      </body>
    </html>
  );
}
