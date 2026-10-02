# Privacy Policy

**Family Compound & Homestead Living**  
Operated by LFH Inc  
Bundle ID: `com.loudfh.homesteadcompound`

**Effective date:** October 2, 2026

This policy describes how Family Compound & Homestead Living (“the app,” “we,” “us”) handles information when you use the iOS or Android app, or a web preview of the same codebase.

## Who we are

LFH Inc publishes Family Compound & Homestead Living, a news and video companion for homesteaders and family compounds.

Privacy requests: **rob@loudfh.com**

## What this app does

News articles come from Family Compound RSS feeds. Featured Videos switch between Homesteading and Family Compounds. The Store tab is Coming Soon; Amazon affiliate picks will be added after this first release. You may create an optional account to save a display name, a preferred category (used for Videos), and favorites.

You can use the feeds without an account.

## Information we collect

### If you browse as a guest

- The last Videos category you selected (Homesteading or Family Compounds), stored on the device so the Videos tab can reopen to that area. News does not switch categories.
- We do not ask for your name or email unless you create an account.

### If you create an account

- Email address
- Password (see “How accounts work” below)
- Display name you choose
- Preferred category: Homesteading, Family Compounds, or both
- Favorites you save while signed in: the title and link (or video id) of a news article, featured video, or Compound Scout look. These are stored with your account on the server

Do not put sensitive personal information in your display name.

### Information we do not collect

This version of the app does not collect:

- Precise location, contacts, photos, camera, microphone, or your address book
- Payment card numbers (this version has no in-app checkout; a later Store may open Amazon)
- Government ID numbers
- Advertising identifiers for our own ads (the app does not include an ads SDK)
- Analytics from a third-party analytics SDK (none is bundled in this app)

We do not sell your personal information.

## How accounts work

Creating an account sends your email, password, and display name to Supabase Auth, the account service for this app. Supabase stores your email, display name, and preferred category. It stores your password only as a hash. The password is not saved on your phone, and the app does not keep a copy of the account database on the device.

The app keeps a sign-in session (an access token and a refresh token) in the device’s secure storage, or in browser storage on a web preview, so you stay signed in after a restart. That session is not your password. Signing out or deleting the account removes it from this device.

Favorites are the news articles, videos, and Compound Scout looks you bookmark. They are stored in Supabase in a table that only your signed-in account can read or change. They load when you sign in again, including on another device or a fresh install.

## How we use information

We use account and preference data to:

- Sign you in and keep you signed in on this device
- Show your display name and email on the Account screen
- Remember your preferred category
- Save and show favorites when you are signed in

We use technical connections (not your account profile) to:

- Load public RSS feeds for the news cards
- Load YouTube thumbnails and play videos
- When the Store is available, open Amazon product pages if you choose a product link

## Third parties

When you use certain features, you leave our screens or load third-party content. Those services have their own policies. We do not control them.

**Amazon.** The Store is Coming Soon in this first release. When affiliate product links are added, they will open Amazon using a product ID and an Associates tracking tag. If you continue on Amazon, Amazon may collect information under [Amazon’s privacy policy](https://www.amazon.com/privacy). Affiliate clicks can earn LFH Inc a commission if you buy something. We do not receive your Amazon account details.

**YouTube / Google.** Video cards use YouTube video IDs. Playback uses an in-app player (a YouTube embed) and you can open the video on YouTube. Google’s policies apply, including [YouTube’s terms](https://www.youtube.com/t/terms) and [Google’s privacy policy](https://policies.google.com/privacy).

**News publishers.** Article cards open the publisher’s webpage in an in-app browser. RSS feeds for news are requested from public Family Compound publisher URLs (for example Four Generations One Roof, Barndos, and the Foundation for Intentional Community). Those sites may set their own cookies or logs when the page loads.

**Supabase.** Accounts and favorites are stored in a Supabase project operated for this app. [Supabase’s privacy policy](https://supabase.com/privacy) applies to that hosting.

**Apple, Google, and Expo.** App Store, Google Play, and the Expo build tools (EAS) are used to compile and distribute the app. They are not used in this version as an end-user analytics product inside the app. Their policies apply to your use of their stores and devices.

## Data retention

- Guest Videos category choice: on this device until you change it, clear app data, or uninstall.
- Account email, display name, preferred category, password hash, and favorites: in Supabase until you delete the account, or until we delete them after a request to **rob@loudfh.com**.
- Sign-in session: on this device until you sign out, delete the account, or uninstall. The password is not stored on the device.

## Your choices and account deletion

- You can browse without an account.
- You can edit your display name and preferred category while signed in.
- You can sign out at any time.
- **Delete account** is on the Account screen. It deletes the account, password hash, sessions, and favorites in Supabase, and clears the sign-in session on this device.
- You can also email that address to ask what data we have, to correct your display name, or to request deletion if you cannot use the in-app control.

## Children

Family Compound & Homestead Living is not directed at children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child under 13 created an account, contact us and we will delete it.

## Security

Passwords are hashed by Supabase Auth before they are stored. The app does not write the password to device storage. The sign-in session is kept in platform secure storage, or in browser storage on a web preview. Supabase is reached over HTTPS. RSS, YouTube, and future Store links also use HTTPS. No method of transmission or storage is perfectly secure.

## Changes

If we change this policy, we will update the effective date and the copy in the app. Material changes to how we handle account data will be described in the updated policy.

## Contact

LFH Inc  
Email: rob@loudfh.com  
App: Family Compound & Homestead Living (`com.loudfh.homesteadcompound`)

If this contact address changes, the Account screen and a later revision of this policy will show the address in use.
