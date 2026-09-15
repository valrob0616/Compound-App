import { DEFAULT_PRIVACY_CONTACT_EMAIL as CONTACT } from '@/constants/config';

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] };

export type LegalDocument = {
  id: 'privacy' | 'terms';
  title: string;
  effectiveDate: string;
  blocks: LegalBlock[];
};

export const PRIVACY_EFFECTIVE_DATE = 'September 15, 2026';
export const TERMS_EFFECTIVE_DATE = 'September 15, 2026';

export const privacyPolicy: LegalDocument = {
  id: 'privacy',
  title: 'Privacy Policy',
  effectiveDate: PRIVACY_EFFECTIVE_DATE,
  blocks: [
    {
      type: 'p',
      text: 'Homestead Compound News is operated by Imcon International Inc. Bundle ID: com.imconintl.homesteadcompound.',
    },
    {
      type: 'p',
      text: 'This policy describes how Homestead Compound News (“the app,” “we,” “us”) handles information when you use the iOS or Android app, or a web preview of the same codebase.',
    },
    { type: 'h2', text: 'Who we are' },
    {
      type: 'p',
      text: `Imcon International Inc. publishes Homestead Compound News, a news, video, and shopping companion for homesteaders and family compounds. Privacy requests: ${CONTACT}.`,
    },
    { type: 'h2', text: 'What this app does' },
    {
      type: 'p',
      text: 'You can browse two category feeds (Homesteading and Family Compounds), watch curated YouTube videos, open news articles, and tap store products that lead to Amazon. You may create an optional account to save a display name, a preferred category, and favorites. You can use the feeds and store without an account.',
    },
    { type: 'h2', text: 'Information we collect' },
    { type: 'h2', text: 'If you browse as a guest' },
    {
      type: 'ul',
      items: [
        'The last feed category you selected (Homesteading or Family Compounds), stored on the device so the app can reopen to that area.',
        'We do not ask for your name or email unless you create an account.',
      ],
    },
    { type: 'h2', text: 'If you create an account' },
    {
      type: 'ul',
      items: [
        'Email address',
        'Password (see “How accounts work” below)',
        'Display name you choose',
        'Preferred category: Homesteading, Family Compounds, or both',
        'Favorites: identifiers of news items, videos, or other feed cards you save, stored on the device and keyed to your account',
      ],
    },
    { type: 'p', text: 'Do not put sensitive personal information in your display name.' },
    { type: 'h2', text: 'Information we do not collect' },
    {
      type: 'p',
      text: 'This version of the app does not collect:',
    },
    {
      type: 'ul',
      items: [
        'Precise location, contacts, photos, camera, microphone, or your address book',
        'Payment card numbers (purchases, if any, happen on Amazon)',
        'Government ID numbers',
        'Advertising identifiers for our own ads (the app does not include an ads SDK)',
        'Analytics from a third-party analytics SDK (none is bundled in this app)',
      ],
    },
    { type: 'p', text: 'We do not sell your personal information.' },
    { type: 'h2', text: 'How accounts work' },
    {
      type: 'p',
      text: 'The app has two authentication modes. Which one you are in is shown on the Account screen.',
    },
    {
      type: 'p',
      text: 'Demo / local mode (default when no cloud keys are configured). Your email, a salted password hash, display name, and preferred category are stored on this device using the operating system’s secure storage (or browser storage on web previews). No cloud account is created. Uninstalling the app, or using Delete account, removes that local record from this device.',
    },
    {
      type: 'p',
      text: 'Supabase mode (when the publisher has configured a Supabase project). Sign-up and sign-in are handled by Supabase Auth. Email and password are processed by Supabase. Display name and preferred category are stored in your Auth user metadata. Supabase’s own privacy policy applies to that processing: https://supabase.com/privacy',
    },
    {
      type: 'p',
      text: 'Sessions are kept so you stay signed in after restarting the app. Favorites stay on the device in both modes; they are not uploaded to a Homestead Compound News server in this version.',
    },
    { type: 'h2', text: 'How we use information' },
    {
      type: 'p',
      text: 'We use account and preference data to sign you in, show your display name and email, remember your preferred category, and save favorites when you are signed in. We use technical connections (not your account profile) to load public RSS feeds, YouTube thumbnails and videos, and Amazon product pages when you choose View on Amazon.',
    },
    { type: 'h2', text: 'Third parties' },
    {
      type: 'p',
      text: 'When you use certain features, you leave our screens or load third-party content. Those services have their own policies. We do not control them.',
    },
    {
      type: 'ul',
      items: [
        'Amazon. Store products open Amazon using a product ID and an Amazon Associates tracking tag. If you continue on Amazon, Amazon may collect information under Amazon’s privacy policy. Affiliate clicks can earn Imcon International Inc. a commission if you buy something. We do not receive your Amazon account details.',
        'YouTube / Google. Video cards use YouTube video IDs. Playback uses an in-app player (a YouTube embed) and you can open the video on YouTube. Google’s policies apply.',
        'News publishers. Article cards open the publisher’s webpage in an in-app browser. RSS feeds are requested from public publisher URLs. Those sites may set their own cookies or logs when the page loads.',
        'Supabase. Only when Supabase mode is enabled, as described above.',
        'Apple, Google, and Expo. App Store, Google Play, and the Expo build tools (EAS) are used to compile and distribute the app. They are not used in this version as an end-user analytics product inside the app.',
      ],
    },
    { type: 'h2', text: 'Data retention' },
    {
      type: 'ul',
      items: [
        'Guest category choice: until you change it, clear app data, or uninstall.',
        'Demo accounts and hashed passwords: on this device until you delete the account or uninstall the app.',
        'Favorites: on this device until you remove them, delete the account, or uninstall.',
        'Supabase accounts: until we delete the Auth user after a valid request, or you delete it through a process we provide later.',
      ],
    },
    { type: 'h2', text: 'Your choices and account deletion' },
    {
      type: 'ul',
      items: [
        'You can browse without an account.',
        'You can edit your display name and preferred category while signed in.',
        'You can sign out at any time.',
        `Delete account is on the Account screen. In demo mode this erases the local account, session, and favorites on this device immediately. In Supabase mode it signs you out and clears favorites on this device; email ${CONTACT} from that same address so we can delete the cloud Auth record.`,
        'You can also email that address to ask what data we have, to correct your display name, or to request deletion if you cannot use the in-app control.',
      ],
    },
    { type: 'h2', text: 'Children' },
    {
      type: 'p',
      text: 'Homestead Compound News is not directed at children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child under 13 created an account, contact us and we will delete it.',
    },
    { type: 'h2', text: 'Security' },
    {
      type: 'p',
      text: 'We use platform secure storage for demo sessions and password hashes, and HTTPS for RSS, YouTube, Amazon, and (when enabled) Supabase. No method of transmission or storage is perfectly secure.',
    },
    { type: 'h2', text: 'Changes' },
    {
      type: 'p',
      text: 'If we change this policy, we will update the effective date and the copy in the app. Material changes to how we handle account data will be described in the updated policy.',
    },
    { type: 'h2', text: 'Contact' },
    {
      type: 'p',
      text: `Imcon International Inc. Email: ${CONTACT}. App: Homestead Compound News (com.imconintl.homesteadcompound). If this contact address changes, the Account screen and a later revision of this policy will show the address in use.`,
    },
  ],
};

export const termsOfUse: LegalDocument = {
  id: 'terms',
  title: 'Terms of Use',
  effectiveDate: TERMS_EFFECTIVE_DATE,
  blocks: [
    {
      type: 'p',
      text: 'These terms are a short agreement for using Homestead Compound News, operated by Imcon International Inc. The Privacy Policy explains how information is handled.',
    },
    { type: 'h2', text: 'The app' },
    {
      type: 'p',
      text: 'Homestead Compound News offers news and video feeds for Homesteading and Family Compounds, plus a store of product cards that link to Amazon. Features may change.',
    },
    { type: 'h2', text: 'Accounts' },
    {
      type: 'p',
      text: `Accounts are optional. You are responsible for the email and password you use and for the display name you choose. We may refuse or close accounts that are abusive or created in bulk. Use Delete account on the Account screen, or email ${CONTACT}, if you want the account removed (see the Privacy Policy for demo vs cloud accounts).`,
    },
    { type: 'h2', text: 'Affiliate disclosure' },
    {
      type: 'p',
      text: 'Some store links are Amazon Associates links. Imcon International Inc. may earn a commission if you buy something after following a link. Prices, stock, and Amazon’s checkout are Amazon’s, not ours.',
    },
    { type: 'h2', text: 'Third-party content' },
    {
      type: 'p',
      text: 'Articles, videos, and product listings belong to their publishers, creators, or Amazon. We provide links and embeds for convenience. We do not warrant that third-party pages are accurate, safe, or available.',
    },
    { type: 'h2', text: 'Acceptable use' },
    {
      type: 'p',
      text: 'Do not misuse the app (including attempting to break authentication, scrape the app as a substitute for publisher sites in a way that violates their terms, or harass others through any feature we add later).',
    },
    { type: 'h2', text: '“As is”' },
    {
      type: 'p',
      text: 'The app is provided as is, for general information and shopping links. It is not professional legal, medical, agricultural, or engineering advice.',
    },
    { type: 'h2', text: 'Contact' },
    {
      type: 'p',
      text: `${CONTACT} — Imcon International Inc.`,
    },
  ],
};
