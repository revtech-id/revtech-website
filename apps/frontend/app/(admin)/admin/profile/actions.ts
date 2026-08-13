"use server";

export async function updateProfile(data: any) {
  // Simulate network delay to show loading state (2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Here you would normally update the database, e.g., Supabase
  // For now, we just mock a success response.
  


  return { success: true, message: "Profil berhasil diperbarui." };
}
