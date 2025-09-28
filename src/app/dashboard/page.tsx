import { requireAuth } from "@/lib/auth";
import Dashboard from "@/components/Dashboard";
import DashboardLayout from "@/components/DashboardLayout";

export default async function DashboardPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
}
