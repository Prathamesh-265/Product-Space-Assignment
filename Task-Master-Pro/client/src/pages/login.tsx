import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLogin, ApiError } from "@/api";
import { setToken } from "@/lib/auth";
import authBg from "@/assets/auth-bg.png";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMsg(null);
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        setToken(res.token);
        setLocation("/app");
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          setErrorMsg(err.message || "Failed to log in. Please check your credentials.");
        } else {
          setErrorMsg("An unexpected error occurred.");
        }
      }
    });
  };

  const handleDemoLogin = () => {
    setErrorMsg(null);
    const demoCreds = { email: "demo@taskflow.app", password: "demo1234" };
    form.setValue("email", demoCreds.email);
    form.setValue("password", demoCreds.password);
    loginMutation.mutate({ data: demoCreds }, {
      onSuccess: (res) => {
        setToken(res.token);
        setLocation("/app");
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          setErrorMsg(err.message || "Demo account is not available right now.");
        } else {
          setErrorMsg("An unexpected error occurred.");
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex bg-background selection:bg-primary selection:text-primary-foreground">
      <div className="hidden lg:block lg:flex-1 relative">
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10" />
        <img src={authBg} alt="Abstract calm background" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 max-w-xl mx-auto lg:mx-0 w-full">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight text-primary mb-12 self-start hover:opacity-80 transition-opacity">
          <CheckCircle2 className="h-6 w-6" />
          TaskFlow
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to continue your work.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-medium">Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" type="email" className="h-11 bg-card border-border/60 focus-visible:border-primary shadow-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-medium">Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" className="h-11 bg-card border-border/60 focus-visible:border-primary shadow-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {errorMsg && (
                <div className="text-sm text-destructive font-medium bg-destructive/10 px-3 py-2 rounded-md">
                  {errorMsg}
                </div>
              )}

              <Button type="submit" disabled={loginMutation.isPending} className="w-full h-11 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium text-base mt-2 shadow-sm">
                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground tracking-wider">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleDemoLogin}
            disabled={loginMutation.isPending}
            className="w-full h-11 rounded-md border-border/80 hover:bg-muted/50 transition-all font-medium text-base"
          >
            Try the demo account
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Skip the form — sign in instantly with sample tasks loaded.
          </p>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline underline-offset-4">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
