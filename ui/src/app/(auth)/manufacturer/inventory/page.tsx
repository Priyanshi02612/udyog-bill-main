import { TbShirtFilled } from "react-icons/tb";
import { MdTexture } from "react-icons/md";
import { RiShapesFill } from "react-icons/ri";
import { Dropdown } from "@/src/components/ui/dropdown";

const processTypes = [
  { label: "Process Type", value: "" },
  { label: "Maharashtra", value: "maharashtra" },
  { label: "Gujarat", value: "gujarat" },
  { label: "Tamil Nadu", value: "tamilnadu" },
  { label: "Karnataka", value: "karnataka" },
  { label: "Delhi", value: "delhi" },
];

const filters = [
  {
    label: "Cloth",
    icon: <TbShirtFilled className="w-5 h-5" />,
  },
  {
    label: "Thread",
    icon: <MdTexture className="w-5 h-5" />,
  },
  {
    label: "Material",
    icon: <RiShapesFill className="w-5 h-5" />,
  },
];

const Inventory = () => {
  return (
    <div className="flex flex-col flex-1 px-10 py-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#0d161b] text-3xl font-black leading-tight tracking-tight">
            Items Inventory
          </h1>
          <p className="text-[#4c799a] text-base font-normal">
            Manage and track your textile materials, threads, and cloth stocks.
          </p>
        </div>
        <button className="flex min-w-35 cursor-pointer items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add New Item</span>
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button className="inline-flex items-center rounded-full bg-primary text-white shadow-sm px-4 py-2 text-xs font-medium inset-ring inset-ring-gray-400/20">
          All Items
        </button>

        {filters.map((filter, index) => (
          <button
            key={index}
            className="inline-flex items-center rounded-full bg-slate-200 text-primary shadow-sm px-4 py-2 text-xs font-medium inset-ring inset-ring-gray-400/20"
          >
            {filter.icon}
            <span className="font-medium">{filter.label}</span>
          </button>
        ))}

        <div className="h-9 w-px bg-slate-200 mx-2"></div>
        <Dropdown options={processTypes} />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e7eef3] bg-white shadow-sm">
        <div className="overflow-x-auto @container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#e7eef3]">
                <th className="px-6 py-4 text-[#4c799a] text-xs font-bold uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-4 text-[#4c799a] text-xs font-bold uppercase tracking-wider">
                  Item Type
                </th>
                <th className="px-6 py-4 text-[#4c799a] text-xs font-bold uppercase tracking-wider">
                  Process Type
                </th>
                <th className="px-6 py-4 text-[#4c799a] text-xs font-bold uppercase tracking-wider text-center">
                  HSN Code
                </th>
                <th className="px-6 py-4 text-[#4c799a] text-xs font-bold uppercase tracking-wider">
                  Base Price
                </th>
                <th className="px-6 py-4 text-[#4c799a] text-xs font-bold uppercase tracking-wider text-center">
                  GST %
                </th>
                <th className="px-6 py-4 text-[#4c799a] text-xs font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-[#4c799a] text-xs font-bold uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7eef3]">
              <tr className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                      <span className="material-symbols-outlined">
                        inventory_2
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-[#0d161b]">
                      Premium Cotton
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700">
                    CLOTH
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border border-slate-200 bg-slate-50 text-slate-600">
                    DYEING
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-[#4c799a]">
                  5208
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0d161b]">
                  ₹850/meter
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-[#4c799a]">
                  5%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
                    <span className="size-1.5 rounded-full bg-green-500"></span>
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-slate-400">
                  <button className="material-symbols-outlined hover:text-primary transition-colors">
                    more_vert
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
