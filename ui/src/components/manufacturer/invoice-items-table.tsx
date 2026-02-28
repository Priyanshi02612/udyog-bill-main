import { ChangeEvent, useMemo, useState } from "react";
import { MdAdd, MdDeleteOutline, MdInventory2 } from "react-icons/md";

import {
  SearchableDropdown,
  SearchableDropdownOption,
} from "../ui/searchable-dropdown";
import { Input } from "../ui/input";
import { formatCurrency } from "../../utils/helpers";
import { InvoiceItem } from "../../utils/types";

type InvoiceItemRow = InvoiceItem & {
  taxableAmount: number;
};

type InvoiceItemsTableProps = {
  items: InvoiceItemRow[];
  onQuantityChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectItem: (itemRowId: string, selectedItemId: string) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  itemOptions: SearchableDropdownOption[];
  rowErrors?: Record<string, string>;
};

export function InvoiceItemsTable({
  items,
  onQuantityChange,
  onSelectItem,
  onAddRow,
  onRemoveRow,
  itemOptions,
  rowErrors = {},
}: InvoiceItemsTableProps) {
  const [itemSearchByRow, setItemSearchByRow] = useState<
    Record<string, string>
  >({});

  const selectedItemIds = useMemo(
    () =>
      new Set(items.map((invoiceItem) => invoiceItem.itemId).filter(Boolean)),
    [items],
  );

  return (
    <div className="mb-6 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
        <MdInventory2 className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Invoice Items
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-245 text-xs xl:text-base">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">
                Item Name <span className="text-rose-500">*</span>
              </th>
              <th className="px-4 py-3">HSN Code</th>
              <th className="px-4 py-3">
                Quantity <span className="text-rose-500">*</span>
              </th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Price (₹)</th>
              <th className="px-4 py-3">GST (%)</th>
              <th className="px-4 py-3 text-right">Amount (₹)</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const rowError = rowErrors[item.id];
              const searchTerm = (itemSearchByRow[item.id] ?? item.name)
                .trim()
                .toLowerCase();

              const filteredOptions = itemOptions.filter((option) => {
                const matchesSearch = option.label
                  .toLowerCase()
                  .includes(searchTerm);

                const isCurrentSelection = option.value === item.itemId;
                const isSelectedElsewhere =
                  selectedItemIds.has(option.value) && !isCurrentSelection;

                return matchesSearch && !isSelectedElsewhere;
              });

              return (
                <tr
                  key={item.id}
                  className={`border-t ${
                    rowError ? "border-rose-200 bg-rose-50/40" : "border-slate-100"
                  }`}
                >
                  <td className="px-4 py-3 text-xs text-slate-500 xl:text-sm">
                    {`0${index + 1}`.slice(-2)}
                  </td>
                  <td className="px-4 py-3">
                    <SearchableDropdown
                      value={itemSearchByRow[item.id] ?? item.name}
                      options={filteredOptions}
                      placeholder="Type item name"
                      onInputChange={(typedValue) => {
                        setItemSearchByRow((prev) => ({
                          ...prev,
                          [item.id]: typedValue,
                        }));

                        if (item.itemId) {
                          onSelectItem(item.id, "");
                        }
                      }}
                      onSelect={(option) => {
                        onSelectItem(item.id, option.value);
                        setItemSearchByRow((prev) => ({
                          ...prev,
                          [item.id]: option.label,
                        }));
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">{item.hsnCode || "-"}</td>
                  <td className="px-4 py-3">
                    <Input
                      value={item.quantity}
                      name="quantity"
                      data-id={item.id}
                      onChange={onQuantityChange}
                      className={`h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none ${
                        rowError
                          ? "border-rose-400 focus:border-rose-500"
                          : "border-slate-300 focus:border-primary"
                      }`}
                      placeholder="0"
                    />
                    {rowError ? (
                      <p className="mt-1 text-xs font-medium text-rose-700">
                        {rowError}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{item.unit || "-"}</td>
                  <td className="px-4 py-3">{item.basePrice || "₹0.00"}</td>
                  <td className="px-4 py-3">{item.gstPercentage}</td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-slate-900 xl:text-sm">
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
