import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import {
  LayoutDashboard,
  Key,
  ListChecks,
  Code,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";

interface ResellerLayoutProps {
  children: ReactNode;
}

export default function ResellerLayout({ children }: ResellerLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Initialize WebSocket connection for real-time notifications (global for all reseller pages)
  useWebSocket();

  const { data: profile } = useQuery<any>({
    queryKey: ['/api/reseller/profile'],
    enabled: !!user,
  });

  const navItems = [
    {
      title: "Overview",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
      href: "/reseller",
      active: location === "/reseller",
    },
    {
      title: "Generate Keys",
      icon: <Key className="mr-3 h-5 w-5" />,
      href: "/reseller/generate",
      active: location === "/reseller/generate",
    },
    {
      title: "Manage Keys",
      icon: <ListChecks className="mr-3 h-5 w-5" />,
      href: "/reseller/keys",
      active: location === "/reseller/keys",
    },
    // API Reference hidden as requested
    // {
    //   title: "API Reference",
    //   icon: <Code className="mr-3 h-5 w-5" />,
    //   href: "/reseller/api",
    //   active: location === "/reseller/api",
    // },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-black/95">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-sm border-b border-purple-900/30 py-4 px-6 flex justify-between items-center sticky top-0 z-50 shadow-lg shadow-purple-500/5">
        <div className="flex items-center">
          {/* Hamburger Menu for Mobile */}
          <div className="sm:hidden mr-3 hamburger-fade-in">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="border border-purple-500/30 bg-purple-900/20 shadow-lg shadow-purple-500/30 hover:bg-purple-900/30 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/40"
                >
                  <Menu className="h-5 w-5 text-purple-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] bg-black/90 border-r border-purple-900/30 z-[100]">
                <div className="flex flex-col h-full py-6">
                  <div className="flex items-center mb-6">
                    <div className="flex items-center">
                      <h2 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent glow-text">DEXX-TER</h2>
                      <span className="ml-2 px-2 py-0.5 bg-purple-900/30 text-purple-400 text-xs rounded-md border border-purple-500/20">
                        Reseller
                      </span>
                    </div>
                  </div>
                  
                  {/* User info in mobile menu */}
                  <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20 mb-6">
                    <div className="text-sm text-foreground mb-2">Logged in as <span className="font-medium text-white">{user?.username}</span></div>
                    <div className="text-sm text-purple-400 font-medium">
                      Available Credits: <span className="text-white">{profile?.credits || 0}</span>
                    </div>
                  </div>
                  
                  <nav className="flex-1">
                    <ul className="space-y-2">
                      {navItems.map((item) => (
                        <li key={item.href}>
                          <div 
                            className={`flex items-center px-4 py-3 rounded-md text-sm cursor-pointer transition-colors ${
                              item.active
                                ? "bg-purple-900/30 text-purple-300 font-medium border border-purple-500/20"
                                : "text-foreground hover:bg-purple-900/20 hover:text-purple-300"
                            }`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              location !== item.href && (window.location.href = item.href);
                            }}
                          >
                            {item.icon}
                            {item.title}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  
                  <Button 
                    variant="ghost" 
                    className="mt-6 text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-500/20 w-full" 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent glow-text">DEXX-TER</h1>
          <span className="ml-2 px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded-md border border-purple-500/20">
            Reseller
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-3">
            <span className="text-sm text-foreground">{user?.username}</span>
            <span className="text-sm text-purple-400 font-medium bg-purple-900/20 px-3 py-1 rounded-md border border-purple-500/20">
              Credits: <span className="text-white">{profile?.credits || 0}</span>
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-500/10" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">

        {/* Sidebar for desktop */}
        <aside className="w-64 bg-black/50 border-r border-purple-900/30 hidden sm:block">
          <div className="bg-purple-900/20 mx-4 mt-6 p-4 rounded-lg border border-purple-500/20">
            <div className="text-sm text-foreground mb-1">Available Credits</div>
            <div className="text-2xl font-bold text-white">{profile?.credits || 0}</div>
          </div>
          
          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <div
                      className={`flex items-center px-4 py-3 rounded-md cursor-pointer transition-colors ${
                        item.active
                          ? "bg-purple-900/30 text-purple-300 font-medium border border-purple-500/20"
                          : "text-foreground hover:bg-purple-900/20 hover:text-purple-300"
                      }`}
                    >
                      {item.icon}
                      {item.title}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
