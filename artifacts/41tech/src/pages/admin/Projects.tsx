import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { 
  useListProjects, 
  getListProjectsQueryKey,
  useCreateProject,
  useUpdateProject,
  useDeleteProject
} from "@workspace/api-client-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const projectSchema = z.object({
  title: z.string().min(2, "Título é obrigatório"),
  slug: z.string().min(2, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hifens"),
  shortDescription: z.string().min(10, "Descrição curta é obrigatória"),
  fullDescription: z.string().optional().nullable(),
  problem: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  result: z.string().optional().nullable(),
  previewType: z.enum(["image", "video", "none"]).default("none"),
  previewUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  previewAlt: z.string().optional().nullable(),
  coverImageUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  thumbnailUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  galleryImages: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  metricsSummary: z.string().optional().nullable(),
  demoUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  repositoryUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  status: z.string().min(1, "Status é obrigatório"),
  featured: z.boolean().default(false),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function AdminProjects() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: projects, isLoading } = useListProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      fullDescription: "",
      problem: "",
      solution: "",
      result: "",
      previewType: "none",
      previewUrl: "",
      previewAlt: "",
      coverImageUrl: "",
      thumbnailUrl: "",
      galleryImages: "",
      category: "",
      metricsSummary: "",
      demoUrl: "",
      repositoryUrl: "",
      status: "published",
      featured: false,
    },
  });

  const handleOpenCreate = () => {
    form.reset({
      title: "",
      slug: "",
      shortDescription: "",
      fullDescription: "",
      problem: "",
      solution: "",
      result: "",
      previewType: "none",
      previewUrl: "",
      previewAlt: "",
      coverImageUrl: "",
      thumbnailUrl: "",
      galleryImages: "",
      category: "",
      metricsSummary: "",
      demoUrl: "",
      repositoryUrl: "",
      status: "published",
      featured: false,
    });
    setEditingSlug(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: any) => {
    form.reset({
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription,
      fullDescription: project.fullDescription || "",
      problem: project.problem || "",
      solution: project.solution || "",
      result: project.result || "",
      previewType: project.previewType || "none",
      previewUrl: project.previewUrl || "",
      previewAlt: project.previewAlt || "",
      coverImageUrl: project.coverImageUrl || "",
      thumbnailUrl: project.thumbnailUrl || "",
      galleryImages: project.galleryImages || "",
      category: project.category || "",
      metricsSummary: project.metricsSummary || "",
      demoUrl: project.demoUrl || "",
      repositoryUrl: project.repositoryUrl || "",
      status: project.status,
      featured: project.featured,
    });
    setEditingSlug(project.slug);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (slug: string) => {
    setDeletingSlug(slug);
    setIsDeleteOpen(true);
  };

  const watchedPreviewType = form.watch("previewType");
  const watchedPreviewUrl = form.watch("previewUrl");

  const onSubmit = (values: ProjectFormValues) => {
    const data = {
      ...values,
      fullDescription: values.fullDescription || null,
      problem: values.problem || null,
      solution: values.solution || null,
      result: values.result || null,
      previewType: values.previewType || null,
      previewUrl: values.previewUrl || null,
      previewAlt: values.previewAlt || null,
      coverImageUrl: values.coverImageUrl || null,
      thumbnailUrl: values.thumbnailUrl || null,
      galleryImages: values.galleryImages || null,
      category: values.category || null,
      metricsSummary: values.metricsSummary || null,
      demoUrl: values.demoUrl || null,
      repositoryUrl: values.repositoryUrl || null,
    };

    if (editingSlug) {
      updateMutation.mutate(
        { slug: editingSlug, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
            toast({ title: "Projeto atualizado com sucesso" });
            setIsFormOpen(false);
          },
          onError: (error: any) => {
            toast({ title: "Erro ao atualizar projeto", description: error.error || "Tente novamente", variant: "destructive" });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
            toast({ title: "Projeto criado com sucesso" });
            setIsFormOpen(false);
          },
          onError: (error: any) => {
            toast({ title: "Erro ao criar projeto", description: error.error || "Tente novamente", variant: "destructive" });
          }
        }
      );
    }
  };

  const confirmDelete = () => {
    if (!deletingSlug) return;
    
    deleteMutation.mutate(
      { slug: deletingSlug },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast({ title: "Projeto removido com sucesso" });
          setIsDeleteOpen(false);
        },
        onError: (error: any) => {
          toast({ title: "Erro ao remover projeto", description: error.error || "Tente novamente", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground">Gerencie o portfólio de projetos da empresa.</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
            <DialogHeader className="p-6 border-b border-border">
              <DialogTitle>{editingSlug ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do projeto para exibição no portfólio.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              <Form {...form}>
                <form id="project-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="slug" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (URL)</FormLabel>
                        <FormControl><Input {...field} disabled={!!editingSlug} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Sistema Web">Sistema Web</SelectItem>
                            <SelectItem value="BI & Dados">BI & Dados</SelectItem>
                            <SelectItem value="Automação">Automação</SelectItem>
                            <SelectItem value="Integração">Integração</SelectItem>
                            <SelectItem value="IA">IA</SelectItem>
                            <SelectItem value="Infra & Deploy">Infra & Deploy</SelectItem>
                            <SelectItem value="ERP">ERP</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="shortDescription" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Curta</FormLabel>
                      <FormControl><Textarea {...field} className="h-20" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="metricsSummary" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Métricas de Resultado (resumo)</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="-60% tempo | 100% centralização" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 gap-6 border-t border-border pt-6">
                    <h3 className="font-medium text-lg">Conteúdo Detalhado</h3>
                    <FormField control={form.control} name="fullDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visão Geral</FormLabel>
                        <FormControl><Textarea {...field} value={field.value || ""} className="h-32" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="problem" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Problema Resolvido</FormLabel>
                        <FormControl><Textarea {...field} value={field.value || ""} className="h-24" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="solution" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Solução Implementada</FormLabel>
                        <FormControl><Textarea {...field} value={field.value || ""} className="h-24" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="result" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resultados Obtidos</FormLabel>
                        <FormControl><Textarea {...field} value={field.value || ""} className="h-24" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 gap-6 border-t border-border pt-6">
                    <h3 className="font-medium text-lg">Mídia e Preview do Projeto</h3>
                    <p className="text-sm text-muted-foreground -mt-4">Defina como o projeto será exibido visualmente na página pública.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="previewType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de preview</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "none"}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum (fallback premium)</SelectItem>
                              <SelectItem value="image">Imagem / GIF</SelectItem>
                              <SelectItem value="video">Vídeo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="previewAlt" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Texto alternativo da preview</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} placeholder="Ex: Dashboard de gestão financeira" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="previewUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da imagem ou vídeo de preview</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} placeholder="Cole aqui a URL da imagem, gif ou vídeo demonstrativo do projeto." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {watchedPreviewUrl && watchedPreviewType !== "none" && (
                      <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-video w-full relative">
                        {watchedPreviewType === "image" ? (
                          <img
                            src={watchedPreviewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : watchedPreviewType === "video" ? (
                          <video
                            src={watchedPreviewUrl}
                            controls
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLVideoElement).style.display = "none"; }}
                          />
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6">
                    <h3 className="font-medium text-lg md:col-span-2">Imagens Adicionais</h3>
                    <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagem de capa do projeto</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} placeholder="https://..." /></FormControl>
                        {field.value && <img src={field.value} alt="Preview" className="mt-2 h-20 w-auto object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="thumbnailUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Thumbnail (cards)</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} placeholder="https://..." /></FormControl>
                        {field.value && <img src={field.value} alt="Preview" className="mt-2 h-20 w-auto object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="md:col-span-2">
                      <FormField control={form.control} name="galleryImages" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Galeria de imagens</FormLabel>
                          <FormControl><Textarea {...field} value={field.value || ""} className="h-24" placeholder="Adicione uma URL por linha." /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="demoUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link de demonstração</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} placeholder="https://..." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="repositoryUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link do repositório</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} placeholder="https://github.com/..." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="featured" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 bg-card">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Destaque na Home</FormLabel>
                        <p className="text-sm text-muted-foreground">Exibir este projeto na seção de destaques da página inicial.</p>
                      </div>
                    </FormItem>
                  )} />
                </form>
              </Form>
            </div>

            <div className="shrink-0 p-6 border-t border-border flex justify-end gap-2 bg-background">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit" form="project-form" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projeto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Destaque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 inline-block" /></TableCell>
                </TableRow>
              ))
            ) : projects?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              projects?.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{project.title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-md">{project.shortDescription}</div>
                  </TableCell>
                  <TableCell>
                    {project.category ? (
                      <Badge variant="secondary">{project.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.featured ? (
                      <Badge className="bg-primary/20 text-primary border-primary/30">Sim</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/projetos/${project.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(project)}>
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(project.slug)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este projeto permanentemente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
