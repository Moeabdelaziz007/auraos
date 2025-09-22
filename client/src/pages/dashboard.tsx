import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/layout/header";
import { Bot, GitFork, FileText, BarChart, Settings, Bell, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const overviewCards = [
  {
    title: "Active Agents",
    value: "12",
    icon: Bot,
    description: "Currently running and monitoring tasks.",
  },
  {
    title: "Workflows Executed",
    value: "1,204",
    icon: GitFork,
    description: "Total workflows executed this month.",
  },
  {
    title: "Recent Notes",
    value: "42",
    icon: FileText,
    description: "Notes created or updated this week.",
  },
  {
    title: "API Usage",
    value: "75%",
    icon: BarChart,
    description: "Your current API usage for this billing cycle.",
  },
];

const quickAccessLinks = [
    {
        title: "Account Settings",
        description: "Manage your profile and billing.",
        icon: Settings,
        href: "/settings"
    },
    {
        title: "Notifications",
        description: "Configure your notification preferences.",
        icon: Bell,
        href: "/settings/notifications"
    },
    {
        title: "Help & Support",
        description: "Get help or contact our support team.",
        icon: LifeBuoy,
        href: "/support"
    }
]

export default function Dashboard() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Dashboard" />
      <main className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>A log of recent events and agent activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                    <Bot className="h-4 w-4 text-muted-foreground"/>
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium">Agent "Social Media Poster" completed a task.</p>
                                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Quick Access</CardTitle>
                    <CardDescription>Quick links to important settings and pages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {quickAccessLinks.map(link => (
                        <Button variant="ghost" className="w-full justify-start gap-3 px-2" asChild key={link.href}>
                            <Link href={link.href}>
                                <link.icon className="h-5 w-5 text-muted-foreground"/>
                                <div>
                                    <p className="text-sm font-medium">{link.title}</p>
                                </div>
                            </Link>
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
