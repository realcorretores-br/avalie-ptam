import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, Loader2, ArrowLeft } from "lucide-react";
import { z } from "zod";

const EmailSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo')
});

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validationResult = EmailSchema.safeParse({ email });
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        validationResult.data.email,
        {
          redirectTo: redirectUrl,
        }
      );

      if (error) {
        toast.error('Erro ao enviar email de recuperação');
        console.error(error);
      } else {
        setEmailSent(true);
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } catch (error) {
      toast.error('Erro ao processar solicitação');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">PTAM</span>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Recuperar Senha</h1>
        <p className="text-center text-muted-foreground mb-6">
          {emailSent 
            ? 'Enviamos um link para redefinir sua senha'
            : 'Digite seu email para receber o link de recuperação'}
        </p>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Link de Recuperação
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-sm text-center">
              <p className="mb-2">Verifique seu email <strong>{email}</strong></p>
              <p className="text-muted-foreground">
                Se não receber o email em alguns minutos, verifique sua pasta de spam.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
            >
              Enviar Novamente
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
