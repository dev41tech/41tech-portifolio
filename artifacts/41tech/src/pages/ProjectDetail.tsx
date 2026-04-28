import { useRoute } from "wouter";
import { useGetProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, ExternalLink, Github, LayoutTemplate } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetail() {
  const [, params] = useRoute("/projetos/:slug");
  const slug = params?.slug || "";

  const { data: project, isLoading, isError } = useGetProject(slug, {
    query: { enabled: !!slug, queryKey: getGetProjectQueryKey(slug) }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Skeleton className="h-8 w-24 mb-12" />
        <Skeleton className="h-16 w-3/4 mb-6" />
        <Skeleton className="h-6 w-1/2 mb-12" />
        <Skeleton className="aspect-video w-full rounded-xl mb-12" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold mb-4">Projeto não encontrado</h1>
        <Button asChild>
          <Link href="/projetos">Voltar para projetos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border pt-16 pb-20">
        <div className="container mx-auto px-4">
          <Link href="/projetos" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Todos os projetos
          </Link>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight">
              {project.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              {project.shortDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        {project.coverImageUrl ? (
          <div className="aspect-[21/9] w-full rounded-xl overflow-hidden shadow-2xl border border-border bg-background mb-16">
            <img src={project.coverImageUrl} alt={project.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[21/9] w-full rounded-xl shadow-2xl border border-border bg-muted flex items-center justify-center mb-16">
            <LayoutTemplate className="w-20 h-20 text-muted-foreground/30" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
            {project.fullDescription && (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-foreground">Visão Geral</h2>
                <div className="prose prose-invert max-w-none text-muted-foreground">
                  <p className="whitespace-pre-wrap">{project.fullDescription}</p>
                </div>
              </section>
            )}

            {project.problem && (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-foreground">O Problema</h2>
                <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-foreground">
                  <p className="whitespace-pre-wrap">{project.problem}</p>
                </div>
              </section>
            )}

            {project.solution && (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-foreground">A Solução</h2>
                <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 text-foreground">
                  <p className="whitespace-pre-wrap">{project.solution}</p>
                </div>
              </section>
            )}

            {project.result && (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-foreground">Resultado</h2>
                <div className="p-6 rounded-lg bg-secondary/10 border border-secondary/20 text-foreground">
                  <p className="whitespace-pre-wrap">{project.result}</p>
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            <div className="p-6 rounded-xl border border-border bg-card space-y-6 sticky top-24">
              <h3 className="font-bold text-lg text-foreground border-b border-border pb-4">Detalhes</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30 capitalize">
                    {project.status}
                  </span>
                </div>
                
                {(project.demoUrl || project.repositoryUrl) && (
                  <div className="pt-4 border-t border-border space-y-3">
                    {project.demoUrl && (
                      <Button asChild className="w-full justify-start" variant="default">
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Acessar Projeto
                        </a>
                      </Button>
                    )}
                    {project.repositoryUrl && (
                      <Button asChild className="w-full justify-start" variant="outline">
                        <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          Repositório
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
