import { redirect } from "next/navigation";

export default function PreviewPage() {
  redirect("/work/business?preview=1");
}
