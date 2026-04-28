import { Link } from "wouter";
import { useListProjects } from "@workspace/api-client-react";
import { Blocks, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-2xl mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Projetos</h1>
        <p className="text-xl text-muted-foreground">
          Conheça os sistemas e plataformas que construímos para otimizar operações corporativas.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : projects?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <Link key={project.id} href={`/projetos/${project.slug}`}>
              <div className="group h-full flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-all">
                {project.coverImageUrl ? (
                  <div className="aspect-video w-full overflow-hidden bg-muted relative">
                    <img src={project.coverImageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {project.featured && (
                      <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                        Destaque
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-muted flex items-center justify-center border-b border-border relative">
                    <Blocks className="w-12 h-12 text-muted-foreground/50" />
                    {project.featured && (
                      <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                        Destaque
                      </Badge>
                    )}
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors text-foreground">{project.title}</h3>
                  <p className="text-muted-foreground line-clamp-3 mb-6 flex-1">{project.shortDescription}</p>
                  <div className="flex items-center text-primary text-sm font-medium mt-auto">
                    Ver detalhes <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card border border-border rounded-xl">
          <Blocks className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Nenhum projeto encontrado</h3>
          <p className="text-muted-foreground">Os projetos aparecerão aqui em breve.</p>
        </div>
      )}
    </div>
  );
}
