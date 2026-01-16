import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { toast } from "sonner";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useRole();

  // Enable realtime notifications
  useRealtimeNotifications();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isAdmin) {
      navigate('/dashboard/admin');
    }
  }, [user, isAdmin, navigate]);

  // Handle payment return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus) {
      if (paymentStatus === 'success') {
        toast.success('Pagamento iniciado! Seus créditos serão adicionados assim que confirmado.');
        // Remove params
        window.history.replaceState({}, '', window.location.pathname);
      } else if (paymentStatus === 'failure') {
        toast.error('Pagamento cancelado ou falhou.');
      } else if (paymentStatus === 'pending') {
        toast.info('Pagamento pendente. Aguarde a confirmação.');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Banner Section */}
        <section>
          <WelcomeBanner />
        </section>

        {/* Quick Actions Grid */}
        <section>
          <QuickActions />
        </section>

        {/* Recent Activity Table */}
        <section>
          <RecentActivityTable />
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
