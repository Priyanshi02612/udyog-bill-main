import { ChangeEvent } from "react";
import { MdAdd, MdDeleteOutline, MdInventory2 } from "react-icons/md";

import { Input } from "../ui/input";
import { formatCurrency } from "../../utils/helpers";
import { InvoiceItem } from "../../utils/types";

type InvoiceItemRow = InvoiceItem & {
  taxableAmount: number;
};

type InvoiceItemsTableProps = {
  items: InvoiceItemRow[];
  onItemChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
};

export function InvoiceItemsTable({
  items,
  onItemChange,
  onAddRow,
  onRemoveRow,
}: InvoiceItemsTableProps) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
        <MdInventory2 className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Invoice Items
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-245">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Item Name</th>
              <th className="px-4 py-3">HSN Code</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Price (₹)</th>
              <th className="px-4 py-3">GST (%)</th>
              <th className="px-4 py-3 text-right">Amount (₹)</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              return (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {`0${index + 1}`.slice(-2)}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      name="itemName"
                      data-id={item.id}
                      value={item.itemName}
                      onChange={onItemChange}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="Enter product name"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={item.hsnCode}
                      name="hsnCode"
                      data-id={item.id}
                      onChange={onItemChange}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="5007"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={item.quantity}
                      name="quantity"
                      data-id={item.id}
                      onChange={onItemChange}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={item.unit}
                      name="unit"
                      data-id={item.id}
                      onChange={onItemChange}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="Meters"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={item.basePrice}
                      name="basePrice"
                      data-id={item.id}
                      onChange={onItemChange}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={item.gstPercentage}
                      name="gstPercentage"
                      data-id={item.id}
                      readOnly
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                    {formatCurrency(item.taxableAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveRow(item.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      title="Remove Row"
                    >
                      <MdDeleteOutline className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 px-6 py-4">
        <button
          type="button"
          onClick={onAddRow}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80"
        >
          <MdAdd className="h-5 w-5" />
          Add New Row
        </button>
      </div>
    </div>
  );
}
