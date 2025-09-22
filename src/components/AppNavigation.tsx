import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Library, Video, Home, BookOpen, User, LogOut } from 'lucide-react';
import logoImage from '@/assets/reel-estate-logo-transparent.png';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: 'Moja biblioteka',
    href: '/app/library',
    icon: Library,
  },
  {
    name: 'Reel Studio',
    href: '/app/reel',
    icon: Video,
  },
  {
    name: 'Stage Studio',
    href: '/app/stage',
    icon: Home,
  },
  {
    name: 'Vodič & primeri',
    href: '/app/docs',
    icon: BookOpen,
  },
];

export function AppNavigation() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/app' && location.pathname === '/app') return true;
    if (href !== '/app' && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/app" className="flex items-center space-x-3">
            <img src={logoImage} alt="Reel Estate" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold text-foreground">
              Reel Estate
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-text-muted hover:text-text-primary hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/app/profile" className="flex items-center cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center cursor-pointer text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Odjava
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}