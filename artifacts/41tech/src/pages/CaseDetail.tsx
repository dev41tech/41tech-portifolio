import { useRoute } from "wouter";
import { useGetCase, getGetCaseQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, BarChart3, Target, Activity, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CaseDetail() {
  const [, params] = useRoute("/cases/:slug");
  const slug = params?.slug || "";

  const { data: caseStudy, isLoading, isError } = useGetCase(slug, {
    query: { enabled: !!slug, queryKey: getGetCaseQueryKey(slug) }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Skeleton className="h-8 w-24 mb-12" />
        <Skeleton className="h-16 w-3/4 mb-6" />
        <Skeleton className="h-6 w-1/2 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !caseStudy) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold mb-4">Case não encontrado</h1>
        <Button asChild>
          <Link href="/">Voltar para o início</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border pt-16 pb-20">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o início
          </Link>
          
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Estudo de Caso
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight">
              {caseStudy.title}
            </h1>
            {caseStudy.clientSegment && (
              <p className="text-xl text-muted-foreground flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" />
                Segmento: {caseStudy.clientSegment}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-12 lg:col-span-2">
            <section className="bg-background border border-border p-8 rounded-xl relative overflow-hidden group hover:border-destructive/30 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
              <div className="flex items-start gap-4">
                <Activity className="w-8 h-8 text-destructive shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">O Desafio</h2>
                  <div className="prose prose-invert max-w-none text-muted-foreground">
                    <p className="whitespace-pre-wrap">{caseStudy.problem}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-background border border-border p-8 rounded-xl relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex items-start gap-4">
                <Lightbulb className="w-8 h-8 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">A Solução</h2>
                  <div className="prose prose-invert max-w-none text-muted-foreground">
                    <p className="whitespace-pre-wrap">{caseStudy.solution}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-background border border-border p-8 rounded-xl relative overflow-hidden group hover:border-secondary/30 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
              <div className="flex items-start gap-4">
                <BarChart3 className="w-8 h-8 text-secondary shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">O Resultado</h2>
                  <div className="prose prose-invert max-w-none text-muted-foreground">
                    <p className="whitespace-pre-wrap">{caseStudy.result}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {caseStudy.metricsSummary && (
              <div className="p-8 rounded-xl bg-card border border-border sticky top-24">
                <h3 className="font-bold text-xl text-foreground mb-6 flex items-center border-b border-border pb-4">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  Métricas de Impacto
                </h3>
                <div className="prose prose-invert max-w-none text-muted-foreground font-medium">
                  <p className="whitespace-pre-wrap leading-relaxed">{caseStudy.metricsSummary}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-border">
                  <Button asChild className="w-full">
                    <a href="#contato">Quero resultados similares</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
