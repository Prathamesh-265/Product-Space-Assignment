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
import { useSignup, ApiError } from "@/api";
import { setToken } from "@/lib/auth";
import authBg from "@/assets/auth-bg.png";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required.").max(80),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const signupMutation = useSignup();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = (data: SignupFormValues) => {
    setErrorMsg(null);
    signupMutation.mutate({ data }, {
      onSuccess: (res) => {
        setToken(res.token);
        setLocation("/app");
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          setErrorMsg(err.message || "Failed to create account.");
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
        <img src={authBg} alt="Abstract calm background" className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
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
            Start your practice
          </h1>
          <p className="text-muted-foreground mb-8">
            Create an account to master your day.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-medium">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" className="h-11 bg-card border-border/60 focus-visible:border-primary shadow-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

              <Button type="submit" disabled={signupMutation.isPending} className="w-full h-11 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium text-base mt-2 shadow-sm">
                {signupMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create account"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
