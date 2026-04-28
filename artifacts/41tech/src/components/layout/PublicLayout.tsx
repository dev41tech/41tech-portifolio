import { ReactNode } from "react";
import { Link } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-primary-foreground font-bold font-mono text-xl leading-none">
              41
            </div>
            <span className="font-mono font-bold text-lg tracking-tight">TECH</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/projetos" className="hover:text-foreground transition-colors">Projetos</Link>
            <Link href="/equipe" className="hover:text-foreground transition-colors">Equipe</Link>
            <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
              <a href="#contato">Falar com a 41 Tech</a>
            </Button>
          </nav>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-border">
              <div className="flex flex-col gap-6 mt-12">
                <Link href="/" className="text-lg font-medium">Início</Link>
                <Link href="/projetos" className="text-lg font-medium">Projetos</Link>
                <Link href="/equipe" className="text-lg font-medium">Equipe</Link>
                <Button className="w-full mt-4">Falar com a 41 Tech</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-card py-12 md:py-16" id="contato">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-primary-foreground font-bold font-mono text-xl leading-none">
                41
              </div>
              <span className="font-mono font-bold text-lg tracking-tight">TECH</span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Tecnologia aplicada à operação real. Transformamos processos manuais em soluções digitais escaláveis.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-foreground">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/projetos" className="hover:text-primary transition-colors">Projetos</Link></li>
              <li><Link href="/equipe" className="hover:text-primary transition-colors">Equipe</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-foreground">Contato</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contato@grupo41.com.br</li>
              <li>Brasil</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border/50 text-sm text-muted-foreground text-center md:text-left">
          &copy; {new Date().getFullYear()} 41 Tech. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
