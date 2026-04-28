import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useGetCurrentUser } from "@/api";
import { getToken } from "@/lib/auth";

import heroImg from "@/assets/hero-workspace.png";

export default function Landing() {
  const [, setLocation] = useLocation();
  const token = getToken();
  
  // Quick check so logged-in users don't see the landing page
  if (token) {
    setLocation("/app");
    return null;
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground flex flex-col">
      <header className="container mx-auto px-6 h-20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight text-primary">
          <CheckCircle2 className="h-6 w-6" />
          TaskFlow
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Try the demo
          </Link>
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Sign in
          </Link>
          <Link href="/signup" asChild>
            <Button className="rounded-full px-6 font-medium shadow-sm transition-all hover:shadow-md bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center container mx-auto px-6 gap-12 lg:gap-24 py-12 lg:py-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 max-w-2xl"
        >
          <h1 className="font-serif text-5xl lg:text-7xl font-medium tracking-tight text-foreground leading-[1.1] mb-6">
            Master your day. <br />
            <span className="text-muted-foreground italic">Quiet the noise.</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
            A deliberately crafted space for your most important work. 
            No clutter, no distractions. Just you and what matters next.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/signup" asChild>
              <Button size="lg" className="rounded-full px-8 h-14 text-base font-medium shadow-sm transition-all hover:shadow-md bg-primary text-primary-foreground hover:bg-primary/90">
                Start your practice
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground ml-2">Free for individuals.</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 w-full max-w-xl"
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-border/50">
            <div className="absolute inset-0 bg-primary/5 mix-blend-multiply z-10" />
            <img 
              src={heroImg} 
              alt="A clean, calm workspace with espresso and notebook" 
              className="object-cover w-full h-full"
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
