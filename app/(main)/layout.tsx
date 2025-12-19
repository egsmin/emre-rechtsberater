

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "../globals.css";
import { Suspense } from "react";
import Topbar from "@/components/topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarComponent from "@/components/sidebar";


export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <>
        <Topbar className="  w-[98%] mx-20" />
        <div className="overflow-y-scroll h-full w-full">
          {children}
        </div>
      </>
  );
}
