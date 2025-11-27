import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/components/ImageUploader";
import { Save, Plus, Trash2, GripVertical, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LandingContent {
    id: string;
    section: string;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    image_url: string | null;
}

interface LandingItem {
    id: string;
    section: string;
    title: string | null;
    description: string | null;
    icon: string | null;
    image_url: string | null;
    order_index: number | null;
    metadata: any;
}

interface SectionEditorProps {
    section: string;
    title: string;
    content: LandingContent;
    items: LandingItem[];
    onUpdate: () => void;
    hasItems?: boolean;
    itemFields?: {
        title?: boolean;
        description?: boolean;
        icon?: boolean;
        image?: boolean;
        metadata?: boolean;
    };
    itemLabel?: string;
    contentLabels?: {
        title?: string;
        subtitle?: string;
        description?: string;
        image?: string;
    };
    predefinedIcons?: string[];
    categories?: string[];
}

export const SectionEditor = ({
    section,
    title,
    content,
    items,
    onUpdate,
    hasItems = false,
    itemFields = { title: true, description: true },
    itemLabel = "Item",
    contentLabels,
    predefinedIcons,
    categories
}: SectionEditorProps) => {
    const [editingItem, setEditingItem] = useState<LandingItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleSaveContent = async () => {
        try {
            const { error } = await supabase
                .from('landing_content')
                .upsert({
                    section: content.section,
                    title: content.title,
                    subtitle: content.subtitle,
                    description: content.description,
                    image_url: content.image_url,
                    ...(content.id ? { id: content.id } : {})
                });

            if (error) throw error;
            toast.success('Seção atualizada com sucesso');
            onUpdate();
        } catch (error) {
            console.error('Error saving content:', error);
            toast.error('Erro ao salvar seção');
        }
    };

    const handleSaveItem = async (item: Partial<LandingItem>) => {
        try {
            const itemData = {
                section: section,
                title: item.title,
                description: item.description,
                icon: item.icon,
                image_url: item.image_url,
                order_index: item.order_index || items.length + 1,
                metadata: item.metadata || {}
            };

            if (item.id) {
                const { error } = await supabase
                    .from('landing_items')
                    .update(itemData)
                    .eq('id', item.id);
                if (error) throw error;
                toast.success('Item atualizado');
            } else {
                const { error } = await supabase
                    .from('landing_items')
                    .insert(itemData);
                if (error) throw error;
                toast.success('Item criado');
            }

            setIsDialogOpen(false);
            setEditingItem(null);
            onUpdate();
        } catch (error) {
            console.error('Error saving item:', error);
            toast.error('Erro ao salvar item');
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const { error } = await supabase.from('landing_items').delete().eq('id', itemToDelete);
            if (error) throw error;
            toast.success('Item excluído');
            onUpdate();
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Erro ao excluir item');
        } finally {
            setItemToDelete(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Main Content Editor */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">{title} - Cabeçalho</h3>
                </div>
                <div className="space-y-4">
                    <SectionContentForm content={content} onSave={handleSaveContent} labels={contentLabels} />
                </div>
            </Card>

            {/* Items Editor */}
            {hasItems && (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold">Itens da Seção ({items.length})</h3>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setEditingItem({} as LandingItem)}>
                                    <Plus className="h-4 w-4 mr-2" /> Adicionar {itemLabel}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingItem?.id ? 'Editar' : 'Adicionar'} {itemLabel}</DialogTitle>
                                </DialogHeader>
                                <ItemForm
                                    item={editingItem || {} as LandingItem}
                                    onSave={handleSaveItem}
                                    fields={itemFields}
                                    predefinedIcons={predefinedIcons}
                                    categories={categories}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-2">
                        {items.sort((a, b) => a.order_index - b.order_index).map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                                {item.image_url && (
                                    <img src={item.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{item.title || '(Sem título)'}</h4>
                                    <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                                    {item.metadata?.category && (
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                                            {item.metadata.category}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setEditingItem(item);
                                        setIsDialogOpen(true);
                                    }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => setItemToDelete(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o item.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

// Sub-components for cleaner code
const SectionContentForm = ({ content, onSave, labels }: { content: LandingContent, onSave: () => void, labels?: any }) => {
    // We need local state to handle inputs
    const [localContent, setLocalContent] = useState(content);

    // Update local state when props change (e.g. after fetch)
    if (localContent.id !== content.id) {
        setLocalContent(content);
    }

    return (
        <div className="space-y-4">
            <div>
                <Label>{labels?.title || "Título"}</Label>
                <Input
                    value={localContent.title || ''}
                    onChange={(e) => {
                        setLocalContent({ ...localContent, title: e.target.value });
                        content.title = e.target.value; // Sync back to parent object reference for save
                    }}
                />
            </div>
            <div>
                <Label>{labels?.subtitle || "Subtítulo"}</Label>
                <Input
                    value={localContent.subtitle || ''}
                    onChange={(e) => {
                        setLocalContent({ ...localContent, subtitle: e.target.value });
                        content.subtitle = e.target.value;
                    }}
                />
            </div>
            <div>
                <Label>{labels?.description || "Descrição"}</Label>
                <Textarea
                    value={localContent.description || ''}
                    onChange={(e) => {
                        setLocalContent({ ...localContent, description: e.target.value });
                        content.description = e.target.value;
                    }}
                />
            </div>
            <div>
                <ImageUploader
                    label={labels?.image || "Imagem da Seção"}
                    currentImageUrl={localContent.image_url}
                    onUploadSuccess={(url) => {
                        setLocalContent({ ...localContent, image_url: url });
                        content.image_url = url;
                    }}
                />
            </div>
            <Button onClick={onSave}>
                <Save className="h-4 w-4 mr-2" /> Salvar Cabeçalho
            </Button>
        </div>
    );
};

const ItemForm = ({ item, onSave, fields, predefinedIcons, categories }: { item: Partial<LandingItem>, onSave: (i: Partial<LandingItem>) => void, fields: any, predefinedIcons?: string[], categories?: string[] }) => {
    const [localItem, setLocalItem] = useState(item);

    // Ensure metadata exists
    if (!localItem.metadata) {
        localItem.metadata = {};
    }

    return (
        <div className="space-y-4 py-4">
            {categories && (
                <div>
                    <Label>Categoria</Label>
                    <Select
                        value={localItem.metadata?.category || ''}
                        onValueChange={(value) => setLocalItem({
                            ...localItem,
                            metadata: { ...localItem.metadata, category: value }
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {fields.title && (
                <div>
                    <Label>Título</Label>
                    <Input
                        value={localItem.title || ''}
                        onChange={(e) => setLocalItem({ ...localItem, title: e.target.value })}
                    />
                </div>
            )}
            {fields.description && (
                <div>
                    <Label>Descrição</Label>
                    <Textarea
                        value={localItem.description || ''}
                        onChange={(e) => setLocalItem({ ...localItem, description: e.target.value })}
                    />
                </div>
            )}
            {fields.icon && (
                <div>
                    <Label>Ícone</Label>
                    {predefinedIcons && predefinedIcons.length > 0 ? (
                        <Select
                            value={localItem.icon || ''}
                            onValueChange={(value) => setLocalItem({ ...localItem, icon: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um ícone" />
                            </SelectTrigger>
                            <SelectContent>
                                {predefinedIcons.map((icon) => (
                                    <SelectItem key={icon} value={icon}>
                                        <div className="flex items-center gap-2">
                                            <i className={`${icon} w-6 text-center`} />
                                            <span>{icon}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            value={localItem.icon || ''}
                            placeholder="Ex: Home, User, Check (Lucide) ou fa-solid fa-home (FontAwesome)"
                            onChange={(e) => setLocalItem({ ...localItem, icon: e.target.value })}
                        />
                    )}
                </div>
            )}
            {fields.image && (
                <div>
                    <ImageUploader
                        label="Imagem do Item"
                        currentImageUrl={localItem.image_url}
                        onUploadSuccess={(url) => setLocalItem({ ...localItem, image_url: url })}
                    />
                </div>
            )}
            <div>
                <Label>Ordem</Label>
                <Input
                    type="number"
                    value={localItem.order_index || 0}
                    onChange={(e) => setLocalItem({ ...localItem, order_index: parseInt(e.target.value) })}
                />
            </div>

            {/* Metadata Editor (Simple JSON editor for advanced fields) */}
            {fields.metadata && (
                <div>
                    <Label>Metadados (JSON - Preço, Role, etc)</Label>
                    <Textarea
                        className="font-mono text-xs"
                        value={JSON.stringify(localItem.metadata || {}, null, 2)}
                        onChange={(e) => {
                            try {
                                const parsed = JSON.parse(e.target.value);
                                setLocalItem({ ...localItem, metadata: parsed });
                            } catch (err) {
                                // Allow typing invalid JSON temporarily
                            }
                        }}
                        rows={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Edite o JSON com cuidado.</p>
                </div>
            )}

            <Button onClick={() => onSave(localItem)} className="w-full">
                <Save className="h-4 w-4 mr-2" /> Salvar Item
            </Button>
        </div>
    );
};
