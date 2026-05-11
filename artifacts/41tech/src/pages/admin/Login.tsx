import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail, Loader2 } from "lucide-react";
import { useLogin, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Logo } from "@/components/brand/Logo";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const formSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const { data: user } = useGetMe({ query: { retry: false, queryKey: getGetMeQueryKey() } });

  useEffect(() => {
    if (user) {
      setLocation("/admin-41tech/dashboard");
    }
  }, [user, setLocation]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "Acesso concedido",
            description: "Bem-vindo ao painel de controle.",
          });
          setLocation("/admin-41tech/dashboard");
        },
        onError: (error) => {
          toast({
            title: "Acesso negado",
            description: (error.data as { error?: string } | null)?.error ?? "Credenciais inválidas.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl relative z-10">
        <CardHeader className="space-y-4 text-center pb-8 border-b border-border/50">
          <div className="mx-auto w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-2">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <Logo className="text-2xl mb-1" />
            <CardDescription className="text-muted-foreground mt-2">
              Acesso restrito à infraestrutura de gestão
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">E-mail corporativo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="admin@grupo41.com.br" className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Senha de acesso</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 font-medium" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  "Acessar Sistema"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
