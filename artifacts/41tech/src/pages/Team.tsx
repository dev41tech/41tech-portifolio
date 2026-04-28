import { useListTeamMembers } from "@workspace/api-client-react";
import { Github, Linkedin, User2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Team() {
  const { data: team, isLoading } = useListTeamMembers();

  const activeTeam = team?.filter(member => member.isActive).sort((a, b) => a.sortOrder - b.sortOrder) || [];

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-2xl mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">A Equipe</h1>
        <p className="text-xl text-muted-foreground">
          Engenheiros e especialistas focados em construir infraestrutura digital sólida para empresas reais.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : activeTeam.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {activeTeam.map(member => (
            <div key={member.id} className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
              {member.avatarUrl ? (
                <div className="aspect-square w-full overflow-hidden bg-muted">
                  <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0" />
                </div>
              ) : (
                <div className="aspect-square w-full bg-muted flex items-center justify-center border-b border-border">
                  <User2 className="w-16 h-16 text-muted-foreground/30" />
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-primary font-mono text-sm mb-4">{member.roleTitle}</p>
                
                {member.bio && (
                  <p className="text-muted-foreground text-sm mb-6 flex-1">{member.bio}</p>
                )}
                
                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {member.skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 font-normal">
                        {skill}
                      </Badge>
                    ))}
                    {member.skills.length > 3 && (
                      <Badge variant="outline" className="font-normal text-muted-foreground">
                        +{member.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
                  {member.linkedinUrl && (
                    <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="w-5 h-5" />
                      <span className="sr-only">LinkedIn</span>
                    </a>
                  )}
                  {member.githubUrl && (
                    <a href={member.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Github className="w-5 h-5" />
                      <span className="sr-only">GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card border border-border rounded-xl">
          <User2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Equipe em atualização</h3>
          <p className="text-muted-foreground">Em breve nossa equipe estará listada aqui.</p>
        </div>
      )}
    </div>
  );
}
