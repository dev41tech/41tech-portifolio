import { Link } from "wouter";
import { ArrowRight, Server, Activity, Database, Blocks, LayoutTemplate, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListProjects, useListTechnologies } from "@workspace/api-client-react";

export default function Home() {
  const { data: projects } = useListProjects({ featured: true });
  const { data: tech } = useListTechnologies();

  const services = [
    { title: "Sistemas Web", icon: LayoutTemplate },
    { title: "Automações", icon: Workflow },
    { title: "BI e Dashboards", icon: Activity },
    { title: "Integrações com APIs", icon: Blocks },
    { title: "IA aplicada a processos", icon: Database },
    { title: "Infra Docker e Deploy", icon: Server },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Operações otimizadas
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
              Tecnologia aplicada à <span className="text-primary glitch-wrapper inline-block">operação real.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Criamos sistemas, automações, dashboards e integrações que transformam processos manuais em soluções digitais escaláveis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                Quero transformar um processo em sistema
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-12 px-8 text-base border-primary/20 hover:bg-primary/10">
                <Link href="/projetos">Ver projetos <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-card/50 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">O que fazemos</h2>
            <p className="text-muted-foreground">Engenharia de software para resolver problemas complexos.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-background hover:border-primary/50 transition-colors group">
                <service.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-foreground">{service.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {projects && projects.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">Projetos em destaque</h2>
                <p className="text-muted-foreground">Soluções construídas para impacto real.</p>
              </div>
              <Button variant="ghost" asChild className="hidden md:flex text-primary">
                <Link href="/projetos">Ver todos <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map(project => (
                <Link key={project.id} href={`/projetos/${project.slug}`}>
                  <div className="group rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-all">
                    {project.coverImageUrl ? (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img src={project.coverImageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-muted flex items-center justify-center border-b border-border">
                        <Blocks className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">{project.shortDescription}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Button variant="outline" asChild className="w-full mt-8 md:hidden">
              <Link href="/projetos">Ver todos os projetos</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Tech Stack */}
      <section className="py-24 bg-primary/5 border-t border-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-12 text-foreground">Stack Tecnológico</h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {['Next.js', 'React', 'Node.js', 'MySQL', 'Docker', 'EasyPanel', 'n8n', 'Power BI', 'APIs', 'IA', 'GitHub'].map(t => (
              <span key={t} className="px-4 py-2 rounded-md bg-background border border-border text-foreground font-mono text-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-foreground max-w-3xl mx-auto">
            Quer transformar um processo manual em uma solução digital?
          </h2>
          <Button size="lg" className="h-14 px-8 text-lg">
            Falar com a 41 Tech
          </Button>
        </div>
      </section>
    </div>
  );
}
