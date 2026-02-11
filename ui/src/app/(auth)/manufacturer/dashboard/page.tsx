"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../context/auth.context";
import { AuthContextType, DashboardData } from "../../../../utils/types";
import {
  MdAccountBalanceWallet,
  MdBolt,
  MdCheckCircle,
  MdDescription,
  MdPayments,
  MdPsychology,
  MdWarning,
} from "react-icons/md";
import { Button } from "../../../../components/ui/button";
import DashboardInvoicesTable from "../../../../components/admin/dashboard-invoices-table";
import { KpiCard } from "../../../../components/admin/kpi-card";
import { useRouter } from "next/navigation";

const ManufacturerDashboard = () => {
  const { authLoading } = useContext(AuthContext) as AuthContextType;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const mockData: DashboardData = {
          kpis: [
            {
              label: "Total Invoices",
              value: "1,482",
              icon: <MdDescription className="w-6 h-6 text-blue-600" />,
              color: "blue",
            },
            {
              label: "Pending Payments",
              value: "₹42,850",
              icon: <MdPayments className="w-6 h-6 text-amber-600" />,
              color: "amber",
            },
            {
              label: "Monthly Revenue",
              value: "₹218,400",
              icon: (
                <MdAccountBalanceWallet className="w-6 h-6 text-emerald-600" />
              ),
              color: "emerald",
            },
          ],
          insights: [
            {
              title: "Tax Optimization",
              description:
                "ITC mismatch detected in 4 vendor filings. Correct to save ₹1.2L GST.",
              icon: <MdCheckCircle className="w-6 h-6 text-emerald-500" />,
            },
            {
              title: "Late Payment Risk",
              description:
                "Skyline Textiles delayed payments by 12 days on average.",
              icon: <MdWarning className="w-6 h-6 text-amber-500" />,
            },
            {
              title: "Inventory Alert",
              description: "Cotton Yarn stocks 20% above projected demand.",
              icon: <MdBolt className="w-6 h-6 text-primary" />,
            },
          ],
        };

        setData(mockData);
      } catch (error) {
        console.error("Dashboard fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-0 min-h-[calc(100vh-124px)]">
      <div className="mb-8">
        <h2 className="text-xl md:text-3xl font-black">
          Manufacturing Overview
        </h2>
        <p className="text-primary text-xs md:text-base">
          Real-time performance tracking for your textile business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data?.kpis.map((kpi, index) => (
          <KpiCard
            key={index}
            icon={kpi.icon}
            label={kpi.label}
            value={kpi.value}
            color={kpi.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm md:text-lg font-bold uppercase tracking-widest">
                Recent Invoices
              </h4>
              <Button
                size="sm"
                onClick={() => router.push("/manufacturer/invoices")}
              >
                View All
              </Button>
            </div>

            <DashboardInvoicesTable />
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <div className="p-5 bg-primary/5 border-b border-slate-200 flex items-center gap-2">
              <MdPsychology className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-bold">AI Insights</h3>
            </div>

            <ul className="p-5 space-y-6">
              {data?.insights.map((insight, index) => (
                <li key={index} className="flex gap-3">
                  {insight.icon}
                  <div>
                    <p className="text-sm font-semibold">{insight.title}</p>
                    <p className="text-xs text-slate-500">
                      {insight.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
