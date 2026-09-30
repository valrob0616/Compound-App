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

export const PRIVACY_EFFECTIVE_DATE = 'September 30, 2026';
export const TERMS_EFFECTIVE_DATE = 'September 30, 2026';

export const privacyPolicy: LegalDocument = {
  id: 'privacy',
  title: 'Privacy Policy',
  effectiveDate: PRIVACY_EFFECTIVE_DATE,
  blocks: [
    {
      type: 'p',
      text: 'Family Compound & Homestead Living is operated by LFH Inc. Bundle ID: com.loudfh.homesteadcompound.',
    },
    {
      type: 'p',
      text: 'This policy describes how Family Compound & Homestead Living (“the app,” “we,” “us”) handles information when you use the iOS or Android app, or a web preview of the same codebase.',
    },
    { type: 'h2', text: 'Who we are' },
    {
      type: 'p',
      text: `LFH Inc publishes Family Compound & Homestead Living, a news and video companion for homesteaders and family compounds. Privacy requests: ${CONTACT}.`,
    },
    { type: 'h2', text: 'What this app does' },
    {
      type: 'p',
      text: 'News articles come from Family Compound RSS feeds. Featured Videos switch between Homesteading and Family Compounds. The Store tab is Coming Soon; Amazon affiliate picks will be added after this first release. You may create an optional account to save a display name, a preferred category (used for Videos), and favorites. You can use the app without an account.',
    },
    { type: 'h2', text: 'Information we collect' },
    { type: 'h2', text: 'If you browse as a guest' },
    {
      type: 'ul',
      items: [
        'The last Videos category you selected (Homesteading or Family Compounds), stored on the device so the Videos tab can reopen to that area. News does not switch categories.',
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
        'Favorites you save while signed in: the title and link (or video id) of a news article, featured video, or Compound Scout look. These are stored with your account on the server',
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
        'Payment card numbers (this version has no in-app checkout; a later Store may open Amazon)',
        'Government ID numbers',
        'Advertising identifiers for our own ads (the app does not include an ads SDK)',
        'Analytics from a third-party analytics SDK (none is bundled in this app)',
      ],
    },
    { type: 'p', text: 'We do not sell your personal information.' },
    { type: 'h2', text: 'How accounts work' },
    {
      type: 'p',
      text: 'Creating an account sends your email, password, and display name to the Family Compound account server run for this app. The server stores your email, display name, and preferred category. It stores your password only as a bcrypt hash. The password is not saved on your phone, and the app does not keep a copy of the account database on the device.',
    },
    {
      type: 'p',
      text: 'The app keeps a sign-in token in the device’s secure storage (or browser storage on a web preview) so you stay signed in after a restart. That token is not your password. Signing out or deleting the account removes the token from this device.',
    },
    {
      type: 'p',
      text: 'Favorites are the news articles, videos, and Compound Scout looks you bookmark. They are stored with your account on the server and load when you sign in again, including on another device.',
    },
    { type: 'h2', text: 'How we use information' },
    {
      type: 'p',
      text: 'We use account and preference data to sign you in, show your display name and email, remember your preferred category, and save favorites when you are signed in. We use technical connections (not your account profile) to load public RSS feeds and YouTube thumbnails and videos. When the Store is available, choosing a product may open Amazon.',
    },
    { type: 'h2', text: 'Third parties' },
    {
      type: 'p',
      text: 'When you use certain features, you leave our screens or load third-party content. Those services have their own policies. We do not control them.',
    },
    {
      type: 'ul',
      items: [
        'Amazon. The Store is Coming Soon in this first release. When affiliate product links are added, they will open Amazon using a product ID and an Associates tracking tag. If you continue on Amazon, Amazon may collect information under Amazon’s privacy policy. Affiliate clicks can earn LFH Inc a commission if you buy something. We do not receive your Amazon account details.',
        'YouTube / Google. Video cards use YouTube video IDs. Playback uses an in-app player (a YouTube embed) and you can open the video on YouTube. Google’s policies apply.',
        'News publishers. Article cards open the publisher’s webpage in an in-app browser. RSS feeds for news are requested from public Family Compound publisher URLs (for example Four Generations One Roof, Barndos, and the Foundation for Intentional Community). Those sites may set their own cookies or logs when the page loads.',
        'Apple, Google, and Expo. App Store, Google Play, and the Expo build tools (EAS) are used to compile and distribute the app. They are not used in this version as an end-user analytics product inside the app.',
      ],
    },
    { type: 'h2', text: 'Data retention' },
    {
      type: 'ul',
      items: [
        'Guest Videos category choice: on this device until you change it, clear app data, or uninstall.',
        'Account email, display name, preferred category, bcrypt password hash, and favorites: on the account server until you delete the account, or until we delete them after a request to the contact address below.',
        'Sign-in token: on this device until you sign out, delete the account, or uninstall. The password is not stored on the device.',
      ],
    },
    { type: 'h2', text: 'Your choices and account deletion' },
    {
      type: 'ul',
      items: [
        'You can browse without an account.',
        'You can edit your display name and preferred category while signed in.',
        'You can sign out at any time.',
        `Delete account is on the Account screen. It deletes the account, password hash, sessions, and favorites on the server, and clears the sign-in token on this device.`,
        `You can email ${CONTACT} to ask what data we have, to correct your display name, or to request deletion if you cannot use the in-app control.`,
      ],
    },
    { type: 'h2', text: 'Children' },
    {
      type: 'p',
      text: 'Family Compound & Homestead Living is not directed at children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child under 13 created an account, contact us and we will delete it.',
    },
    { type: 'h2', text: 'Security' },
    {
      type: 'p',
      text: 'Passwords are hashed with bcrypt on the account server before they are stored. The app does not write the password to device storage. The sign-in token is kept in platform secure storage. The account server should be reached over HTTPS in production. RSS, YouTube, and future Store links also use HTTPS. No method of transmission or storage is perfectly secure.',
    },
    { type: 'h2', text: 'Changes' },
    {
      type: 'p',
      text: 'If we change this policy, we will update the effective date and the copy in the app. Material changes to how we handle account data will be described in the updated policy.',
    },
    { type: 'h2', text: 'Contact' },
    {
      type: 'p',
      text: `LFH Inc. Email: ${CONTACT}. App: Family Compound & Homestead Living (com.loudfh.homesteadcompound). If this contact address changes, the Account screen and a later revision of this policy will show the address in use.`,
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
      text: 'These terms are a short agreement for using Family Compound & Homestead Living, operated by LFH Inc. The Privacy Policy explains how information is handled.',
    },
    { type: 'h2', text: 'The app' },
    {
      type: 'p',
      text: 'Family Compound & Homestead Living offers Family Compound news (RSS) and featured YouTube videos for Homesteading and Family Compounds. The Store tab is Coming Soon. Features may change.',
    },
    { type: 'h2', text: 'Accounts' },
    {
      type: 'p',
      text: `Accounts are optional. You are responsible for the email and password you use and for the display name you choose. We may refuse or close accounts that are abusive or created in bulk. Use Delete account on the Account screen, or email ${CONTACT}, to remove the account from the server.`,
    },
    { type: 'h2', text: 'Affiliate disclosure' },
    {
      type: 'p',
      text: 'When the Store includes product links, some may be Amazon Associates links. LFH Inc may earn a commission if you buy something after following a link. Prices, stock, and Amazon’s checkout are Amazon’s, not ours. This first release does not show those links.',
    },
    { type: 'h2', text: 'Third-party content' },
    {
      type: 'p',
      text: 'Articles and videos belong to their publishers or creators. We provide links and embeds for convenience. We do not warrant that third-party pages are accurate, safe, or available.',
    },
    { type: 'h2', text: 'Acceptable use' },
    {
      type: 'p',
      text: 'Do not misuse the app (including attempting to break authentication, scrape the app as a substitute for publisher sites in a way that violates their terms, or harass others through any feature we add later).',
    },
    { type: 'h2', text: '“As is”' },
    {
      type: 'p',
      text: 'The app is provided as is, for general information. It is not professional legal, medical, agricultural, or engineering advice.',
    },
    { type: 'h2', text: 'Contact' },
    {
      type: 'p',
      text: `${CONTACT} — LFH Inc`,
    },
  ],
};
