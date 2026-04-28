import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";

import { 
  useGetSiteSettings, 
  useUpdateSiteSettings, 
  getGetSiteSettingsQueryKey 
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const settingsSchema = z.object({
  heroVideoUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  heroVideoEnabled: z.boolean().default(false),
  heroFallbackImageUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  whatsappUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  contactEmail: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  linkedinUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  ctaPrimaryLabel: z.string().min(1, "Obrigatório"),
  ctaSecondaryLabel: z.string().min(1, "Obrigatório"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading } = useGetSiteSettings();
  const mutation = useUpdateSiteSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      heroVideoUrl: "",
      heroVideoEnabled: false,
      heroFallbackImageUrl: "",
      whatsappUrl: "",
      contactEmail: "",
      linkedinUrl: "",
      ctaPrimaryLabel: "Transformar meu processo",
      ctaSecondaryLabel: "Ver projetos",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        heroVideoUrl: settings.heroVideoUrl || "",
        heroVideoEnabled: settings.heroVideoEnabled,
        heroFallbackImageUrl: settings.heroFallbackImageUrl || "",
        whatsappUrl: settings.whatsappUrl || "",
        contactEmail: settings.contactEmail || "",
        linkedinUrl: settings.linkedinUrl || "",
        ctaPrimaryLabel: settings.ctaPrimaryLabel || "Transformar meu processo",
        ctaSecondaryLabel: settings.ctaSecondaryLabel || "Ver projetos",
      });
    }
  }, [settings, form]);

  const onSubmit = (values: SettingsFormValues) => {
    const data = {
      ...values,
      heroVideoUrl: values.heroVideoUrl || null,
      heroFallbackImageUrl: values.heroFallbackImageUrl || null,
      whatsappUrl: values.whatsappUrl || null,
      contactEmail: values.contactEmail || null,
      linkedinUrl: values.linkedinUrl || null,
    };

    mutation.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() });
          toast({ title: "Configurações atualizadas com sucesso" });
        },
        onError: (error: any) => {
          toast({ 
            title: "Erro ao atualizar", 
            description: error.error || "Tente novamente", 
            variant: "destructive" 
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações globais do site.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle>Hero</CardTitle>
              <CardDescription>Configurações da seção principal da Home.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="heroVideoEnabled" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativar Vídeo no Hero</FormLabel>
                    <FormDescription>
                      Mostra o vídeo de fundo na página inicial se estiver ativado.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="heroVideoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Vídeo do Hero</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="https://..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="heroFallbackImageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem de Fallback do Hero</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="https://..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contato & Links</CardTitle>
              <CardDescription>Redes sociais e meios de contato.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="whatsappUrl" render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>URL do WhatsApp (CTA principal)</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="https://wa.me/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="contactEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail de Contato</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} type="email" placeholder="contato@..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>LinkedIn da Empresa</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="https://linkedin.com/company/..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CTAs</CardTitle>
              <CardDescription>Textos dos botões principais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="ctaPrimaryLabel" render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Texto do CTA Principal</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="ctaSecondaryLabel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto do CTA Secundário</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Configurações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
