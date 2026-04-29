import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListProjects } from "@workspace/api-client-react";
import { Blocks, ArrowRight, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

const ALL_CATEGORIES = ["Todos", "Sistema Web", "BI & Dados", "Automação", "Integração", "IA", "Infra & Deploy", "ERP", "Outro"];

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const inferCategory = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('dashboard') || t.includes('bi') || t.includes('dados')) return "BI & Dados";
    if (t.includes('automação') || t.includes('integração') || t.includes('n8n')) return "Automação";
    return "Sistema Web";
  };

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects.filter(project => {
      const matchSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      
      const projectCategory = project.category || inferCategory(project.title);
      const matchCategory = selectedCategory === "Todos" || projectCategory === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [projects, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#05070D]">
      {/* Page Header */}
      <section className="pt-32 pb-24 relative overflow-hidden bg-[#0B1020] border-b border-[rgba(255,255,255,0.05)]">
        <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Nosso Portfólio
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-foreground tracking-tight">Projetos</h1>
            <p className="text-xl md:text-2xl text-[#AAB6D3] leading-relaxed">
              Conheça os sistemas e plataformas que construímos para otimizar operações corporativas.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, descrição..."
                className="pl-12 h-14 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] focus-visible:ring-primary text-lg"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category 
                      ? "bg-primary text-white border-transparent" 
                      : "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#AAB6D3] hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl bg-[#0B1020]" />
                <Skeleton className="h-8 w-3/4 bg-[#0B1020]" />
                <Skeleton className="h-4 w-full bg-[#0B1020]" />
                <Skeleton className="h-4 w-2/3 bg-[#0B1020]" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="h-full"
              >
                <Link href={`/projetos/${project.slug}`}>
                  <div className="group h-full flex flex-col rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[#0B1020] hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] shadow-lg">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#061A44] to-[#05070D] relative flex items-center justify-center">
                      {(() => {
                        const cardImg = project.thumbnailUrl || (project.previewType === "image" ? project.previewUrl : null) || project.coverImageUrl;
                        return cardImg ? (
                          <img src={cardImg} alt={project.previewAlt || project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        ) : null;
                      })()}
                      {!(project.thumbnailUrl || (project.previewType === "image" ? project.previewUrl : null) || project.coverImageUrl) && (
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
                      <p className="text-[#AAB6D3] line-clamp-3 mb-6 flex-1 text-lg leading-relaxed">{project.shortDescription}</p>
                      
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
        ) : (
          <div className="text-center py-32 bg-[#0B1020] border border-[rgba(255,255,255,0.05)] rounded-2xl">
            <Blocks className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Nenhum projeto encontrado</h3>
            <p className="text-[#AAB6D3] text-lg">Nenhum projeto corresponde aos filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
}