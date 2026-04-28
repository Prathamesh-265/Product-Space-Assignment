import { AppLayout } from "@/components/layout/app-layout";
import { useGetCurrentUser } from "@/api";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/auth";
import { useLocation } from "wouter";
import { LogOut, User as UserIcon } from "lucide-react";

export default function Settings() {
  const { data: user } = useGetCurrentUser();
  const [, setLocation] = useLocation();

  const handleSignOut = () => {
    clearToken();
    setLocation("/");
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account preferences.</p>
        </div>

        {user && (
          <Card className="border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif font-medium text-lg flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Your personal details and account status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                  <p className="text-base text-foreground font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email Address</p>
                  <p className="text-base text-foreground font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Member Since</p>
                  <p className="text-base text-foreground font-medium">{format(new Date(user.createdAt), "MMMM d, yyyy")}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                <p className="text-sm font-medium text-muted-foreground mb-4">Account Actions</p>
                <Button variant="outline" onClick={handleSignOut} className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors shadow-sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out of TaskFlow
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
