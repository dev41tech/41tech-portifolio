import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Loader2, ExternalLink, Image as ImageIcon } from "lucide-react";
import {
  useListCases,
  getListCasesQueryKey,
  useCreateCase,
  useUpdateCase,
  useDeleteCase
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
import { ScrollArea } from "@/components/ui/scroll-area";

const caseSchema = z.object({
  title: z.string().min(2, "Título é obrigatório"),
  slug: z.string().min(2, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hifens"),
  clientSegment: z.string().optional().nullable(),
  problem: z.string().min(10, "Problema é obrigatório"),
  solution: z.string().min(10, "Solução é obrigatória"),
  result: z.string().min(10, "Resultado é obrigatório"),
  metricsSummary: z.string().optional().nullable(),
  coverImageUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  videoUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  galleryImages: z.string().optional().nullable(),
  relatedUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  isPublic: z.boolean().default(true),
});

type CaseFormValues = z.infer<typeof caseSchema>;

export default function AdminCases() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cases, isLoading } = useListCases();
  const createMutation = useCreateCase();
  const updateMutation = useUpdateCase();
  const deleteMutation = useDeleteCase();

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      title: "",
      slug: "",
      clientSegment: "",
      problem: "",
      solution: "",
      result: "",
      metricsSummary: "",
      coverImageUrl: "",
      videoUrl: "",
      galleryImages: "",
      relatedUrl: "",
      isPublic: true,
    },
  });

  const watchedCoverImageUrl = form.watch("coverImageUrl");
  const watchedVideoUrl = form.watch("videoUrl");

  const handleOpenCreate = () => {
    form.reset({
      title: "",
      slug: "",
      clientSegment: "",
      problem: "",
      solution: "",
      result: "",
      metricsSummary: "",
      coverImageUrl: "",
      videoUrl: "",
      galleryImages: "",
      relatedUrl: "",
      isPublic: true,
    });
    setEditingSlug(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (caseItem: any) => {
    form.reset({
      title: caseItem.title,
      slug: caseItem.slug,
      clientSegment: caseItem.clientSegment || "",
      problem: caseItem.problem,
      solution: caseItem.solution,
      result: caseItem.result,
      metricsSummary: caseItem.metricsSummary || "",
      coverImageUrl: caseItem.coverImageUrl || "",
      videoUrl: caseItem.videoUrl || "",
      galleryImages: caseItem.galleryImages || "",
      relatedUrl: caseItem.relatedUrl || "",
      isPublic: caseItem.isPublic,
    });
    setEditingSlug(caseItem.slug);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (slug: string) => {
    setDeletingSlug(slug);
    setIsDeleteOpen(true);
  };

  const onSubmit = (values: CaseFormValues) => {
    const data = {
      ...values,
      clientSegment: values.clientSegment || null,
      metricsSummary: values.metricsSummary || null,
      coverImageUrl: values.coverImageUrl || null,
      videoUrl: values.videoUrl || null,
      galleryImages: values.galleryImages || null,
      relatedUrl: values.relatedUrl || null,
    };

    if (editingSlug) {
      updateMutation.mutate(
        { slug: editingSlug, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
            toast({ title: "Case atualizado com sucesso" });
            setIsFormOpen(false);
          },
          onError: (error: any) => {
            toast({ title: "Erro ao atualizar case", description: error.error || "Tente novamente", variant: "destructive" });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
            toast({ title: "Case criado com sucesso" });
            setIsFormOpen(false);
          },
          onError: (error: any) => {
            toast({ title: "Erro ao criar case", description: error.error || "Tente novamente", variant: "destructive" });
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
          queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
          toast({ title: "Case removido com sucesso" });
          setIsDeleteOpen(false);
        },
        onError: (error: any) => {
          toast({ title: "Erro ao remover case", description: error.error || "Tente novamente", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cases</h1>
          <p className="text-muted-foreground">Estudos de caso reais detalhando problema, solução e resultados.</p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Case
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
            <DialogHeader className="p-6 border-b border-border">
              <DialogTitle>{editingSlug ? "Editar Case" : "Novo Case"}</DialogTitle>
              <DialogDescription>
                Descreva os desafios de negócios e as soluções técnicas implementadas.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 p-6">
              <Form {...form}>
                <form id="case-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                  <FormField control={form.control} name="clientSegment" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segmento do Cliente (ex: Indústria, Varejo, Logística)</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="space-y-6 border-t border-border pt-6">
                    <h3 className="font-medium text-lg">A História</h3>
                    <FormField control={form.control} name="problem" render={({ field }) => (
                      <FormItem>
                        <FormLabel>O Desafio (Problema)</FormLabel>
                        <FormControl><Textarea {...field} className="h-32" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="solution" render={({ field }) => (
                      <FormItem>
                        <FormLabel>A Solução Técnica</FormLabel>
                        <FormControl><Textarea {...field} className="h-32" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="result" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resultados</FormLabel>
                        <FormControl><Textarea {...field} className="h-32" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="metricsSummary" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumo de Métricas (Impacto em números)</FormLabel>
                      <FormControl><Textarea {...field} value={field.value || ""} className="h-20" placeholder="Ex: 40% redução de custos, 2x velocidade operacional..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* ─── Mídia do Case ─── */}
                  <div className="space-y-6 border-t border-border pt-6">
                    <div>
                      <h3 className="font-medium text-lg flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-primary" />
                        Mídia do Case
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Adicione imagens e vídeo para enriquecer a apresentação deste case.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Imagem principal do case</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="https://..." />
                          </FormControl>
                          {watchedCoverImageUrl && (
                            <img
                              src={watchedCoverImageUrl}
                              alt="Preview capa"
                              className="mt-2 h-24 w-full object-cover rounded-lg border border-border"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          )}
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="videoUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vídeo demonstrativo do case</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="https://..." />
                          </FormControl>
                          {watchedVideoUrl && (
                            <video
                              src={watchedVideoUrl}
                              controls
                              muted
                              playsInline
                              className="mt-2 h-24 w-full object-cover rounded-lg border border-border"
                              onError={(e) => { (e.target as HTMLVideoElement).style.display = "none"; }}
                            />
                          )}
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="galleryImages" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Galeria de imagens</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} className="h-24" placeholder="Cole uma URL por linha." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="relatedUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link relacionado (demo, artigo, etc.)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="isPublic" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 bg-card">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Público</FormLabel>
                        <p className="text-sm text-muted-foreground">O case ficará visível publicamente no site.</p>
                      </div>
                    </FormItem>
                  )} />
                </form>
              </Form>
            </ScrollArea>

            <div className="p-6 border-t border-border flex justify-end gap-2 bg-background mt-auto">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit" form="case-form" disabled={createMutation.isPending || updateMutation.isPending}>
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
              <TableHead>Case</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead>Mídia</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 inline-block" /></TableCell>
                </TableRow>
              ))
            ) : cases?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum case encontrado.
                </TableCell>
              </TableRow>
            ) : (
              cases?.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{caseItem.title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-md">{caseItem.problem}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {caseItem.clientSegment || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(caseItem as any).coverImageUrl && <Badge variant="outline" className="text-xs">img</Badge>}
                      {(caseItem as any).videoUrl && <Badge variant="outline" className="text-xs">vídeo</Badge>}
                      {!(caseItem as any).coverImageUrl && !(caseItem as any).videoUrl && <span className="text-muted-foreground text-xs">—</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {caseItem.isPublic ? (
                      <Badge className="bg-primary/20 text-primary border-primary/30">Público</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Privado</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/cases/${caseItem.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(caseItem)}>
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(caseItem.slug)}>
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
              Tem certeza que deseja excluir este case permanentemente? Esta ação não pode ser desfeita.
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
