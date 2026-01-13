import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function PaymentSuccessPopup() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-md shadow-lg border-green-200">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-700">Pagamento Confirmado!</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-gray-600 space-y-2">
                    <p>Seu pagamento foi confirmado com sucesso.</p>
                    <p>Os créditos já foram adicionados à sua conta.</p>
                </CardContent>
                <CardFooter className="justify-center pt-4">
                    <Button
                        onClick={() => navigate("/dashboard")}
                        className="w-full bg-green-600 hover:bg-green-700 font-semibold"
                    >
                        Ir para o Dashboard
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
