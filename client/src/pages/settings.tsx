import { useTheme } from "@/hooks/use-theme";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  { name: "Violet", class: "theme-violet", color: "hsl(250 100% 72%)" },
  { name: "Blue", class: "theme-blue", color: "hsl(210 100% 60%)" },
  { name: "Green", class: "theme-green", color: "hsl(140 80% 50%)" },
  { name: "Orange", class: "theme-orange", color: "hsl(30 100% 50%)" },
];

export default function SettingsPage() {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();

  return (
    <div className="flex h-full flex-col">
      <Header title="Settings" />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light Mode
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark Mode
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Accent Color</h3>
                <div className="flex flex-wrap gap-3">
                  {themes.map((t) => (
                    <Button
                      key={t.name}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-12 w-12",
                        accentColor === t.class && "ring-2 ring-ring"
                      )}
                      onClick={() => setAccentColor(t.class)}
                    >
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="sr-only">{t.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
