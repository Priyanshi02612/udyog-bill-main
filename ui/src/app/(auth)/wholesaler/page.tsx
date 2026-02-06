"use client";

import { auth } from "../../../lib/firebase/config";
import { Button } from "../../../components/ui/button";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const Wholesaler = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center gap-2 min-h-screen">
      Wholesaler
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

export default Wholesaler;
