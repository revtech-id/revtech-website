import { redirect } from "next/navigation";

// Export functionality is integrated into the main Studio page tab
export default function StudioExportRedirect() {
  redirect("/admin/studio");
}
