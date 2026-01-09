import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Shield,
  Edit,
  Settings,
  CreditCard,
  Home,
  FileText,
  AlertTriangle,
  BarChart3,
  Video,
  User,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  // The AdminLayout previously handled the sidebar and layout, but now
  // the main DashboardLayout handles the sidebar for all authenticated users.
  // We keep this component as a wrapper in case we need admin-specific context later.

  return (
    <div className="animate-in fade-in duration-500">
      {children}
    </div>
  );
};

export default AdminLayout;
