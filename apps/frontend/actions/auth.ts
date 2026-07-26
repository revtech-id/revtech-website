'use server';

import { redirect } from 'next/navigation';

export async function signOutAction() {
  // Temporary mock for sign out action
  return redirect('/admin/login');
}
