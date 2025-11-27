import { Button } from "@/components/ui/button";
import { Building2, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-background border-t">


            {/* Main Footer */}
            <div className="container py-12 md:py-16">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">Avalie Certo</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Plataforma completa para avaliação imobiliária profissional. Agilidade, precisão e conformidade técnica para o seu dia a dia.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <Instagram className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <Facebook className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <Linkedin className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <Twitter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Plataforma</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#hero" className="hover:text-primary transition-colors">Início</a></li>
                            <li><a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                            <li><a href="#pricing" className="hover:text-primary transition-colors">Planos e Preços</a></li>
                            <li><a href="#testimonials" className="hover:text-primary transition-colors">Depoimentos</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">LGPD</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold mb-4">Contato</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>suporte@avaliecerto.com.br</li>
                            <li>(11) 99999-9999</li>
                            <li>Segunda a Sexta, 9h às 18h</li>
                        </ul>
                    </div>

                </div>

                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>© 2025 Avalie Certo. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};
