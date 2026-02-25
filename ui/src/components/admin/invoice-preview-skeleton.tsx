const InvoicePreviewSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="space-y-3">
        <div className="h-6 w-56 rounded-md bg-slate-200" />
        <div className="h-4 w-40 rounded-md bg-slate-200" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-20 rounded-lg bg-slate-100" />
        <div className="h-20 rounded-lg bg-slate-100" />
      </div>

      <div className="space-y-3">
        <div className="h-4 w-full rounded-md bg-slate-100" />
        <div className="h-4 w-full rounded-md bg-slate-100" />
        <div className="h-4 w-5/6 rounded-md bg-slate-100" />
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-4">
        <div className="h-4 w-1/3 rounded-md bg-slate-200" />
        <div className="h-4 w-1/2 rounded-md bg-slate-200" />
      </div>
    </div>
  );
};

export default InvoicePreviewSkeleton;
