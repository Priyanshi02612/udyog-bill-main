"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../../../context/auth.context";
import {
  AuthContextType,
  ManufacturerDashboard,
} from "../../../../utils/types";
import { formatCurrency, getErrorMessage } from "../../../../utils/helpers";
import {
  MdAccountBalanceWallet,
  MdAddCircleOutline,
  MdChecklist,
  MdDescription,
  MdInventory,
  MdInventory2,
  MdListAlt,
  MdPayments,
  MdPsychology,
  MdWarning,
} from "react-icons/md";
import DashboardInvoicesTable from "../../../../components/manufacturer/dashboard-invoices-table";
import { KpiCard } from "../../../../components/manufacturer/kpi-card";
import { WeeklyStockSection } from "../../../../components/manufacturer/dashboard-stock-charts";
import { useRouter } from "next/navigation";
import { ManufacturerService } from "../../../../lib/api/manufacturer";
import toast from "react-hot-toast";

const defaultDashboardKpis: ManufacturerDashboard["kpis"] = {
  totalInvoices: 0,
  pendingPayments: 0,
  monthlyRevenue: 0,
};

const defaultInvoiceSummary: ManufacturerDashboard["invoiceSummary"] = {
  totalInvoices: 0,
  pendingPayments: 0,
  monthlyRevenue: 0,
  overdueCount: 0,
};

const defaultInventorySummary: ManufacturerDashboard["inventorySummary"] = {
  totalReceivedStock: 0,
  currentStock: 0,
  consumedStock: 0,
  inventoryValue: 0,
  outOfStockCount: 0,
  lowStockCount: 0,
};

const ManufacturerDashboardPage = () => {
  const { authLoading, user } = useContext(AuthContext) as AuthContextType;
  const [dashboardKpis, setDashboardKpis] =
    useState<ManufacturerDashboard["kpis"]>(defaultDashboardKpis);
  const [invoiceSummary, setInvoiceSummary] = useState<
    ManufacturerDashboard["invoiceSummary"]
  >(defaultInvoiceSummary);
  const [inventorySummary, setInventorySummary] = useState<
    ManufacturerDashboard["inventorySummary"]
  >(defaultInventorySummary);
  const [lowStockItems, setLowStockItems] = useState<
    ManufacturerDashboard["lowStockItems"]
  >([]);
  const [dailyStockData, setDailyStockData] = useState<
    ManufacturerDashboard["dailyStockData"]
  >([]);
  const [recentInvoices, setRecentInvoices] = useState<
    ManufacturerDashboard["recentInvoices"]
  >([]);
  const [insights, setInsights] = useState<ManufacturerDashboard["insights"]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const resetDashboard = () => {
      setDashboardKpis(defaultDashboardKpis);
      setInvoiceSummary(defaultInvoiceSummary);
      setInventorySummary(defaultInventorySummary);
      setLowStockItems([]);
      setDailyStockData([]);
      setRecentInvoices([]);
      setInsights([]);
    };

    const fetchDashboard = async () => {
      if (!user?.userId) {
        resetDashboard();
        setLoading(false);
        return;
      }

      try {
        const dashboardResponse = await ManufacturerService.getDashboard(
          user.userId,
        );

        setDashboardKpis(dashboardResponse.kpis || defaultDashboardKpis);
        setInvoiceSummary(
          dashboardResponse.invoiceSummary || defaultInvoiceSummary,
        );
        setInventorySummary(
          dashboardResponse.inventorySummary || defaultInventorySummary,
        );
        setLowStockItems(dashboardResponse.lowStockItems || []);
        setDailyStockData(dashboardResponse.dailyStockData || []);
        setRecentInvoices(dashboardResponse.recentInvoices || []);
        setInsights(dashboardResponse.insights || []);
      } catch (error) {
        toast.error(getErrorMessage(error) || "Dashboard fetch failed");
        resetDashboard();
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  const currentWeekMovement = useMemo(() => {
    return dailyStockData.reduce(
      (acc, day) => ({
        inward: acc.inward + Number(day.inward || 0),
        outward: acc.outward + Number(day.outward || 0),
      }),
      { inward: 0, outward: 0 },
    );
  }, [dailyStockData]);

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
        <h2 className="text-xl md:text-3xl font-black">Inventory Dashboard</h2>
        <p className="text-primary text-xs md:text-base">
          Quick view of low stock, weekly inward/outward movement, and items
          close to stock-out.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <KpiCard
          icon={<MdDescription className="w-6 h-6 text-blue-600" />}
          label="Total Invoices"
          value={invoiceSummary.totalInvoices || dashboardKpis.totalInvoices}
          color="blue"
          subtitle={`Recent listed: ${recentInvoices.length}`}
          trendText={`${invoiceSummary.overdueCount} overdue invoices`}
          trendTone={invoiceSummary.overdueCount > 0 ? "warning" : "positive"}
        />

        <KpiCard
          icon={<MdPayments className="w-6 h-6 text-amber-600" />}
          label="Pending Payments"
          value={formatCurrency(
            invoiceSummary.pendingPayments || dashboardKpis.pendingPayments,
          )}
          color="amber"
          subtitle="Invoices waiting for payment"
          trendText={`${invoiceSummary.overdueCount} require urgent follow-up`}
          trendTone={invoiceSummary.overdueCount > 0 ? "danger" : "neutral"}
        />

        <KpiCard
          icon={<MdAccountBalanceWallet className="w-6 h-6 text-emerald-600" />}
          label="Monthly Revenue"
          value={formatCurrency(
            invoiceSummary.monthlyRevenue || dashboardKpis.monthlyRevenue,
          )}
          color="emerald"
          subtitle="Current month sent invoices"
          trendText={`Outward (7d): ${currentWeekMovement.outward}`}
        />

        <KpiCard
          icon={<MdWarning className="w-6 h-6 text-red-500" />}
          label="Overdue Invoices"
          value={invoiceSummary.overdueCount}
          color="red"
          subtitle="SENT invoices past due date"
          trendText={
            invoiceSummary.overdueCount > 0
              ? "Action needed"
              : "No overdue right now"
          }
          trendTone={invoiceSummary.overdueCount > 0 ? "danger" : "positive"}
        />

        <KpiCard
          icon={<MdInventory2 className="w-6 h-6 text-primary" />}
          label="Current Stock"
          value={inventorySummary.currentStock}
          color="primary"
          subtitle={`Total received: ${inventorySummary.totalReceivedStock}`}
          trendText={`${inventorySummary.lowStockCount} low stock items`}
          trendTone={
            inventorySummary.lowStockCount > 0 ? "warning" : "positive"
          }
        />

        <KpiCard
          icon={<MdPayments className="w-6 h-6 text-blue-600" />}
          label="Inventory Value"
          value={formatCurrency(inventorySummary.inventoryValue)}
          color="blue"
          subtitle={`${inventorySummary.outOfStockCount} out-of-stock items`}
          trendText={`Recent invoices: ${recentInvoices.length}`}
          trendTone={
            inventorySummary.outOfStockCount > 0 ? "danger" : "neutral"
          }
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WeeklyStockSection data={dailyStockData} />

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-primary/5 flex items-center justify-between">
              <h4 className="text-sm md:text-lg font-bold uppercase tracking-widest">
                Recent Invoices
              </h4>
            </div>

            <DashboardInvoicesTable invoices={recentInvoices} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-5 bg-primary/5 rounded-tl-xl rounded-tr-xl border-b border-slate-200 flex items-center gap-2">
              <MdChecklist className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-base font-bold">Quick Shortcuts</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Jump to frequent actions
                </p>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => router.push("/manufacturer/invoices/create")}
                className="rounded-xl flex gap-5 border border-blue-100 bg-linear-to-b from-blue-50 to-white p-4 text-left"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700">
                  <MdAddCircleOutline className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Create Invoice
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Start a new bill
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push("/manufacturer/inventory/create")}
                className="rounded-xl flex gap-5 border border-amber-100 bg-linear-to-b from-amber-50 to-white p-4 text-left"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600/10 text-amber-700">
                  <MdInventory className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Add Inventory
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Record stock inward
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push("/manufacturer/invoices")}
                className="rounded-xl flex gap-5 border border-emerald-100 bg-linear-to-b from-emerald-50 to-white p-4 text-left"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700">
                  <MdListAlt className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    View All Invoices
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Open invoice register
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-5 bg-primary/5 rounded-tl-xl rounded-tr-xl border-b border-slate-200 flex items-center gap-2">
              <MdWarning className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold">Low Stock Alerts</h3>
            </div>

            <div className="p-5 space-y-3 max-h-70 overflow-auto">
              {lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 8).map((item) => (
                  <div
                    key={item.id || item.itemId}
                    className="rounded-lg border border-amber-100 bg-amber-50/50 p-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {item.name || "Unnamed item"}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Remaining {item.currentStock}/{item.totalStock}{" "}
                      {item.unit || "units"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No low-stock items right now.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-5 bg-primary/5 rounded-tl-xl rounded-tr-xl border-b border-slate-200 flex items-center gap-2">
              <MdChecklist className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold">Quick Inventory Summary</h3>
            </div>

            <div className="p-5 space-y-3 text-sm text-slate-700">
              <p>
                <span className="font-semibold text-slate-900">
                  {inventorySummary.outOfStockCount}
                </span>{" "}
                items are out of stock.
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  {inventorySummary.lowStockCount}
                </span>{" "}
                items are near stock-out.
              </p>
              <p>
                Last 7 days stock movement:{" "}
                <span className="font-semibold text-emerald-600">
                  +{currentWeekMovement.inward}
                </span>{" "}
                inward and{" "}
                <span className="font-semibold text-amber-600">
                  -{currentWeekMovement.outward}
                </span>{" "}
                outward.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-5 bg-primary/5 rounded-tl-xl rounded-tr-xl border-b border-slate-200 flex items-center gap-2">
              <MdPsychology className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold">Business Insights</h3>
            </div>

            <ul className="p-5 space-y-4">
              {insights.map((insight, index) => (
                <li key={index} className="flex gap-3">
                  <MdDescription className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">{insight.title}</p>
                    <p className="text-xs text-slate-500">
                      {insight.description}
                    </p>
                  </div>
                </li>
              ))}

              {insights.length === 0 ? (
                <li className="text-sm text-slate-500">
                  No insights available.
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboardPage;
