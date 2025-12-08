import { Button } from "@/components/ui/button";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const scrollToSection = (id: string) => {
        if (id === 'hero') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsMenuOpen(false);
            return;
        }

        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
            <div className="container flex h-20 items-center justify-between">
                {/* Brand */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="bg-primary/10 p-2 rounded-xl">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight leading-none">Avalie Certo</span>
                        <span className="text-xs text-muted-foreground font-medium">PTAM – Plataforma de Avaliação</span>
                    </div>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-8 text-sm font-medium absolute left-1/2 -translate-x-1/2">
                    <button onClick={() => scrollToSection('hero')} className="text-muted-foreground hover:text-primary transition-colors">Início</button>
                    <button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-primary transition-colors">Recursos</button>
                    <button onClick={() => scrollToSection('how-it-works')} className="text-muted-foreground hover:text-primary transition-colors">Como Funciona</button>
                    <button onClick={() => scrollToSection('pricing')} className="text-muted-foreground hover:text-primary transition-colors">Planos</button>
                </nav>

                {/* Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/login')}
                        className="font-medium"
                    >
                        Entrar
                    </Button>
                    <Button
                        onClick={() => navigate('/cadastro')}
                        className="rounded-full px-6 font-semibold shadow-lg shadow-primary/20 bg-[linear-gradient(135deg,#8b5cf6_0%,#3b82f6_100%)] hover:opacity-90 transition-opacity"
                    >
                        Começar Grátis
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-20 left-0 right-0 bg-background border-b shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
                    <button onClick={() => scrollToSection('hero')} className="text-left px-4 py-2 hover:bg-muted rounded-lg">Início</button>
                    <button onClick={() => scrollToSection('features')} className="text-left px-4 py-2 hover:bg-muted rounded-lg">Recursos</button>
                    <button onClick={() => scrollToSection('how-it-works')} className="text-left px-4 py-2 hover:bg-muted rounded-lg">Como Funciona</button>
                    <button onClick={() => scrollToSection('pricing')} className="text-left px-4 py-2 hover:bg-muted rounded-lg">Planos</button>
                    <div className="h-px bg-border my-2" />
                    <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
                        Entrar
                    </Button>
                    <Button onClick={() => navigate('/cadastro')} className="w-full">
                        Eu quero começar
                    </Button>
                </div>
            )}
        </header>
    );
};
