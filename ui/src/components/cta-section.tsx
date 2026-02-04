"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { MdOutlineArrowForward } from "react-icons/md";

export const CTASection = () => {
  const router = useRouter();

  return (
    <div className="pb-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary textile-pattern opacity-10"></div>
      <div className="max-w-240 mx-auto px-6 text-center relative z-10">
        <div className="bg-primary rounded-3xl p-10 lg:p-20 shadow-2xl">
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 tracking-tight">
            Ready to transform your textile business?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of textile professionals streamlining their
            operations with UdyogBill. Get started in minutes, not months.
          </p>

          <Button
            variant="secondary"
            trailingIcon={<MdOutlineArrowForward className="w-5 h-5" />}
            className="w-max"
            onClick={() => router.push("/sign-up")}
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
};
