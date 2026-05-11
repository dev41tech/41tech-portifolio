import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FolderGit2, 
  Users, 
  Briefcase, 
  Cpu, 
  LogOut,
  Loader2,
  Settings2
} from "lucide-react";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetMe();
  const logout = useLogout();

  useEffect(() => {
    if (isError) {
      setLocation("/admin-41tech/login");
    }
  }, [isError, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/admin-41tech/login"),
    });
  };

  const navItems = [
    { href: "/admin-41tech/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin-41tech/projects", label: "Projetos", icon: FolderGit2 },
    { href: "/admin-41tech/cases", label: "Cases", icon: Briefcase },
    { href: "/admin-41tech/team", label: "Equipe", icon: Users },
    { href: "/admin-41tech/technologies", label: "Tecnologias", icon: Cpu },
    { href: "/admin-41tech/settings", label: "Configurações", icon: Settings2 },
  ];

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      <aside className="w-64 border-r border-border bg-card flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-mono font-bold text-primary">KF ADMIN</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                <item.icon className="w-4 h-4" />
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout} disabled={logout.isPending}>
            {logout.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 pl-64 min-h-screen">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
