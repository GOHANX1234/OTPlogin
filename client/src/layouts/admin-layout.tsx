import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Code,
  Menu,
  X,
  LogOut,
  ChevronRight,
  User,
  Database,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // If window width is between 768px and 1024px, collapse the sidebar
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 768 && width < 1024) {
        setIsCollapsed(true);
      } else if (width >= 1024) {
        setIsCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    {
      title: "Overview",
      icon: <LayoutDashboard className={`${isCollapsed ? "mx-auto" : "mr-3"} h-5 w-5`} />,
      href: "/admin",
      active: location === "/admin",
    },
    {
      title: "Manage Resellers",
      icon: <Users className={`${isCollapsed ? "mx-auto" : "mr-3"} h-5 w-5`} />,
      href: "/admin/resellers",
      active: location === "/admin/resellers",
    },
    {
      title: "Online Updates",
      icon: <MessageSquare className={`${isCollapsed ? "mx-auto" : "mr-3"} h-5 w-5`} />,
      href: "/admin/online-updates",
      active: location === "/admin/online-updates",
    },
    {
      title: "Referral Tokens",
      icon: <Ticket className={`${isCollapsed ? "mx-auto" : "mr-3"} h-5 w-5`} />,
      href: "/admin/tokens",
      active: location === "/admin/tokens",
    },
    {
      title: "Database Backup",
      icon: <Database className={`${isCollapsed ? "mx-auto" : "mr-3"} h-5 w-5`} />,
      href: "/admin/database-backup",
      active: location === "/admin/database-backup",
    },
    {
      title: "API Documentation",
      icon: <Code className={`${isCollapsed ? "mx-auto" : "mr-3"} h-5 w-5`} />,
      href: "/admin/api",
      active: location === "/admin/api",
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border py-3 px-4 sm:px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="mr-1 bg-background/90 border-purple-500/20 hover:bg-purple-900/10">
                  <Menu className="h-5 w-5 text-purple-400" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 bg-background/95 backdrop-blur-md border-r border-purple-500/20 z-[100]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center py-4 px-5 border-b border-border">
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">DEXX-TER</h2>
                      <span className="ml-2 px-2 py-0.5 bg-purple-900/30 text-purple-400 text-xs rounded-md border border-purple-500/20">
                        Admin
                      </span>
                    </div>
                  </div>
                  
                  <div className="py-3 px-5 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-purple-500/20 bg-purple-900/20">
                        <AvatarFallback className="text-purple-400 bg-purple-900/20">
                          {user?.username?.charAt(0)?.toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user?.username}</p>
                        <p className="text-xs text-muted-foreground">Administrator</p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="flex-1 py-4 px-3">
                    <div className="text-xs font-semibold text-muted-foreground px-2 pb-2">MAIN NAVIGATION</div>
                    <ul className="space-y-1">
                      {navItems.map((item) => (
                        <li key={item.href}>
                          <div
                            className={`flex items-center px-3 py-2.5 rounded-md text-sm cursor-pointer transition-colors ${
                              item.active
                                ? "bg-purple-900/30 text-purple-300 font-medium border border-purple-500/20 shadow-sm"
                                : "text-foreground hover:bg-background/80 hover:text-purple-300"
                            }`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              location !== item.href && (window.location.href = item.href);
                            }}
                          >
                            {item.icon}
                            {item.title}
                            {item.active && <ChevronRight className="ml-auto h-4 w-4 text-purple-400" />}
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-6 px-3">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full bg-red-950/40 text-red-400 hover:bg-red-900/30"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </Button>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">DEXX-TER</h1>
          <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-xs rounded-md border border-purple-500/20">
            Admin
          </span>
        </div>
        
        {/* User section */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center gap-2 pr-2 rounded-full bg-purple-900/5 border border-purple-500/10">
            <Avatar className="h-8 w-8 border border-purple-500/20 bg-purple-900/20">
              <AvatarFallback className="text-purple-400 bg-purple-900/20">
                {user?.username?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user?.username}</span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-full bg-background/80 border-red-500/20 hover:bg-red-900/10 hover:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for larger screens */}
        <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-background/80 border-r border-border hidden md:block transition-all duration-300`}>
          <nav className="h-full flex flex-col py-6">
            <div className="flex-1 px-2">
              <div className={`text-xs font-semibold text-muted-foreground ${isCollapsed ? 'sr-only' : 'px-3 pb-2'}`}>
                MAIN NAVIGATION
              </div>
              <ul className="space-y-1.5">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                              item.active
                                ? "bg-purple-900/30 text-purple-300 font-medium border border-purple-500/20 shadow-sm"
                                : "text-foreground hover:bg-background/80 hover:text-purple-300"
                            } ${isCollapsed ? 'justify-center' : ''}`}
                            onClick={() => {
                              window.location.href = item.href;
                            }}
                          >
                            {item.icon}
                            {!isCollapsed && item.title}
                            {!isCollapsed && item.active && <ChevronRight className="ml-auto h-4 w-4 text-purple-400" />}
                          </div>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right">
                            <p>{item.title}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="px-3 mt-2">
              <Button 
                variant="ghost" 
                size="icon"
                className={`w-full justify-center border border-border/50 ${isCollapsed ? 'h-9 rounded-md' : 'hidden'}`}
                onClick={() => setIsCollapsed(false)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className={`w-full justify-between border border-border/50 ${isCollapsed ? 'hidden' : ''}`}
                onClick={() => setIsCollapsed(true)}
              >
                <span>Collapse</span>
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
