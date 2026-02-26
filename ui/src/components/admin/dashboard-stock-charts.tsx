"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdShowChart,
  MdSwapVert,
} from "react-icons/md";
import Chart from "chart.js/auto";
import type { ChartConfiguration } from "chart.js";

export type DailyStockPoint = {
  label: string;
  inward: number;
  outward: number;
};

export const WeeklyStockSection = ({ data }: { data: DailyStockPoint[] }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, point) => ({
          inward: acc.inward + point.inward,
          outward: acc.outward + point.outward,
        }),
        { inward: 0, outward: 0 },
      ),
    [data],
  );

  const today = data[data.length - 1] ?? { inward: 0, outward: 0, label: "-" };
  const netMovement = totals.inward - totals.outward;

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    chartRef.current?.destroy();

    const config: ChartConfiguration<"bar"> = {
      type: "bar",
      data: {
        labels: data.map((point) => point.label),
        datasets: [
          {
            label: "Inward",
            data: data.map((point) => point.inward),
            backgroundColor: "#8b5a2b",
            borderRadius: 6,
            barThickness: 14,
          },
          {
            label: "Outward",
            data: data.map((point) => point.outward),
            backgroundColor: "#c4a484",
            borderRadius: 6,
            barThickness: 14,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 300,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#0f172a",
            titleColor: "#ffffff",
            bodyColor: "#e2e8f0",
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: "#64748b",
              font: {
                size: 11,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(148, 163, 184, 0.25)",
            },
            border: {
              display: false,
            },
            ticks: {
              color: "#64748b",
              precision: 0,
            },
          },
        },
      },
    };

    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-primary/5 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Weekly Stock Movement (Day-wise by Date)
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Last 7 dates inward vs outward distribution
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary-soft px-2.5 py-1 text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" /> Inward
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary-soft px-2.5 py-1 text-primary-muted">
              <span className="h-2 w-2 rounded-full bg-primary-muted" /> Outward
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-slate-200 bg-slate-50/40 p-4 md:grid-cols-3">
        <div className="rounded-xl border border-primary/25 bg-white p-3">
          <p className="text-xs font-medium text-slate-500">7-Day Inward</p>
          <p className="mt-1 inline-flex items-center gap-1 text-lg font-bold text-primary">
            <MdArrowUpward className="h-4 w-4" /> {totals.inward}
          </p>
        </div>

        <div className="rounded-xl border border-primary/25 bg-white p-3">
          <p className="text-xs font-medium text-slate-500">7-Day Outward</p>
          <p className="mt-1 inline-flex items-center gap-1 text-lg font-bold text-primary-muted">
            <MdArrowDownward className="h-4 w-4" /> {totals.outward}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-medium text-slate-500">Net Movement</p>
          <p
            className={`mt-1 inline-flex items-center gap-1 text-lg font-bold ${
              netMovement >= 0 ? "text-primary" : "text-primary-muted"
            }`}
          >
            <MdSwapVert className="h-4 w-4" /> {netMovement}
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="h-52 w-full">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
            <MdShowChart className="h-4 w-4 text-primary" />
            Today ({today.label}):
            <span className="ml-1 text-primary">+{today.inward}</span>
            <span className="text-slate-400">/</span>
            <span className="text-primary-muted">-{today.outward}</span>
          </p>
        </div>
      </div>
    </section>
  );
};
