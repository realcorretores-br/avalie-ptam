import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleGuard } from "@/components/RoleGuard";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";

import SelecaoPlano from "./pages/SelecaoPlano";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import AvaliacoesSalvas from "./pages/AvaliacoesSalvas";
import VisualizarAvaliacao from "./pages/VisualizarAvaliacao";
import VideosTutoriais from "./pages/VideosTutoriais";
import Planos from "./pages/Planos";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import AdminCMS from "./pages/AdminCMS";
import AdminPaymentGateways from "./pages/AdminPaymentGateways";
import AdminTemplates from "./pages/AdminTemplates";
import ContentManagement from "./pages/ContentManagement";
import Metricas from "./pages/Metricas";
import ReportarErro from "./pages/ReportarErro";
import ErrosReportados from "./pages/ErrosReportados";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ThemeWrapper() {
  useThemeColor();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ThemeWrapper />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/planos" element={<SelecaoPlano />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="planos" element={<Planos />} />
              <Route path="perfil" element={<Perfil />} />
              <Route path="metricas" element={<Metricas />} />
              <Route element={<RoleGuard allowedRoles={['admin']} />}>
                <Route path="admin" element={<Admin />} />
                <Route path="admin/cms" element={<AdminCMS />} />
                <Route path="admin/gateways" element={<AdminPaymentGateways />} />
                <Route path="admin/templates" element={<AdminTemplates />} />
                <Route path="admin/erros" element={<ErrosReportados />} />
                <Route path="conteudo" element={<ContentManagement />} />
              </Route>
              <Route path="reportar-erro" element={<ReportarErro />} />
              <Route path="nova-avaliacao" element={<SubscriptionGuard><Index /></SubscriptionGuard>} />
              <Route path="avaliacoes" element={<AvaliacoesSalvas />} />
              {/* Redirect old route to new route */}
              <Route path="avaliacoes-salvas" element={<Navigate to="/dashboard/avaliacoes" replace />} />
              <Route path="avaliacoes/:id" element={<VisualizarAvaliacao />} />
              <Route path="tutoriais" element={<VideosTutoriais />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider >
);

export default App;
