# Family Compound & Homestead Living

Cross-platform Expo (React Native) app for homesteaders and family compounds: a Family Compound RSS news section, a dedicated Featured Videos / YouTube tab for Homesteading and Family Compounds, a Learn tab (Compound Scout), a Store tab (Coming Soon for first publish), and email/password accounts.

Display name: **Family Compound & Homestead Living**  
Bundle ID / application ID: `com.loudfh.homesteadcompound`

## Run it

Requirements: Node.js 22.13+ and npm.

```bash
npm install
cp .env.example .env   # optional; defaults to http://localhost:8787
npm run server         # account API (sign-up, sign-in, favorites)
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

Tests (affiliate URLs, RSS parse, Family Compound topic filter, featured videos, Compound Scout content and scoring, account signup/sign-in/favorites against the in-repo server):

```bash
npm test
```

Preview live RSS titles after Family Compound topic filters (network required):

```bash
npm run preview:feeds
```

## What you can demo without any keys

1. **News** — Family Compound RSS only (multi-household living, financing, compound design, barndominiums, micro farms). There is no Homesteading switcher on this tab. Pull to refresh. Tap an article for an in-app WebView. A shortcut opens the Videos tab.
2. **Videos** — **Featured YouTube videos** for Homesteading or Family Compounds, not mixed into the news list. A prominent disclaimer states the clips are third-party YouTube content, not owned or created by LFH Inc or this app. Tap a card for an in-app player and **Open in YouTube**.
3. **Learn** — **Compound Scout**, an offline scenario game of Family Compound look-fors: acreage for five homes, written zoning, TDEC septic, water, a dispersed layout and pavilion, fire access, power and data, the ranch, ownership, FSA financing, and phasing. Progress and stage badges stay on the device. Replay a stage or the whole round. It is educational, not legal or financial advice.
4. **Store** — **Coming Soon** for first publish. Homesteading and Family Compounds shopping (Amazon affiliate picks) will be added after launch. Catalog JSON and URL helpers stay in the repo; set `STORE_CATALOG_ENABLED` in `src/constants/config.ts` when you are ready.
5. **Account** — sign up (name, email, password) and sign in against the account server. Edit display name and preferred category (Homesteading / Family Compounds / both). That preference applies to Featured Videos, not the news RSS. The device keeps a sign-in token so the session survives restarts; the password is not stored on the phone. Bookmark a news article, a featured video, or a Compound Scout look, then open **Account** to see favorites. They load again after you sign in, including on another device. Guests can browse. **Privacy Policy** and **Terms of Use** are on the Account tab without signing in.

Accounts are not stored in AsyncStorage or SecureStore. Start `npm run server` before signing up. See [Deploy the account server](#deploy-the-account-server).

## Environment variables

Copy `.env.example` to `.env` or `.env.local`. Expo only inlines names that start with `EXPO_PUBLIC_`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG` | After Store launch | Amazon Associates tracking ID. Default placeholder: `yourtag-20`. Not used in the first-publish Store UI. |
| `EXPO_PUBLIC_API_URL` | For accounts | Base URL of the account server. Default in code: `http://localhost:8787`. Use `http://10.0.2.2:8787` on the Android emulator, a LAN URL on a physical device, and `https://…` in production. |
| `EXPO_PUBLIC_PRIVACY_POLICY_URL` | For store listings | Public Privacy Policy URL. Default: GitHub Pages `…/Compound-App/privacy.html`. |
| `EXPO_PUBLIC_TERMS_OF_USE_URL` | Optional | Public Terms of Use URL. Default: `…/Compound-App/terms.html`. |
| `EXPO_PUBLIC_PRIVACY_CONTACT_EMAIL` | Optional | Privacy inbox. Default: `rob@loudfh.com` (change to `privacy@loudfh.com` if you create that alias). |

Do **not** put a real production Associates ID you are not ready to publish, or any other secret, in the repo. The account server does not need an API key: sessions are random bearer tokens, and passwords are bcrypt-hashed in `ACCOUNTS_DATA_FILE`.

### Amazon Associates tag (post-launch)

The first-publish Store tab is Coming Soon. When you turn the catalog on (`STORE_CATALOG_ENABLED` in `src/constants/config.ts`):

1. Join [Amazon Associates](https://affiliate-program.amazon.com/).
2. Copy your tracking ID (often looks like `yourname-20`).
3. Set `EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG` and rebuild (`npx expo start -c` so Metro reloads env).
4. Confirm a product URL includes `?tag=your-real-id`.

## Deploy the account server

The API lives in `server/` and is the source of truth for accounts and favorites. `npm run server` listens on `PORT` (default **8787**) and writes `ACCOUNTS_DATA_FILE` (default `server/data/accounts.json`). That file holds bcrypt password hashes, session token hashes, profiles, and favorites. It is gitignored. Do not commit it. The process logs method, path, and status only — never passwords or request bodies.

No production secret is required to boot. Optional env: `HOST` (default `0.0.0.0`), `BCRYPT_ROUNDS` (default `10`, integer 4–12).

### Local

```bash
npm install
npm run server
```

In another terminal, `npx expo start`. The app calls `EXPO_PUBLIC_API_URL`, or `http://localhost:8787` if that variable is unset. iOS Simulator and web can use localhost. Android emulator: `EXPO_PUBLIC_API_URL=http://10.0.2.2:8787`. A phone on the same Wi-Fi needs your machine’s LAN address (`http://192.168.x.x:8787`). Restart Expo with `npx expo start -c` after changing `EXPO_PUBLIC_` variables.

`GET /health` returns `{ "ok": true }`.

### A host you control

1. Install Node.js 22.13+ on the machine (or a container with the repo and `npm install`).
2. Put the data file on a persistent disk, for example `/var/lib/homestead-compound/accounts.json`.
3. Run the process and keep it up (systemd, Fly, Render, Railway, or similar):

   ```bash
   PORT=8787 \
   HOST=0.0.0.0 \
   ACCOUNTS_DATA_FILE=/var/lib/homestead-compound/accounts.json \
   npm run server
   ```

4. Put TLS in front of it. Example Caddy snippet:

   ```caddy
   accounts.example.com {
     reverse_proxy localhost:8787
   }
   ```

5. Set `EXPO_PUBLIC_API_URL=https://accounts.example.com` for the app build (EAS secret or `.env` before `npx expo start -c`). Do not ship a build that points at `http://` except for local development. iOS App Transport Security and Android cleartext rules block non-local HTTP in release builds.

Delete account removes that user, their sessions, and their favorites from the data file. Sign-out drops the token on the device and revokes that session on the server.

## Feeds and data

- **News is Family Compound RSS.** The article list always uses the family-compounds sources below. Homesteading publishers stay in `src/data/rss-sources.ts` for reference and are not requested by News.
- **Family Compounds RSS (when reachable):** a broader compound-living mix — [Four Generations One Roof](https://www.fourgenerationsoneroof.com/category/multigenerational-living/feed/) and [Feels Like Homestead](https://feelslikehomestead.com/category/multigenerational-living/feed/) (compound / shared-land diaries), [Barndos](https://barndos.com/feed) (barndominium plans and lenders), plus [BuildMax](https://buildmax.com/feed), [Locke Buildings](https://lockebuildings.com/feed/), [Homestead.org](https://www.homestead.org/feed/), [Foundation for Intentional Community](https://www.ic.org/feed/), and [Cohousing Alliance](https://cohousingalliance.org/feed/) after a **compound-living topic filter** (family compounds, multi-household living, financing, compound design, barndominiums, micro farms on shared land — not generic homesteading or climate-activism noise). Multi-gen-only “under one roof” blogs are de-emphasized.
- If a host is down, blocks bots, or CORS blocks web, the app **merges in Family Compound seed briefings** so the news list still has articles. Homesteading seed stories are not shown in News.
- YouTube IDs are curated in `src/data/videos.ts` (homesteading: permaculture and compost; family compounds: family-compound living, barndominiums, financing, compound site design, and micro farms — not only TEDx multi-gen / ADU clips). The **Videos** tab lists featured clips for the active category. Playback uses an in-app WebView embed (`react-native-webview`). Videos are third-party YouTube content — not owned or created by LFH Inc or the app.
- Store catalog JSON and affiliate URL builder remain in `src/data/products.json` and `src/lib/affiliate.ts` for a later release. The Store tab currently shows Coming Soon.
- **Compound Scout** scenarios are bundled in `src/data/compound-scout.json` and shown on the Learn tab. Nothing is fetched for the game. Answers are stored on the device (`hcn.compoundScout.answers`).

## Extend Compound Scout

The Learn tab reads `src/data/compound-scout.json` at build time. The shipped cards follow the Family Compound checklist (acreage band, written dwelling count, TDEC septic, envelopes, pavilion, fire spine, ranch, LLC, FSA, phasing, and the rest). New cards should stay that specific. To add a look:

1. Open the stage that fits (`land-access`, `water-septic`, `zoning-rules`, `layout-buildings`, `utilities-resilience`, `financing-ownership`), or append a new stage after those six.
2. Add a scenario object with a unique `id`, a `title`, a `prompt`, `choices` (2–4 items, exactly one `"correct": true`), and `lookFor` (the teach-back the player reads after answering).
3. Run `npm test` and `npm run typecheck`. The tests check the content shape and the scoring helpers in `src/lib/compound-scout.ts`.

Keep the six original stages first, in that order. A new stage is picked up by the trail automatically; add its id to `REQUIRED_STAGE_IDS` in `src/lib/compound-scout.ts` only if it should become part of the required curriculum. The `disclaimer` field is the footer on the Learn tab — leave it educational, and not legal or financial advice.

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

Set production env vars in [EAS secrets](https://docs.expo.dev/build-reference/variables/) (`eas secret:create`) rather than committing `.env`. Set `EXPO_PUBLIC_API_URL` to the HTTPS account server from [Deploy the account server](#deploy-the-account-server).

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
- [ ] Production account server on HTTPS, with `ACCOUNTS_DATA_FILE` on a persistent disk and `EXPO_PUBLIC_API_URL` set in EAS secrets. Add rate limits or a captcha if the signup endpoint is abused.
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

**Collected when someone creates an account:** email, password (bcrypt hash on the account server only), display name, preferred category, and favorites (news, videos, and Compound Scout looks). The phone stores a sign-in token, not the password or the account database.

**Not collected in this MVP:** precise location, contacts, photos, payment cards, government IDs, ads SDK, analytics SDK. We do not sell personal data. YouTube/Google and RSS publishers apply when the user opens those features. Amazon Associates links are not shown in the first-publish Store UI (Coming Soon).

**Deletion:** Account tab → Delete account. That removes the server account, password hash, sessions, and favorites, and clears the token on this device.

Have an attorney review `docs/privacy-policy.md` before you treat it as final for a commercial launch.

**Legal display name:** Privacy and Terms use **LFH Inc** as the operator. Identifier, email, and domain strings use **loudfh** (`com.loudfh.homesteadcompound`, `rob@loudfh.com`, `loudfh.com`).

## Project layout

```
app/                 Expo Router screens (tabs: News, Videos, Learn, Store, Account; legal screens)
src/components/      UI, including Compound Scout
src/content/         In-app Privacy Policy and Terms
src/context/         Auth, preferences, theme
src/data/            Seed news, videos, products, RSS source list, Compound Scout JSON
src/lib/             RSS, Family Compound news assembly, affiliate URLs, scout scoring, account API client
server/              Account API (signup, sign-in, bcrypt passwords, favorites)
src/theme/           Homestead palette
src/types/           NewsItem | VideoItem | Product | UserProfile
docs/                Hostable Privacy Policy and Terms (GitHub Pages)
```

## License

Application code is MIT. Third-party articles, videos, and Amazon listings remain the property of their owners; this app only links to them.
