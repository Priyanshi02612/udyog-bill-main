import {
  MdFactory,
  MdCheckCircle,
  MdInventory,
} from "react-icons/md";

const featureOptions = [
  {
    id: 1,
    title: "Manufacturers",
    description:
      "Streamline raw material procurement, track inventory costs, and manage production overheads with real-time accuracy.",
    icon: <MdFactory className="w-6 h-6 text-primary" />,
    notes: [
      {
        id: 1,
        title: "Cost per Meter Tracking",
      },
      {
        id: 2,
        title: "Waste Management Analysis",
      },
    ],
  },
  {
    id: 2,
    title: "Wholesalers",
    description:
      "Scale your distribution with bulk order financing tools, automated invoicing, and intelligent logistics management.",
    icon: <MdInventory className="w-6 h-6 text-primary" />,
    notes: [
      {
        id: 1,
        title: "Dynamic Bulk Pricing",
      },
      {
        id: 2,
        title: "Multi-warehouse Sync",
      },
    ],
  },
];

export const FeatureSection = () => {
  return (
    <div className="my-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col gap-4 mb-16 max-w-4xl">
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Tailored Solutions for Every Segment
          </h2>
          <p className="text-lg text-slate-600">
            Our platform is designed to handle the unique financial complexities
            of the entire textile supply chain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {featureOptions.map((feature, index) => {
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-slate-600 mb-6">{feature.description}</p>
                <ul className="space-y-3 text-sm font-medium text-slate-500">
                  {feature.notes.map((note, index) => {
                    return (
                      <li key={index} className="flex items-center gap-2">
                        <MdCheckCircle className="w-6 h-6 text-primary" />
                        {note.title}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
