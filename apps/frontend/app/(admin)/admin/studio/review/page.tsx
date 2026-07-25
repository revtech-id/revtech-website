import { redirect } from "next/navigation";

// Review functionality is integrated into the main Studio page tab
export default function StudioReviewRedirect() {
  redirect("/admin/studio");
}
