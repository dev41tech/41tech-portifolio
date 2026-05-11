import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Loader2, Cpu } from "lucide-react";
import {
  useListTechnologies,
  getListTechnologiesQueryKey,
  useCreateTechnology,
  useUpdateTechnology,
  useDeleteTechnology,
} from "@workspace/api-client-react";
import { ImageUploadField } from "@/components/ui/image-upload-field";

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
import {
  Dialog,
  DialogContent,
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
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const techSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  category: z.string().optional().nullable(),
  iconUrl: z.string().optional().nullable().or(z.literal("")),
});

type TechFormValues = z.infer<typeof techSchema>;

export default function AdminTechnologies() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: technologies, isLoading } = useListTechnologies();
  const createMutation = useCreateTechnology();
  const updateMutation = useUpdateTechnology();
  const deleteMutation = useDeleteTechnology();

  const form = useForm<TechFormValues>({
    resolver: zodResolver(techSchema),
    defaultValues: {
      name: "",
      category: "",
      iconUrl: "",
    },
  });

  const handleOpenCreate = () => {
    form.reset({
      name: "",
      category: "",
      iconUrl: "",
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tech: any) => {
    form.reset({
      name: tech.name,
      category: tech.category || "",
      iconUrl: tech.iconUrl || "",
    });
    setEditingId(tech.id);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const onSubmit = (values: TechFormValues) => {
    const data = {
      ...values,
      category: values.category || null,
      iconUrl: values.iconUrl || null,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTechnologiesQueryKey() });
            toast({ title: "Tecnologia atualizada com sucesso" });
            setIsFormOpen(false);
          },
          onError: (error: any) => {
            toast({ title: "Erro ao atualizar tecnologia", description: error.error || "Tente novamente", variant: "destructive" });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTechnologiesQueryKey() });
            toast({ title: "Tecnologia adicionada com sucesso" });
            setIsFormOpen(false);
          },
          onError: (error: any) => {
            toast({ title: "Erro ao adicionar tecnologia", description: error.error || "Tente novamente", variant: "destructive" });
          }
        }
      );
    }
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    
    deleteMutation.mutate(
      { id: deletingId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTechnologiesQueryKey() });
          toast({ title: "Tecnologia removida com sucesso" });
          setIsDeleteOpen(false);
        },
        onError: (error: any) => {
          toast({ title: "Erro ao remover tecnologia", description: error.error || "Tente novamente", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tecnologias</h1>
          <p className="text-muted-foreground">Gerencie o stack tecnológico corporativo.</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Tech
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Tecnologia" : "Nova Tecnologia"}</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form id="tech-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome (ex: Next.js)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria (ex: Frontend, Infraestrutura)</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="iconUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone (URL ou upload)</FormLabel>
                    <FormControl>
                      <ImageUploadField
                        value={field.value || ""}
                        onChange={field.onChange}
                        folder="technologies"
                        placeholder="https://... ou clique em upload"
                        previewClassName="h-10 w-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </form>
            </Form>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit" form="tech-form" disabled={createMutation.isPending || updateMutation.isPending}>
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
              <TableHead>Tecnologia</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-md" /><Skeleton className="h-4 w-32" /></div></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
                </TableRow>
              ))
            ) : technologies?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Nenhuma tecnologia cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              technologies?.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {tech.iconUrl ? (
                        <img src={tech.iconUrl} alt={tech.name} className="w-8 h-8 rounded-sm bg-muted p-1" />
                      ) : (
                        <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center">
                          <Cpu className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium text-foreground">{tech.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tech.category || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(tech)}>
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(tech.id)}>
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
              Tem certeza que deseja remover esta tecnologia? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
