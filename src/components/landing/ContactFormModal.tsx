import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface ContactFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ContactFormModal = ({ open, onOpenChange }: ContactFormModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate sending email or use mailto as fallback/simple solution
        // The user requested: "Ao clicar, abre-se um formulário em pop-up e o e-mail final envia para 'jonathan@silvajonathan.me'. Os dados do cliente são 'Nome, Telefone, E-mail, Assunto e mensagem se aplicável'."

        // Construct mailto link
        const mailtoLink = `mailto:jonathan@silvajonathan.me?subject=${encodeURIComponent(formData.subject || "Contato via Site PTAM")}&body=${encodeURIComponent(
            `Nome: ${formData.name}\nTelefone: ${formData.phone}\nE-mail: ${formData.email}\n\nMensagem:\n${formData.message}`
        )}`;

        // Open mail client
        window.location.href = mailtoLink;

        // Show success message
        toast.success("Redirecionando para seu cliente de e-mail...");

        setLoading(false);
        onOpenChange(false);
        setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Fale com um Especialista</DialogTitle>
                    <DialogDescription>
                        Preencha o formulário abaixo para solicitar uma proposta personalizada para sua empresa.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Seu nome"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="(00) 00000-0000"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Assunto</Label>
                        <Input
                            id="subject"
                            name="subject"
                            placeholder="Interesse no Plano Empresa"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Mensagem (Opcional)</Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Conte-nos mais sobre sua necessidade..."
                            className="min-h-[100px]"
                            value={formData.message}
                            onChange={handleChange}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Enviando..." : "Enviar Solicitação"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
