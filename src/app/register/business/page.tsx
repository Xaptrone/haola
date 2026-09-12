import { redirect } from "next/navigation";

export default function RegisterBusinessPage() {
  redirect("/login?intent=business");
}
