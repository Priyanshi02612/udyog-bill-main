import { MdVerified, MdOutlineArrowForward } from "react-icons/md";
import { Button } from "./ui/button";
import { DashboardMockup } from "./dashboard-mockup";

export const HeroSection = () => {
  return (
    <div className="relative py-16 textile-pattern hero-gradient">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <MdVerified className="w-6 h-6" />
              <span>Industry First Financial OS</span>
            </div>

            <h1 className="text-2xl lg:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Seamless Financial Management for the{" "}
              <span className="text-primary">Textile Industry</span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed">
              From raw materials to retail shelves. Optimize your cash flow and
              supply chain with the only all-in-one financial platform built for
              Manufacturers, Wholesalers, and Retailers.
            </p>

            <Button
              trailingIcon={<MdOutlineArrowForward className="w-5 h-5" />}
              className="w-max"
            >
              Get Started Now
            </Button>

            <div className="flex items-center gap-4 text-slate-500 text-sm">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 overflow-hidden">
                  <div className="w-full h-full bg-primary/20"></div>
                </div>

                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 overflow-hidden">
                  <div className="w-full h-full bg-slate-400"></div>
                </div>

                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 overflow-hidden">
                  <div className="w-full h-full bg-primary/40"></div>
                </div>
              </div>

              <span>Trusted by 500+ textile enterprises</span>
            </div>
          </div>

          <DashboardMockup />
        </div>
      </div>
    </div>
  );
};
