import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        className="absolute bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-full animate-float"
        style={{
          width: `${Math.random() * 40 + 15}px`,
          height: `${Math.random() * 40 + 15}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 25 + 20}s`,
          animationDelay: `${Math.random() * -30}s`,
          boxShadow: `0 0 ${Math.random() * 20 + 10}px hsl(var(--primary))`,
        }}
      ></div>
    ))}
  </div>
);

const MatrixRain = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute text-primary/20 font-mono text-xs animate-matrix-rain"
        style={{
          left: `${(i * 2) % 100}%`,
          animationDuration: `${Math.random() * 3 + 2}s`,
          animationDelay: `${Math.random() * -5}s`,
        }}
      >
        {String.fromCharCode(0x30A0 + Math.random() * 96)}
      </div>
    ))}
  </div>
);

const CyberGrid = () => (
  <div className="absolute inset-0 pointer-events-none opacity-20">
    <svg className="w-full h-full">
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-carbon-900 carbon-texture">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <FloatingParticles />
        <MatrixRain />
        <CyberGrid />
        <div className="w-full max-w-md z-10">
          {/* Logo Section */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12 transition-all duration-700 hover:rotate-0 hover:scale-110 shadow-2xl neon-glow-md animate-pulse-slow">
              <i className="fas fa-robot text-white text-4xl animate-bounce-slow"></i>
            </div>
            <h1 className="text-5xl font-bold neon-text mb-2 cyber-text animate-neon-flicker">AuraOS</h1>
            <p className="text-xl text-muted-foreground animate-fade-in-up-delayed">The Future of AI-Powered Automation</p>
          </div>
          {/* Login Card */}
          <Card className="shadow-2xl border-0 glass-card neon-outline backdrop-blur-md transform-gpu transition-all duration-700 hover:scale-105 hover:shadow-neon-lg [transform-style:preserve-3d] animate-slide-in-up">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-semibold neon-text">Unlock Your AI Potential</CardTitle>
              <p className="text-muted-foreground animate-fade-in">
                Sign in to access your intelligent automation dashboard
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {/* Google Sign In Button */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || loading}
                className="w-full h-14 text-lg font-medium neon-button animate-pulse-gentle"
                aria-busy={isSigningIn || loading}
                aria-label="Sign in with Google"
              >
                {isSigningIn ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <i className="fab fa-google mr-3"></i>
                    Sign in with Google
                  </>
                )}
              </Button>
              <Separator />
              <div className="text-xs text-muted-foreground text-center">
                By signing in, you agree to our <a href="/terms" className="underline hover:text-neon-green">Terms</a> and <a href="/privacy" className="underline hover:text-neon-green">Privacy Policy</a>.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
