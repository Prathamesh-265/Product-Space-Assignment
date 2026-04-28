import { useLocation } from "wouter";
import { useGetCurrentUser, getGetCurrentUserQueryKey } from "@/api";
import { clearToken } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Link } from "wouter";
import { CheckCircle2, LayoutDashboard, Settings, LogOut } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, error } = useGetCurrentUser({
    query: {
      retry: false,
      queryKey: getGetCurrentUserQueryKey(),
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (error || !user) {
    clearToken();
    setLocation("/login");
    return null;
  }

  const handleLogout = () => {
    clearToken();
    setLocation("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground">
        <Sidebar className="border-r border-border/50 bg-card">
          <SidebarHeader className="pt-6 pb-4 px-6">
            <div className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight text-primary">
              <CheckCircle2 className="h-5 w-5" />
              TaskFlow
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/app" asChild>
                    <SidebarMenuButton className="font-medium text-foreground/80 hover:text-primary hover:bg-secondary/50 transition-colors">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/50">
            <SidebarMenu>
               <SidebarMenuItem>
                  <Link href="/settings" asChild>
                    <SidebarMenuButton className="font-medium text-foreground/80 hover:text-primary hover:bg-secondary/50 transition-colors">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout} className="font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors mt-1">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
