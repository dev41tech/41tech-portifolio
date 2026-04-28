import { useListTeamMembers } from "@workspace/api-client-react";
import { Github, Linkedin, User2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Team() {
  const { data: team, isLoading } = useListTeamMembers();

  const activeTeam = team?.filter(member => member.isActive).sort((a, b) => a.sortOrder - b.sortOrder) || [];

  return (
    <div className="min-h-screen bg-[#05070D]">
      <section className="pt-32 pb-24 relative overflow-hidden bg-[#0B1020] border-b border-[rgba(255,255,255,0.05)]">
        <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Quem Faz a 41 Tech
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-foreground tracking-tight">A Equipe</h1>
            <p className="text-xl md:text-2xl text-[#AAB6D3] leading-relaxed">
              Engenheiros e especialistas focados em construir infraestrutura digital sólida para operações B2B de alto impacto.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-6">
                <Skeleton className="aspect-square w-full rounded-2xl bg-[#0B1020]" />
                <Skeleton className="h-8 w-2/3 bg-[#0B1020]" />
                <Skeleton className="h-5 w-1/2 bg-[#0B1020]" />
              </div>
            ))}
          </div>
        ) : activeTeam.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {activeTeam.map((member, i) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="group flex flex-col glassmorphism rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 h-full">
                  <div className="p-8 flex flex-col items-center flex-1">
                    <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-[#123DFF] to-[#00D8FF] mb-8 relative group-hover:scale-105 transition-transform duration-500">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#05070D] border-4 border-[#05070D]">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#061A44] to-[#123DFF]/20 text-3xl font-bold text-white">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-full glow-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-foreground mb-2 text-center group-hover:text-[#00D8FF] transition-colors">{member.name}</h3>
                    <p className="text-primary font-mono text-sm mb-6 text-center font-bold tracking-wide">{member.roleTitle}</p>
                    
                    {member.bio && (
                      <p className="text-[#AAB6D3] text-center mb-8 flex-1 leading-relaxed">{member.bio}</p>
                    )}
                    
                    {member.skills && member.skills.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {member.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} className="bg-[rgba(18,61,255,0.1)] text-[#AAB6D3] hover:text-white hover:bg-[rgba(18,61,255,0.3)] border border-[rgba(18,61,255,0.2)] font-mono text-xs font-normal transition-colors px-3 py-1">
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge className="bg-transparent text-[#AAB6D3] border border-[rgba(255,255,255,0.1)] font-mono text-xs font-normal px-3 py-1">
                            +{member.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center gap-4 mt-auto pt-6 border-t border-[rgba(255,255,255,0.05)] w-full">
                      {member.linkedinUrl && (
                        <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[#AAB6D3] hover:text-white hover:bg-[#123DFF] hover:scale-110 transition-all duration-300">
                          <Linkedin className="w-5 h-5" />
                          <span className="sr-only">LinkedIn</span>
                        </a>
                      )}
                      {member.githubUrl && (
                        <a href={member.githubUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[#AAB6D3] hover:text-white hover:bg-[#123DFF] hover:scale-110 transition-all duration-300">
                          <Github className="w-5 h-5" />
                          <span className="sr-only">GitHub</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-[#0B1020] border border-[rgba(255,255,255,0.05)] rounded-2xl max-w-3xl mx-auto">
            <User2 className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Equipe em atualização</h3>
            <p className="text-[#AAB6D3] text-lg">Em breve nossa equipe estará listada aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}