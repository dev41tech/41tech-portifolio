import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Server, Activity, Database, Blocks, LayoutTemplate, Workflow, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useListProjects, useGetSiteSettings } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { data: projects } = useListProjects({ featured: true });
  const { data: settings } = useGetSiteSettings();
  const { toast } = useToast();
  
  const [videoError, setVideoError] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    company: "",
    contact: "",
    message: ""
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings?.whatsappUrl) {
      toast({
        title: "Contato indisponível",
        description: "O link de WhatsApp não foi configurado.",
        variant: "destructive"
      });
      return;
    }

    const text = `Olá, sou ${contactForm.name}, da empresa ${contactForm.company}. Quero conversar sobre: ${contactForm.message}. Meu contato é ${contactForm.contact}.`;
    const url = new URL(settings.whatsappUrl);
    url.searchParams.set("text", text);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const handlePrimaryCtaClick = () => {
    if (settings?.whatsappUrl) {
      window.open(settings.whatsappUrl, "_blank", "noopener,noreferrer");
    } else {
      document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProjectsClick = () => {
    document.getElementById('projetos-destaque')?.scrollIntoView({ behavior: 'smooth' });
  };

  const services = [
    { title: "Sistemas Web", description: "Aplicações web robustas e escaláveis, do MVP ao sistema corporativo complexo.", icon: LayoutTemplate },
    { title: "Automações", description: "Fluxos automatizados com n8n, APIs e integrações que eliminam trabalho manual.", icon: Workflow },
    { title: "BI e Dashboards", description: "Painéis executivos em Power BI conectados ao seu banco de dados em tempo real.", icon: Activity },
    { title: "Integrações com APIs", description: "Conexão entre sistemas, ERPs, CRMs e plataformas via REST e webhooks.", icon: Blocks },
    { title: "IA aplicada a processos", description: "LLMs e modelos de IA integrados em workflows reais de negócio.", icon: Database },
    { title: "Infra Docker e Deploy", description: "Containerização e deploy seguro via Docker e EasyPanel com CI/CD.", icon: Server },
  ];

  const techStack = [
    { category: "Front-end", techs: ["React", "Next.js", "TypeScript"] },
    { category: "Back-end", techs: ["Node.js", "Express", "MySQL", "PostgreSQL"] },
    { category: "Dados & BI", techs: ["Power BI", "Drizzle ORM"] },
    { category: "Automação", techs: ["n8n", "APIs REST", "Webhooks"] },
    { category: "Infra & Deploy", techs: ["Docker", "EasyPanel", "GitHub"] },
  ];

  const inferCategory = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('dashboard') || t.includes('bi') || t.includes('dados')) return "BI & Dados";
    if (t.includes('automação') || t.includes('integração') || t.includes('n8n')) return "Automação";
    return "Plataforma Web";
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex items-center justify-center min-h-[90vh]">
        <div className="absolute inset-0 z-0">
          {settings?.heroVideoEnabled && settings?.heroVideoUrl && !videoError ? (
            <video 
              src={settings.heroVideoUrl} 
              autoPlay 
              loop 
              muted 
              playsInline 
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover opacity-30" 
            />
          ) : settings?.heroFallbackImageUrl ? (
            <img 
              src={settings.heroFallbackImageUrl} 
              alt="Hero Background" 
              className="w-full h-full object-cover opacity-30" 
            />
          ) : (
            <div className="w-full h-full tech-grid opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4 glow-blue">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Engenharia de Software B2B
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground relative">
              <div className="absolute inset-0 glow-blue-text opacity-50 blur-2xl"></div>
              <span className="gradient-text leading-tight">
                Tecnologia aplicada à<br />
                operação real.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[#AAB6D3] max-w-2xl mx-auto leading-relaxed">
              Criamos sistemas, automações, dashboards e integrações que transformam processos manuais em soluções digitais escaláveis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button size="lg" onClick={handlePrimaryCtaClick} className="w-full sm:w-auto h-14 px-8 text-base font-semibold bg-gradient-to-r from-[#123DFF] to-[#0A28CC] hover:from-[#1a47ff] hover:to-[#1230e0] text-white border-0 glow-blue">
                {settings?.ctaPrimaryLabel || "Transformar meu processo"}
              </Button>
              <Button size="lg" variant="outline" onClick={handleProjectsClick} className="w-full sm:w-auto h-14 px-8 text-base border-white/20 text-white hover:bg-white/5 glassmorphism cursor-pointer">
                {settings?.ctaSecondaryLabel || "Ver projetos"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-32 relative bg-[#0B1020]">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">O que fazemos</h2>
            <p className="text-xl text-[#AAB6D3] max-w-2xl mx-auto">Engenharia de software focada em resolver gargalos operacionais complexos.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[#05070D] hover:border-primary/50 transition-all duration-300 group hover:scale-[1.02] hover:shadow-[inset_0_0_20px_rgba(18,61,255,0.1)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <service.icon className="w-24 h-24 text-primary" />
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#123DFF]/20 to-[#00D8FF]/20 flex items-center justify-center mb-6 border border-primary/20 group-hover:border-primary/50 transition-colors">
                  <service.icon className="w-8 h-8 text-primary group-hover:text-[#00D8FF] transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 relative z-10">{service.title}</h3>
                <p className="text-[#AAB6D3] leading-relaxed relative z-10">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {projects && projects.length > 0 && (
        <section id="projetos-destaque" className="py-32 relative bg-[#05070D] scroll-mt-20">
          <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6"
            >
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">Projetos em destaque</h2>
                <p className="text-xl text-[#AAB6D3]">Soluções construídas com precisão para impacto real na operação.</p>
              </div>
              <Button variant="ghost" asChild className="hidden md:flex text-primary hover:text-white hover:bg-primary/20">
                <Link href="/projetos">Ver todos os projetos <ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.15 }}
                >
                  <Link href={`/projetos/${project.slug}`}>
                    <div className="group h-full rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[#0B1020] hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] flex flex-col">
                      <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-[#061A44] to-[#05070D] relative flex items-center justify-center">
                        {project.thumbnailUrl || project.coverImageUrl ? (
                          <img src={project.thumbnailUrl || project.coverImageUrl || ""} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:scale-110 transition-transform duration-700">
                            <svg className="w-1/2 h-1/2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="3" y1="9" x2="21" y2="9"></line>
                              <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <Badge className="bg-background/80 backdrop-blur-md border border-[rgba(255,255,255,0.1)] text-white hover:bg-background">
                            {project.category || inferCategory(project.title)}
                          </Badge>
                          {project.featured && (
                            <Badge className="bg-primary/90 backdrop-blur-md border border-primary text-white hover:bg-primary">
                              Destaque
                            </Badge>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-transparent to-transparent opacity-80" />
                      </div>
                      <div className="p-8 flex flex-col flex-1 relative">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <h3 className="text-2xl font-bold mb-4 group-hover:text-[#00D8FF] transition-colors text-foreground">{project.title}</h3>
                        <p className="text-[#AAB6D3] line-clamp-2 mb-6 flex-1 text-lg">{project.shortDescription}</p>
                        
                        {project.metricsSummary && (
                          <div className="mb-6 p-3 rounded-lg bg-[rgba(18,61,255,0.05)] border border-[rgba(18,61,255,0.1)]">
                            <p className="text-sm font-semibold text-[#00D8FF]">{project.metricsSummary}</p>
                          </div>
                        )}
                        
                        <div className="mt-auto overflow-hidden">
                          <div className="flex items-center text-primary font-semibold translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            Ver detalhes <ArrowRight className="w-5 h-5 ml-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <Button variant="outline" asChild className="w-full mt-12 md:hidden border-[rgba(255,255,255,0.1)] text-white h-14">
              <Link href="/projetos">Ver todos os projetos</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Tech Stack */}
      <section className="py-32 bg-[#0B1020] border-y border-[rgba(255,255,255,0.05)]">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">Stack Tecnológico</h2>
            <p className="text-xl text-[#AAB6D3] max-w-2xl mx-auto">Utilizamos as ferramentas certas para cada problema real.</p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {techStack.map((group, i) => (
              <motion.div 
                key={group.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-white border-b border-[rgba(255,255,255,0.1)] pb-4">{group.category}</h3>
                <div className="flex flex-wrap gap-3">
                  {group.techs.map(t => (
                    <div key={t} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(18,61,255,0.12)] border border-[rgba(18,61,255,0.3)] text-white hover:bg-[rgba(18,61,255,0.2)] hover:scale-105 hover:border-[#00D8FF]/50 transition-all cursor-default">
                      <span className="text-[#00D8FF] font-bold text-lg leading-none">{t.charAt(0)}</span>
                      <span className="font-mono text-sm">{t}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 relative overflow-hidden bg-gradient-to-b from-[#05070D] to-[#061A44]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 relative z-10 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-foreground max-w-4xl mx-auto leading-tight tracking-tight">
            Quer transformar um processo manual em uma <span className="gradient-text">solução digital?</span>
          </h2>
          <p className="text-xl text-[#AAB6D3] max-w-3xl mx-auto mb-12 leading-relaxed">
            Se existe uma rotina repetitiva, uma planilha crítica ou um processo manual travando sua operação, podemos transformar isso em sistema.
          </p>
          <Button size="lg" onClick={handlePrimaryCtaClick} className="h-16 px-10 text-lg font-bold bg-gradient-to-r from-[#123DFF] to-[#0A28CC] hover:from-[#1a47ff] hover:to-[#1230e0] text-white border-0 glow-blue hover:scale-105 transition-transform">
            Falar conosco
          </Button>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-24 relative bg-[#0B1020] border-t border-[rgba(255,255,255,0.05)] scroll-mt-20">
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">Vamos construir algo incrível.</h2>
            <p className="text-lg text-[#AAB6D3]">Conte-nos sobre o seu desafio. Nós ajudamos a encontrar a melhor solução.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
          >
            <form onSubmit={handleContactSubmit} className="space-y-6 glassmorphism p-8 md:p-12 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[#05070D]/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#AAB6D3]">Nome</Label>
                  <Input 
                    id="name" 
                    required 
                    value={contactForm.name} 
                    onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] focus-visible:ring-primary h-12" 
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#AAB6D3]">Empresa</Label>
                  <Input 
                    id="company" 
                    required 
                    value={contactForm.company} 
                    onChange={e => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                    className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] focus-visible:ring-primary h-12" 
                    placeholder="Nome da sua empresa"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-[#AAB6D3]">E-mail ou WhatsApp</Label>
                <Input 
                  id="contact" 
                  required 
                  value={contactForm.contact} 
                  onChange={e => setContactForm(prev => ({ ...prev, contact: e.target.value }))}
                  className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] focus-visible:ring-primary h-12" 
                  placeholder="Como podemos te contatar?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-[#AAB6D3]">O que você quer automatizar ou criar?</Label>
                <Textarea 
                  id="message" 
                  required 
                  value={contactForm.message} 
                  onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] focus-visible:ring-primary min-h-[120px] resize-none" 
                  placeholder="Descreva brevemente o problema que precisa resolver..."
                />
              </div>
              <Button type="submit" size="lg" className="w-full h-14 text-base font-bold bg-gradient-to-r from-[#123DFF] to-[#0A28CC] hover:from-[#1a47ff] hover:to-[#1230e0] text-white border-0 glow-blue group">
                <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Enviar pelo WhatsApp
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}