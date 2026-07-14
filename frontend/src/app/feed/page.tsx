"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../utils/api";
import { ENDPOINTS } from "../../utils/endpoints";
import FeedApp from "../../components/FeedApp";
import type { User } from "../../types";
export default function Feed() {
  const router = useRouter();
  const [user, setUser] = useState<User>();
  useEffect(() => {
    api<User>(ENDPOINTS.auth.me)
      .then(setUser)
      .catch(() => router.replace("/login"));
  }, [router]);
  return user ? <FeedApp user={user} /> : <div style={{ minHeight: "100vh" }} />;
}
