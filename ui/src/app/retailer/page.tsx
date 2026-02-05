"use client";

import { Button } from "../../components/ui/button";
import { auth } from "../../lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const Retailer = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center gap-2 min-h-screen">
      Retailer
      <Button
        onClick={async () => {
          await signOut(auth);
          router.push("/");
        }}
      >
        Sign Out
      </Button>
    </div>
  );
};

export default Retailer;
