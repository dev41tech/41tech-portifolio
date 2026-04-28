import { ReactNode } from "react";
import { Link } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useGetSiteSettings } from "@workspace/api-client-react";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { data: settings } = useGetSiteSettings();
  
  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (settings?.whatsappUrl) {
      e.preventDefault();
      window.open(settings.whatsappUrl, '_blank', 'noopener,noreferrer');
    }
    // se não tiver whatsappUrl, o href="#contato" será mantido e rolará para a seção de contato
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.10)] glassmorphism">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-white.png" alt="41 Tech" className="h-8 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/projetos" className="hover:text-primary transition-colors">Projetos</Link>
            <Link href="/equipe" className="hover:text-primary transition-colors">Equipe</Link>
            <Button asChild className="border-0 text-white bg-gradient-to-r from-[#123DFF] to-[#0A28CC] hover:from-[#1a47ff] hover:to-[#1230e0]">
              <a href="#contato" onClick={handleContactClick}>Falar com a 41 Tech</a>
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
                <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">Início</Link>
                <Link href="/projetos" className="text-lg font-medium hover:text-primary transition-colors">Projetos</Link>
                <Link href="/equipe" className="text-lg font-medium hover:text-primary transition-colors">Equipe</Link>
                <Button asChild className="w-full mt-4 bg-gradient-to-r from-[#123DFF] to-[#0A28CC] hover:from-[#1a47ff] hover:to-[#1230e0] border-0 text-white">
                  <a href="#contato" onClick={handleContactClick}>Falar com a 41 Tech</a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-[rgba(255,255,255,0.10)] bg-[#05070D] py-12 md:py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <img src="/logo-white.png" alt="41 Tech" className="h-8 w-auto" />
            </div>
            <p className="text-muted-foreground max-w-sm mt-4">
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
              {settings?.contactEmail ? (
                <li><a href={`mailto:${settings.contactEmail}`} className="hover:text-primary transition-colors">{settings.contactEmail}</a></li>
              ) : (
                <li>contato@grupo41.com.br</li>
              )}
              {settings?.whatsappUrl && (
                <li><a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp</a></li>
              )}
              {settings?.linkedinUrl && (
                <li><a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a></li>
              )}
              <li>Brasil</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-[rgba(255,255,255,0.10)] text-sm text-muted-foreground text-center md:text-left">
          &copy; {new Date().getFullYear()} 41 Tech. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}