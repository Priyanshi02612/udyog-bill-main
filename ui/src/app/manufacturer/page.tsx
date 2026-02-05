"use client";

import { Button } from "../../components/ui/button";
import { auth } from "../../lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const Manufacturer = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center gap-2 min-h-screen">
      Manufacturer{" "}
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

export default Manufacturer;
