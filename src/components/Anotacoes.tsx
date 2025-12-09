import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, Subscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Lock, Loader2, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";

type Note = Database['public']['Tables']['notes']['Row'];

export const Anotacoes = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check if plan is "Avulso" (blocked feature)
  const isAvulso = subscription && subscription.plans?.tipo === 'avulso';
  const isBlocked = isAvulso;

  const fetchNotes = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Erro ao carregar anotações');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !isBlocked) {
      fetchNotes();
    }
  }, [user, isBlocked, fetchNotes]);

  const handleSaveNote = async () => {
    if (!user || !newNote.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          content: newNote.trim()
        });

      if (error) throw error;

      setNewNote("");
      await fetchNotes();
      toast.success('Anotação salva com sucesso!');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Erro ao salvar anotação');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchNotes();
      toast.success('Anotação excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Erro ao excluir anotação');
    }
  };

  if (isBlocked) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="p-4 rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Funcionalidade Bloqueada</h3>
            <p className="text-muted-foreground max-w-md">
              As Anotações não estão disponíveis no plano Avulso.
              Atualize seu plano para ter acesso a esta funcionalidade.
            </p>
          </div>
          <Button onClick={() => window.location.href = '/dashboard/planos'}>
            Ver Planos Disponíveis
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Note Form - Post-it Style */}
      <Card className="p-6 border-2 border-primary/20 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">✏️ Nova Anotação</h2>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Digite sua anotação aqui..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[120px] resize-none border-primary/30 bg-background/50"
            />
            <Button
              onClick={handleSaveNote}
              disabled={!newNote.trim() || saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Anotação
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notes List - Post-it Style */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">📌 Anotações Fixadas</h3>
          <Badge variant="secondary">{notes.length}</Badge>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma anotação criada ainda.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note, index) => {
              const colors = [
                'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
                'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700',
                'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
                'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
              ];
              const colorClass = colors[index % colors.length];

              return (
                <Card
                  key={note.id}
                  className={`p-4 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 ${colorClass}`}
                  style={{
                    transform: `rotate(${(index % 2 === 0 ? 1 : -1) * 0.5}deg)`,
                  }}
                >
                  <div className="flex flex-col gap-3 min-h-[150px]">
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap font-handwriting" style={{ fontFamily: 'cursive' }}>
                        {note.content}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-current/20">
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta anotação? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteNote(note.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
