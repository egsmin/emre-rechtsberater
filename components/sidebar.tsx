import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { HomeIcon, SidebarIcon } from "lucide-react";

export default function SidebarComponent({ className }: { className?: string }) {
  return (
    <Sidebar className={className}>
      <SidebarHeader>
        Rechtsberatung
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <SidebarIcon>
                <HomeIcon />
              </SidebarIcon>
              Hauptseite
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}