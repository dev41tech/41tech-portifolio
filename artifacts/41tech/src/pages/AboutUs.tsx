import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGetSiteSettings, useListTechnologies } from "@workspace/api-client-react";
import { Send, CheckCircle2, ChevronRight } from "lucide-react";

const DIFFERENTIALS = [
  "Entendemos a operação antes de escrever código",
  "Criamos soluções sob medida para cada negócio",
  "Conectamos dados, sistemas e pessoas",
  "Pensamos em escala, segurança e manutenção",
];

const STEPS = [
  { num: "01", title: "Diagnóstico do processo", desc: "Mapeamos o fluxo atual, os gargalos e as oportunidades de melhoria." },
  { num: "02", title: "Desenho da solução", desc: "Definimos a arquitetura e as ferramentas ideais para o seu contexto." },
  { num: "03", title: "Desenvolvimento", desc: "Construímos com agilidade, boas práticas e código limpo." },
  { num: "04", title: "Validação com usuários", desc: "Testamos junto a quem vai usar no dia a dia, refinando o produto." },
  { num: "05", title: "Deploy e melhoria contínua", desc: "Colocamos em produção e evoluímos com base no uso real." },
];

export default function AboutUs() {
  const { data: settings } = useGetSiteSettings();
  const { data: technologies } = useListTechnologies();

  const handleContactClick = () => {
    if (settings?.whatsappUrl) {
      window.open(settings.whatsappUrl, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = "/#contato";
    }
  };

  return (
    <div className="min-h-screen bg-[#05070D]">
      {/* Hero */}
      <section className="pt-32 pb-24 relative overflow-hidden bg-[#0B1020] border-b border-[rgba(255,255,255,0.05)]">
        <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-primary/8 blur-[180px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Nossa história
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-foreground tracking-tight leading-tight">
              Sobre nós
            </h1>
            <p className="text-xl md:text-2xl text-[#AAB6D3] leading-relaxed">
              Somos a 41 Tech, o setor de tecnologia do Grupo 41 focado em transformar operação real em sistemas, automações e inteligência de dados.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24 space-y-32 max-w-5xl">

        {/* Quem somos */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-extrabold mb-6 text-foreground">Quem somos</h2>
              <p className="text-xl text-[#AAB6D3] leading-relaxed">
                Unimos desenvolvimento de software, automação, BI, integrações e inteligência artificial para resolver gargalos operacionais reais dentro de empresas.
              </p>
              <p className="text-xl text-[#AAB6D3] leading-relaxed mt-4">
                Nascemos dentro do Grupo 41 para resolver nossos próprios problemas — e rapidamente percebemos que essas soluções valem para muitas outras empresas.
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B1020] p-10 relative overflow-hidden">
              <div className="absolute inset-0 tech-grid opacity-20" />
              <div className="relative z-10 space-y-6">
                <div className="text-5xl font-extrabold text-primary">B2B</div>
                <p className="text-[#AAB6D3] text-lg">Focados em empresas que precisam de tecnologia séria para problemas sérios.</p>
                <div className="pt-4 border-t border-[rgba(255,255,255,0.08)]">
                  <img src="/logo-white.png" alt="41 Tech" className="h-8 w-auto opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Diferenciais */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-extrabold mb-12 text-foreground">O que nos diferencia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DIFFERENTIALS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B1020] hover:border-primary/30 transition-colors"
              >
                <CheckCircle2 className="w-6 h-6 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                <p className="text-lg text-[#AAB6D3] leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Como trabalhamos */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-extrabold mb-12 text-foreground">Como trabalhamos</h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-[#00D8FF]/30 to-transparent hidden md:block" />
            <div className="space-y-8">
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-8 items-start md:pl-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 relative z-10">
                    <span className="text-sm font-black text-primary">{step.num}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                      {step.title}
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </h3>
                    <p className="text-[#AAB6D3] text-lg leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Nossa stack */}
        {technologies && technologies.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-extrabold mb-12 text-foreground">Nossa stack</h2>
            <div className="flex flex-wrap gap-3">
              {technologies.map((tech) => (
                <div
                  key={tech.id}
                  className="px-5 py-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0B1020] text-[#AAB6D3] font-medium hover:border-primary/40 hover:text-white transition-all"
                >
                  {tech.name}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="p-12 md:p-16 rounded-3xl bg-gradient-to-br from-[#061A44] to-[#0B1020] border border-primary/20 text-center relative overflow-hidden">
            <div className="absolute inset-0 tech-grid opacity-20" />
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Tem um processo manual travando sua operação?
              </h3>
              <p className="text-[#AAB6D3] text-xl mb-10 max-w-2xl mx-auto">
                Podemos transformar isso em sistema. Vamos conversar.
              </p>
              <Button
                size="lg"
                onClick={handleContactClick}
                className="h-14 px-10 text-base font-bold bg-gradient-to-r from-[#123DFF] to-[#0A28CC] hover:from-[#1a47ff] hover:to-[#1230e0] text-white border-0 glow-blue"
              >
                Falar conosco <Send className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
