import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useEffect } from "react";
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

import AdminTemplates from "./pages/AdminTemplates";
import AdminLogs from "./pages/admin/AdminLogs";
import ContentManagement from "./pages/ContentManagement";
import Metricas from "./pages/Metricas";
import ReportarErro from "./pages/ReportarErro";
import ErrosReportados from "./pages/ErrosReportados";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ThemeWrapper() {
  useThemeColor();
  return null;
}

// Root Layout Component to wrap everything that needs Router Context
const RootLayout = () => {
  const { settings } = useSystemSettings();

  useEffect(() => {
    if (settings.site_favicon) {
      // Find existing favicon or create new one
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.site_favicon;
    }
  }, [settings.site_favicon]);

  return (
    <AuthProvider>
      <ThemeWrapper />
      <Outlet />
      <Toaster />
      <Sonner />
    </AuthProvider>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/login", element: <Login /> },
      { path: "/cadastro", element: <Cadastro /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/planos", element: <SelecaoPlano /> },
      {
        path: "/dashboard",
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "planos", element: <Planos /> },
          { path: "perfil", element: <Perfil /> },
          { path: "metricas", element: <Metricas /> },
          {
            element: <RoleGuard allowedRoles={['admin']} />,
            children: [
              { path: "admin", element: <Admin /> },
              { path: "admin/cms", element: <AdminCMS /> },

              { path: "admin/templates", element: <AdminTemplates /> },
              { path: "admin/logs", element: <AdminLogs /> },
              { path: "admin/erros", element: <ErrosReportados /> },
              { path: "admin/settings", element: <AdminSettings /> },
              { path: "conteudo", element: <ContentManagement /> },
            ]
          },
          { path: "reportar-erro", element: <ReportarErro /> },
          { path: "nova-avaliacao", element: <SubscriptionGuard><Index /></SubscriptionGuard> },
          { path: "avaliacoes", element: <AvaliacoesSalvas /> },
          { path: "avaliacoes-salvas", element: <Navigate to="/dashboard/avaliacoes" replace /> },
          { path: "avaliacoes/:id", element: <VisualizarAvaliacao /> },
          { path: "tutoriais", element: <VideosTutoriais /> },
        ]
      },
      { path: "*", element: <NotFound /> }
    ]
  }
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
