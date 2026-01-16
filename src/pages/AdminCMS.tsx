import { useNavigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import AdminLayout from "@/components/AdminLayout";
import { PlanManagement } from "@/components/admin/PlanManagement";

const AdminCMS = () => {
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();

  if (roleLoading) return null;

  if (!isAdmin) {
    // navigate("/");
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CMS Planos</h1>
          <p className="text-muted-foreground">
            Gerencie os planos de assinatura e pacotes de crédito da plataforma.
          </p>
        </div>
        <PlanManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminCMS;
