"use client";

import { usePublicRouteRedirect } from "@/src/hooks/use-public-route-redirect";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { shouldShowLoading } = usePublicRouteRedirect();

  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background-light textile-pattern hero-gradient min-h-screen flex flex-col">
      {children}
    </div>
  );
}
