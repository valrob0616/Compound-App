# Homestead Compound News

Cross-platform Expo (React Native) app for homesteaders and family compounds: two clearly separated news + video feeds, a Store tab (Coming Soon for first publish), and email/password accounts.

Display name: **Homestead Compound News**  
Bundle ID / application ID: `com.loudfh.homesteadcompound`

## Run it

Requirements: Node.js 22.13+ and npm.

```bash
npm install
cp .env.example .env   # optional; demo auth works with empty Supabase vars
npx expo start
```

Then:

- Scan the QR code with **Expo Go** (SDK must match — this project targets **Expo SDK 57**), or
- Press `i` / `a` for iOS Simulator / Android emulator, or
- `npm run web` for a browser preview (some RSS hosts block CORS on web; the app falls back to seed stories).

```bash
npm run ios
npm run android
npm run web
```

Typecheck:

```bash
npm run typecheck
```

Affiliate URL helper tests:

```bash
npm test
```

## What you can demo without any keys

1. **Feed** — switch **Homesteading** vs **Family Compounds**. Cards interleave news and YouTube. Pull to refresh. Tap news for an in-app WebView; tap video for an in-app player (plus Open in YouTube).
2. **Store** — **Coming Soon** for first publish. Homesteading and Family Compounds shopping (Amazon affiliate picks) will be added after launch. Catalog JSON and URL helpers stay in the repo; set `STORE_CATALOG_ENABLED` in `src/constants/config.ts` when you are ready.
3. **Account** — sign up, sign in, sign out, edit display name, set preferred category (Homesteading / Family Compounds / both). Session survives app restarts. Guests can browse; saving favorites prompts for an account. **Privacy Policy** and **Terms of Use** are on the Account tab without signing in.

Until Supabase env vars are set, auth is **demo mode**: accounts live in local secure storage on the device (or `localStorage` on web).

## Environment variables

Copy `.env.example` to `.env` or `.env.local`. Expo only inlines names that start with `EXPO_PUBLIC_`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG` | After Store launch | Amazon Associates tracking ID. Default placeholder: `yourtag-20`. Not used in the first-publish Store UI. |
| `EXPO_PUBLIC_SUPABASE_URL` | For live Auth | Project URL, e.g. `https://xxxx.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | For live Auth | Public anon key from the Supabase project API settings |
| `EXPO_PUBLIC_PRIVACY_POLICY_URL` | For store listings | Public Privacy Policy URL. Default: GitHub Pages `…/Compound-App/privacy.html`. |
| `EXPO_PUBLIC_TERMS_OF_USE_URL` | Optional | Public Terms of Use URL. Default: `…/Compound-App/terms.html`. |
| `EXPO_PUBLIC_PRIVACY_CONTACT_EMAIL` | Optional | Privacy inbox. Default: `rob@loudfh.com` (change to `privacy@loudfh.com` if you create that alias). |

Do **not** put a service-role key, a real production Associates ID you are not ready to publish, or any other secret in the repo. The anon key is expected to be public in the client but should still be protected with Auth + RLS on any tables you add later.

### Amazon Associates tag (post-launch)

The first-publish Store tab is Coming Soon. When you turn the catalog on (`STORE_CATALOG_ENABLED` in `src/constants/config.ts`):

1. Join [Amazon Associates](https://affiliate-program.amazon.com/).
2. Copy your tracking ID (often looks like `yourname-20`).
3. Set `EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG` and rebuild (`npx expo start -c` so Metro reloads env).
4. Confirm a product URL includes `?tag=your-real-id`.

### Flip demo auth → live Supabase

1. Create a project at [supabase.com](https://supabase.com/).
2. Authentication → Providers → enable **Email**. For a store build, turn off “Confirm email” or add email templates; otherwise sign-up may require a confirmation link before sign-in.
3. Project Settings → API → copy **Project URL** and **anon public** key into `.env`:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
   ```

4. Restart Expo with cache clear: `npx expo start -c`.
5. The Account tab pill should read **Supabase auth**.

Profile fields (display name, preferred category) are stored on the Auth user `user_metadata`. No extra database table is required for the MVP. Optional SQL if you later want a `profiles` table:

```sql
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  preferred_category text check (preferred_category in ('homesteading', 'family-compounds', 'both')),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
```

Favorites remain on-device, keyed by user id (works in both auth modes).

## Feeds and data

- **Homesteading RSS (when reachable):** [Hobby Farms](https://www.hobbyfarms.com/feed/), [Off The Grid News](https://www.offthegridnews.com/feed/).
- **Family Compounds RSS (when reachable):** [Foundation for Intentional Community](https://www.ic.org/feed/), [resilience.org](https://www.resilience.org/feed/) (keyword-filtered for land, community, food, stewardship, etc.).
- If a host is down, blocks bots, or CORS blocks web, the app **merges in original seed briefings** so both feeds still look complete.
- YouTube IDs are curated in `src/data/videos.ts` (permaculture, compost, ecovillage / co-housing). Playback uses an in-app WebView embed (`react-native-webview`).
- Store catalog JSON and affiliate URL builder remain in `src/data/products.json` and `src/lib/affiliate.ts` for a later release. The Store tab currently shows Coming Soon.

## EAS / App Store / Google Play

This repo is EAS-ready (`eas.json`, bundle IDs in `app.json`). You still need Expo and store accounts.

```bash
npm i -g eas-cli
npx expo login          # or eas login
eas init                # creates an Expo project and writes extra.eas.projectId
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios
eas submit --platform android
```

Use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) if you outgrow Expo Go.

Set production env vars in [EAS secrets](https://docs.expo.dev/build-reference/variables/) (`eas secret:create`) rather than committing `.env`.

`eas.json` `submit.production.ios.ascAppId` is a placeholder — replace after the app exists in App Store Connect.

## Remaining store-listing checklist

Not finished by this scaffold (Apple and Google require your accounts and live hosted pages):

- [ ] Replace adaptive/app icons and splash if you want photography or a designer mark (current assets are a simple homestead/compound mark on forest green).
- [ ] 1024×1024 marketing icon, 5.5"/6.7" iPhone screenshots, Android feature graphic (1024×500) and phone screenshots.
- [x] **Privacy Policy (and short Terms of Use) content** — in-app under Account, plus `docs/privacy.html` / `docs/terms.html` for hosting. Have counsel review before you rely on this in production; this repo is not a law firm.
- [ ] **Host a public Privacy Policy URL** (required for accounts). Follow [Host the privacy policy](#host-the-privacy-policy) below, then paste that URL into App Store Connect and Play Console.
- [ ] Apple Developer Program ($99/year) + App Store Connect app record, privacy nutrition labels, export compliance.
- [ ] Google Play Developer account + Data safety form + content rating questionnaire.
- [ ] Real Amazon Associates ID in EAS secrets (when enabling the Store catalog after first publish).
- [ ] Production Supabase project, email templates, and abuse controls (rate limits, captcha if needed).
- [ ] Support URL, marketing URL, and age rating (likely 4+ / Everyone if content stays non-graphic).
- [ ] Confirm YouTube ToS for in-app playback of third-party videos; keep “Open in YouTube”.
- [ ] Review RSS attributions; do not scrape paywalled full text.

## Host the privacy policy

The user-facing policy lives in three places that should stay aligned:

| File | Role |
| --- | --- |
| `docs/privacy-policy.md` / `docs/terms-of-use.md` | Canonical markdown for review and diffs |
| `docs/privacy.html` / `docs/terms.html` / `docs/index.html` | GitHub Pages (or any static host) |
| `src/content/legal.ts` | In-app screens (Account → Privacy Policy / Terms of Use) |

**Recommended: GitHub Pages on this repo**

1. Merge this branch to `main`.
2. GitHub → **Settings → Pages**.
3. Source: **Deploy from a branch**. Branch: `main`. Folder: `/docs`.
4. After the Pages site is live, the store-listing URLs are:
   - Privacy: `https://valrob0616.github.io/Compound-App/privacy.html`
   - Terms: `https://valrob0616.github.io/Compound-App/terms.html`
5. Put the **Privacy** URL in App Store Connect (App Privacy / Privacy Policy URL) and Google Play Console (Store listing → Privacy policy).
6. Those same URLs are the app defaults in `app.json` `expo.extra.privacyPolicyUrl` / `termsOfUseUrl`. Override with `EXPO_PUBLIC_PRIVACY_POLICY_URL` if you host elsewhere.

Until Pages is enabled, open the HTML files in `docs/` locally or from the repo. GitHub’s blob view is fine for humans, but store consoles want a stable `https` page that renders as a webpage.

**Alternative: your own domain**

Copy `docs/privacy.html` (and `legal.css`, or inline the CSS) to something like `https://loudfh.com/privacy` (or a `/homestead-compound/` path). Then set:

```bash
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://loudfh.com/privacy
EXPO_PUBLIC_TERMS_OF_USE_URL=https://loudfh.com/terms
```

and the same values in EAS secrets / `app.json` extra.

**Privacy contact email**

The published address is **rob@loudfh.com**. To use `privacy@loudfh.com` (or another inbox), update:

- `EXPO_PUBLIC_PRIVACY_CONTACT_EMAIL` and `app.json` `expo.extra.privacyContactEmail`
- `src/constants/config.ts` (`DEFAULT_PRIVACY_CONTACT_EMAIL`)
- `docs/privacy.html`, `docs/privacy-policy.md`, `docs/terms.html`, `docs/terms-of-use.md`

## Privacy notes (accounts)

Matches the in-app policy. Summary:

**Collected when someone creates an account:** email, password (salted hash in demo secure storage, or hashed by Supabase), display name, preferred category. Favorites (item ids) stay on the device.

**Not collected in this MVP:** precise location, contacts, photos, payment cards, government IDs, ads SDK, analytics SDK. We do not sell personal data. YouTube/Google and RSS publishers apply when the user opens those features. Amazon Associates links are not shown in the first-publish Store UI (Coming Soon).

**Deletion:** Account tab → Delete account. Demo mode wipes the local record immediately. Supabase mode clears this device and requires an email to `rob@loudfh.com` to erase the Auth user.

Have an attorney review `docs/privacy-policy.md` before you treat it as final for a commercial launch.

**Legal display name:** Privacy and Terms use **LFH Inc** as the operator. Identifier, email, and domain strings use **loudfh** (`com.loudfh.homesteadcompound`, `rob@loudfh.com`, `loudfh.com`).

## Project layout

```
app/                 Expo Router screens (tabs: Feed, Store, Account; legal screens)
src/components/      UI
src/content/         In-app Privacy Policy and Terms
src/context/         Auth, preferences, theme
src/data/            Seed news, videos, products, RSS source list
src/lib/             RSS, feed interleave, affiliate URLs, auth backends
src/theme/           Homestead palette
src/types/           NewsItem | VideoItem | Product | UserProfile
docs/                Hostable Privacy Policy and Terms (GitHub Pages)
```

## License

Application code is MIT. Third-party articles, videos, and Amazon listings remain the property of their owners; this app only links to them.
