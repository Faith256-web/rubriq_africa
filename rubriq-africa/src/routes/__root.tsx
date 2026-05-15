import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { IdleTimeout } from "@/components/IdleTimeout";
import { CartProvider } from "@/lib/cart";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-brand-gradient">404</h1>
        <p className="mt-3 text-muted-foreground">This page doesn't exist.</p>
        <a href="/" className="mt-6 inline-block rounded-full bg-brand-gradient px-5 py-2 text-primary-foreground">Go home</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-full bg-brand-gradient px-5 py-2 text-primary-foreground">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Rubriq Africa — Sustainable Bricks & Pavers in Uganda" },
      { name: "description", content: "Rubriq Africa builds Uganda with sustainable, high-quality bricks, pavers, blocks and kerbs. Eco-friendly construction materials delivered nationwide." },
      { property: "og:title", content: "Rubriq Africa" },
      { property: "og:description", content: "Sustainable bricks and pavers — built in Uganda." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {/* Sticky brand navbar at the top of every page */}
        <Navbar />
        {/* Page content slot */}
        <main className="min-h-[calc(100vh-5rem)]"><Outlet /></main>
        <Footer />
        {/* Floating AI chatbot — available on every page */}
        <Chatbot />
        {/* Background 5-min inactivity logout (active on /dashboard) */}
        <IdleTimeout />
        <Toaster richColors position="top-right" />
      </CartProvider>
    </QueryClientProvider>
  );
}
