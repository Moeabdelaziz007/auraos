import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, GitFork, ShieldCheck, Zap } from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    icon: Bot,
    title: "Autonomous AI Agents",
    description: "Deploy intelligent agents that learn, adapt, and automate complex tasks 24/7.",
  },
  {
    icon: GitFork,
    title: "Self-Improving Workflows",
    description: "Create dynamic workflows that optimize themselves for maximum efficiency and output.",
  },
  {
    icon: Zap,
    title: "Real-Time Intelligence",
    description: "Gain instant insights from your data with our powerful, real-time analytics engine.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Security",
    description: "Your data is protected with end-to-end encryption and advanced security protocols.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Bot className="mr-2 h-6 w-6 text-primary" />
            <span className="font-bold">AuraOS</span>
          </div>
          <nav className="flex flex-1 items-center space-x-4">
            {/* Future nav links can go here */}
          </nav>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container grid place-items-center gap-6 py-20 text-center md:py-32">
          <h1 className="text-4xl font-bold tracking-tighter md:text-6xl">
            The Future of AI Automation is Here
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            AuraOS is a next-generation platform for building, deploying, and
            managing autonomous AI agents that work for you.
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild>
                <Link href="/login">Try AuraOS Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
                <Link href="#">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container space-y-6 bg-slate-50/50 py-8 dark:bg-transparent md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="text-3xl font-bold leading-[1.1] md:text-5xl">Features</h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Everything you need to build and scale your AI workforce.
                </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:grid-cols-4">
                {features.map((feature) => (
                    <Card key={feature.title} className="h-full">
                        <CardHeader>
                            <feature.icon className="mb-4 h-8 w-8 text-primary" />
                            <CardTitle>{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="container py-12 text-center md:py-24">
          <h2 className="text-3xl font-bold md:text-5xl">
            Ready to Automate Your World?
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
            Join the waitlist and be the first to experience the power of AuraOS.
          </p>
          <div className="mt-6">
            <Button size="lg" asChild>
                <Link href="/login">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Bot className="h-6 w-6 text-primary" />
            <p className="text-center text-sm leading-loose md:text-left">
              Built by{" "}
              <a href="#" className="font-medium underline underline-offset-4">
                AuraOS Team
              </a>
              . The source code is available on{" "}
              <a href="#" className="font-medium underline underline-offset-4">
                GitHub
              </a>
              .
            </p>
          </div>
          <p className="text-center text-sm md:text-left">
            &copy; {new Date().getFullYear()} AuraOS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
