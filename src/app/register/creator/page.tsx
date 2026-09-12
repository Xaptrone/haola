import { redirect } from "next/navigation";

export default function RegisterCreatorPage() {
  redirect("/login?intent=creator");
}
