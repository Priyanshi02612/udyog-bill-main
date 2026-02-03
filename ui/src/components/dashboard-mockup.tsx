import { IoMdNotifications } from "react-icons/io";
import { MdAnalytics } from "react-icons/md";

export const DashboardMockup = () => {
  return (
    <div className="relative lg:block">
      <div className="relative z-10 bg-white rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden transition-transform hover:scale-[1.02] duration-500">
        <div className="h-8 bg-slate-100 flex items-center px-4 gap-1.5 border-b border-slate-200">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <IoMdNotifications className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-primary/5 border border-primary/10 rounded-xl p-4 flex flex-col justify-between">
              <div className="h-4 w-16 bg-primary/20 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-primary/30 rounded animate-pulse"></div>
            </div>
            <div className="h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-slate-300 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse"></div>
            <div className="h-4 w-4/6 bg-slate-100 rounded animate-pulse"></div>
          </div>
          <div className="h-40 w-full bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center">
            <div className="text-slate-400 text-xs flex flex-col items-center gap-1">
              <MdAnalytics className="w-8 h-8" />
              Inventory Flow Visualization
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
    </div>
  );
};
