import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { 
  useListTeamMembers, 
  getListTeamMembersQueryKey,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const teamSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  roleTitle: z.string().min(2, "Cargo é obrigatório"),
  bio: z.string().optional().nullable(),
  avatarUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  linkedinUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  githubUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  portfolioUrl: z.string().url("Deve ser uma URL válida").optional().nullable().or(z.literal("")),
  sortOrder: z.coerce.number().int(),
  isActive: z.boolean().default(true),
  skillsStr: z.string(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

export default function AdminTeam() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: team, isLoading } = useListTeamMembers();
  const createMutation = useCreateTeamMember();
  const updateMutation = useUpdateTeamMember();
  const deleteMutation = useDeleteTeamMember();

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      roleTitle: "",
      bio: "",
      avatarUrl: "",
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
      sortOrder: 0,
      isActive: true,
      skillsStr: "",
    },
  });

  const watchedAvatarUrl = form.watch("avatarUrl");

  const handleOpenCreate = () => {
    form.reset({
      name: "",
      roleTitle: "",
      bio: "",
      avatarUrl: "",
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
      sortOrder: team ? team.length * 10 : 0,
      isActive: true,
      skillsStr: "",
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (member: any) => {
    form.reset({
      name: member.name,
      roleTitle: member.roleTitle,
      bio: member.bio || "",
      avatarUrl: member.avatarUrl || "",
      linkedinUrl: member.linkedinUrl || "",
      githubUrl: member.githubUrl || "",
      portfolioUrl: member.portfolioUrl || "",
      sortOrder: member.sortOrder,
      isActive: member.isActive,
      skillsStr: member.skills?.join(", ") || "",
    });
    setEditingId(member.id);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const onSubmit = (values: TeamFormValues) => {
    const { skillsStr, ...rest } = values;
    
    // Parse skills from comma separated string
    const skills = skillsStr
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const data = {
      ...rest,
      skills,
      bio: values.bio || null,
      avatarUrl: values.avatarUrl || null,
      linkedinUrl: values.linkedinUrl || null,
      githubUrl: values.githubUrl || null,
      portfolioUrl: values.portfolioUrl || null,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
            toast({ title: "Membro atualizado com sucesso" });
            setIsFormOpen(false);
          },
          onError: (error: any) => {
            toast({ title: "Erro ao atualizar membro", description: error.error || "Tente novamente", variant: "destructive" });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
            toast({ title: "Membro adicionado com sucesso" });
            setIsFormOpen(false);
          },
          onError: (error: any) => {
            toast({ title: "Erro ao adicionar membro", description: error.error || "Tente novamente", variant: "destructive" });
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
          queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
          toast({ title: "Membro removido com sucesso" });
          setIsDeleteOpen(false);
        },
        onError: (error: any) => {
          toast({ title: "Erro ao remover membro", description: error.error || "Tente novamente", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipe</h1>
          <p className="text-muted-foreground">Gerencie os membros da equipe mostrados no site.</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
            <DialogHeader className="p-6 border-b border-border">
              <DialogTitle>{editingId ? "Editar Membro" : "Novo Membro da Equipe"}</DialogTitle>
              <DialogDescription>
                Detalhes do membro que aparecerão na página Equipe.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              <Form {...form}>
                <form id="team-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="roleTitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minibiografia</FormLabel>
                      <FormControl><Textarea {...field} value={field.value || ""} className="h-20" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="avatarUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Avatar</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="https://..." /></FormControl>
                      {watchedAvatarUrl && (
                        <img
                          src={watchedAvatarUrl}
                          alt="Preview avatar"
                          className="mt-2 h-16 w-16 rounded-full object-cover border border-border"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="skillsStr" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habilidades (separadas por vírgula)</FormLabel>
                      <FormControl><Input {...field} placeholder="React, Node.js, AWS" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} placeholder="https://linkedin.com/in/..." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="githubUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} placeholder="https://github.com/..." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="portfolioUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio / Site pessoal</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="https://..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="sortOrder" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem de Exibição (menor primeiro)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="isActive" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ativo</FormLabel>
                          <p className="text-sm text-muted-foreground">Exibir no site</p>
                        </div>
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                </form>
              </Form>
            </div>

            <div className="shrink-0 p-6 border-t border-border flex justify-end gap-2 bg-background">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit" form="team-form" disabled={createMutation.isPending || updateMutation.isPending}>
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
              <TableHead>Membro</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-4 w-32" /></div></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
                </TableRow>
              ))
            ) : team?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum membro encontrado na equipe.
                </TableCell>
              </TableRow>
            ) : (
              team?.sort((a,b) => a.sortOrder - b.sortOrder).map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatarUrl || ""} />
                        <AvatarFallback className="bg-primary/20 text-primary">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium text-foreground">{member.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.roleTitle}</TableCell>
                  <TableCell className="text-muted-foreground">{member.sortOrder}</TableCell>
                  <TableCell>
                    {member.isActive ? (
                      <Badge className="bg-primary/20 text-primary border-primary/30">Ativo</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(member)}>
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(member.id)}>
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
              Tem certeza que deseja remover este membro da equipe? Esta ação não pode ser desfeita.
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
