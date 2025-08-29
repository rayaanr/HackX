"use client";

import { WaveLoader } from "@/components/ui/loader";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      user ? router.replace("/dashboard") : router.replace("/login");
    }
  }, [user, loading, router]);

  return <WaveLoader />;
}
