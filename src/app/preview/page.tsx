import { redirect } from "next/navigation";
import { previewSurfacesEnabled } from "@/lib/preview";
import { PreviewClient } from "./PreviewClient";

export default function PreviewPage() {
  if (!previewSurfacesEnabled()) {
    redirect("/");
  }
  return <PreviewClient />;
}
