import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FeedApp from "../../components/FeedApp";
import type { User } from "../../types";

export default async function Feed() {
  const encoded = (await headers()).get("x-auth-user");
  if (!encoded) redirect("/login");
  const user = JSON.parse(Buffer.from(encoded, "base64url").toString()) as User;
  return <FeedApp user={user} />;
}
