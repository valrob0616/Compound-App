declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG?: string;
    EXPO_PUBLIC_API_URL?: string;
    /** Supabase project URL. Public. Required for store builds. */
    EXPO_PUBLIC_SUPABASE_URL?: string;
    /** Supabase publishable key (sb_publishable_...). Public. Not a secret or service-role key. */
    EXPO_PUBLIC_SUPABASE_KEY?: string;
    EXPO_PUBLIC_PRIVACY_POLICY_URL?: string;
    EXPO_PUBLIC_TERMS_OF_USE_URL?: string;
    EXPO_PUBLIC_PRIVACY_CONTACT_EMAIL?: string;
  }
}
