import type { PreferredCategory, UserProfile } from '@/types';
import { removeItem, storageKeys } from '@/lib/storage';
import { getAuthMode } from './mode';
import * as demo from './demo';
import * as supabaseAuth from './supabase';

export { getAuthMode } from './mode';

export async function restoreSession(): Promise<UserProfile | null> {
  if (getAuthMode() === 'supabase') {
    return supabaseAuth.supabaseGetSession();
  }
  return demo.demoGetSession();
}

export async function signUp(input: {
  email: string;
  password: string;
  displayName: string;
  preferredCategory?: PreferredCategory;
}): Promise<UserProfile> {
  if (getAuthMode() === 'supabase') {
    return supabaseAuth.supabaseSignUp(input);
  }
  return demo.demoSignUp(input);
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  if (getAuthMode() === 'supabase') {
    return supabaseAuth.supabaseSignIn(email, password);
  }
  return demo.demoSignIn(email, password);
}

export async function signOut(): Promise<void> {
  if (getAuthMode() === 'supabase') {
    await supabaseAuth.supabaseSignOut();
    return;
  }
  await demo.demoSignOut();
}

export async function updateProfile(
  user: UserProfile,
  patch: Partial<Pick<UserProfile, 'displayName' | 'preferredCategory'>>,
): Promise<UserProfile> {
  if (getAuthMode() === 'supabase') {
    return supabaseAuth.supabaseUpdateProfile(patch);
  }
  return demo.demoUpdateProfile(user.id, patch);
}

export type DeleteAccountResult = {
  cloudDeletionPending: boolean;
};

export async function deleteAccount(user: UserProfile): Promise<DeleteAccountResult> {
  if (getAuthMode() === 'supabase') {
    await supabaseAuth.supabaseSignOut();
    await removeItem(storageKeys.favorites(user.id));
    return { cloudDeletionPending: true };
  }
  await demo.demoDeleteAccount(user.id);
  return { cloudDeletionPending: false };
}
