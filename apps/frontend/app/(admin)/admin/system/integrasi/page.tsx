import { redirect } from "next/navigation";

// Integrasi functionality is in the main System page
export default function SystemIntegrasiRedirect() {
  redirect("/admin/system");
}
