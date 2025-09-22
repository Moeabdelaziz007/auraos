import React from "react";

export default function Footer() {
  return (
    <footer className="w-full px-4 py-4 bg-carbon-900/80 border-t border-border/40 text-center text-xs text-muted-foreground glass-card neon-outline mt-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 max-w-5xl mx-auto">
        <div>
          <span className="font-bold neon-text">AuraOS</span> &copy; {new Date().getFullYear()} All rights reserved.
        </div>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:text-neon-green transition">Privacy</a>
          <a href="/terms" className="hover:text-neon-green transition">Terms</a>
          <a href="/contact" className="hover:text-neon-green transition">Contact</a>
        </div>
      </div>
    </footer>
  );
}
        </div>
        <span className="text-2xl font-bold neon-text tracking-tight">AuraOS</span>
      </div>
      <nav className="flex gap-6 text-sm font-medium">
        <a href="/" className="hover:text-neon-green transition">Home</a>
        <a href="/dashboard" className="hover:text-neon-green transition">Dashboard</a>
        <a href="/mcp-tools" className="hover:text-neon-green transition">MCP Tools</a>
        <a href="/about" className="hover:text-neon-green transition">About</a>
      </nav>
    </header>
  );
}
import React from "react";

export default function Header() {
  return (
    <header className="w-full px-4 py-3 flex items-center justify-between bg-carbon-900/90 border-b border-border/40 shadow-md glass-card neon-outline z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow neon-glow-md">
          <i className="fas fa-robot text-white text-xl"></i>

