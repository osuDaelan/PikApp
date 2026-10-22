# Google sign-in (deferred)

Status: October 22, 2026. The user asked to hide Google sign-in entirely and focus on browser autosave and returning visitors. The auth code is retained for later, but the account control/session hook is not mounted, Firebase is not initialized, and the auth SDK is excluded from the production app bundle. Firebase setup and cloud sync are deferred; there is no account or configuration requirement for using the current app.

The instructions below are a future reactivation reference, not a pending request for the user to create a Firebase project. Before exposing sign-in again, restore its UI mount deliberately and complete the configuration and verification steps. There is no simulated signed-in account.

## Current browser saving

Calculator values, daily averages, decor checklist selections and saved map pins/preferences persist locally and restore when returning to the same site in the same browser/profile on the same device. No account is needed. Calculator/checklist saves have success/error feedback and retry; map saving retains its separate error/recovery/export flow. Closing and reopening a normal tab does not intentionally clear progress. Localhost and GitHub Pages are separate storage areas; other browsers/devices do not share saves. Clearing site data or private-browsing limits can discard saves. See [browser autosave](../README.md#browser-autosave) and [the persistence guide](PROJECT_GUIDE.md#persistence-and-privacy-boundaries).

## Retained authentication scope

If re-enabled, Firebase would manage the authentication session and account identity. The retained implementation leaves calculator values, decor collection, map pins and map preferences in their existing browser-local saves. Its sign-in, sign-out and account switching do not clear, upload, import or replace that progress. Another account using the same browser would see that browser's local progress; another device would have its own local progress.

This is an authentication foundation, not cloud progress sync. There is no Firestore database integration or account-specific progress migration in this phase. Session restoration is separate from progress restoration. Firebase's [persistence documentation](https://firebase.google.com/docs/auth/web/auth-state-persistence) describes how an auth session can survive reopening when browser storage permits it; private browsing or blocked storage can change that behavior.

## Future Firebase console setup

1. Open the [Firebase console](https://console.firebase.google.com/). Select an existing Firebase project, or create one for PikApp. A separate development project keeps test accounts separate from production. Repeat the relevant setup below for each project. Google Analytics is optional for this feature.
2. In the project overview, choose **Web** (`</>`) or **Add app → Web**. Register a Web app with a recognizable nickname, such as `PikApp web`. Keep the existing GitHub Pages hosting; Firebase Hosting is not needed for this implementation.
3. Open **Project settings → General → Your apps** and select that Web app. Its **SDK setup and configuration → Config** view provides the client config values listed below. See Firebase's [Web setup guide](https://firebase.google.com/docs/web/setup).
4. Open **Authentication**, choose **Get started** if needed, then **Sign-in method → Add new provider → Google**. Enable Google, set the public-facing app name and choose the project support email, then save. Verify that Google is enabled. See [Google sign-in setup](https://firebase.google.com/docs/auth/web/google-signin) and the [Firebase console walkthrough](https://firebase.google.com/codelabs/firebase-terraform#5).
5. Open **Authentication → Settings → Authorized domains**. Add the appropriate hostnames explicitly:

   | Environment | Authorized hostname |
   | --- | --- |
   | Production GitHub Pages | `osudaelan.github.io` |
   | Local development | `localhost` |

   Enter hostnames without `https://`, ports, `/PikApp/` or page hashes. With separate projects, authorize the production hostname in the production project and `localhost` in the development project. If intentionally using one project for both environments, add both hostnames there. Projects created after April 28, 2025 do not automatically authorize `localhost`; check it rather than assuming it exists. See Firebase's [authorized-domain guidance](https://firebase.google.com/docs/auth/faq-and-troubleshooting#limit_your_authorized_authentication_domains).

Use the Web app's supplied `authDomain`, normally `PROJECT_ID.firebaseapp.com`. The GitHub Pages hostname belongs in Authorized domains; it does not replace the Firebase auth handler domain.

## Future local configuration

Use Node.js 24.12 or newer. The pinned Firebase 13.1.0 SDK's app/auth packages require that runtime; the GitHub Pages workflow uses Node 24 as well.

Create `.env.local` in the repository root by copying [`.env.example`](../.env.example), then fill in these four values from the chosen development Web app:

| Vite environment variable | Firebase config property |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

Use values from the same Web app/project. Restart `npm.cmd run dev` after changing environment files; an already running Vite server does not pick up new configuration automatically. Open `http://localhost:5173/` for the authorized local hostname.

`.env`, `.env.local` and other `.env.*` files are ignored; only the blank `.env.example` template is committed. These are client configuration fields and become visible in the built website. Firebase-specific Web API keys identify the project; they do not authorize access to private data. Use Firebase's supplied key and its applicable API restrictions. Never place service-account JSON, private keys, Admin SDK credentials or OAuth client secrets in any `VITE_*` variable. See Firebase's [API key explanation](https://firebase.google.com/docs/projects/api-keys).

## Future GitHub Pages configuration

In the [PikApp repository](https://github.com/osuDaelan/PikApp), open **Settings → Secrets and variables → Actions → Variables**. Add four **repository variables** with the same names as the table above, using the production Web app's values. The build step in [the Pages workflow](../.github/workflows/deploy.yml) supplies them to Vite.

Environment values are compiled into the JavaScript build. After adding or changing the variables, run the Pages deployment workflow again or publish a new commit; existing deployed files do not change by themselves. Local `.env.local` is not uploaded to GitHub or used by GitHub Actions.

The retained adapter uses a Google **popup** flow when enabled by a sign-in button. This keeps the app on its existing GitHub Pages URL and avoids relying on redirect state across separate hosting/auth domains. Firebase documents popup sign-in as an option for [browsers that block cross-origin redirect storage](https://firebase.google.com/docs/auth/web/redirect-best-practices#option_2_switch_to_signinwithpopup). Do not substitute `/PikApp/__/auth/handler` as a GitHub Pages route. Popup behavior still needs testing on actual mobile Safari and Chrome; this note does not claim those checks have passed.

## Reactivation verification (deferred)

When sign-in returns to scope, record results for localhost and the deployed `/PikApp/` URL separately. Use test accounts and retain existing user progress. None of these steps is needed to use current browser autosave.

- [ ] Once the controls are deliberately re-enabled, recheck the setup/unavailable explanation and disabled Google button with all configuration absent. The retained session-controller test confirms no client initialization for that state.
- [ ] With only part of the configuration present, explain that setup is incomplete and keep guest use working.
- [ ] With the proper provider and authorized hostname configured, clicking sign-in opens Google and the account control reflects the successfully authenticated user.
- [ ] Close/cancel the popup and block popups once; show useful feedback, permit retry and keep the app usable without signing in.
- [ ] Reload/reopen after sign-in and verify session restoration; test the storage-unavailable case and any fallback message.
- [ ] Sign out, sign in again and switch between two test accounts. Calculator values, collection choices and pins stay unchanged throughout. Do not expect account-specific progress yet.
- [ ] Verify on physical mobile Safari and Chrome, including popup return/cancellation. These checks remain pending until a configured live project is available.
- [ ] After reactivation, confirm that the production build still uses `/PikApp/` asset paths and that no development calculator backup endpoint is bundled.

For `auth/unauthorized-domain`, check the hostname in the same Firebase project identified by the deployed config. For a disabled provider, enable Google in that project. For configuration errors after editing environment variables, restart Vite locally or rebuild/redeploy Pages. Diagnose a blocked popup through the browser's popup controls and retry from the sign-in button.

Historical prototype verification on October 22, before sign-in was hidden: 66 Node tests passed, including controlled auth lifecycle/error/race cases and incomplete-config guards. That production build passed with a separate roughly 156 kB auth SDK chunk (32 kB gzip); the current unmounted feature is excluded from the production app bundle. A prototype preview confirmed the unavailable/guest dialog, keyboard Escape returning focus to its trigger, and guest calculator edits surviving dialog use and reload. Its narrow viewport check fit the dialog without horizontal overflow. Those checks used no Firebase project, real Google account or simulated logged-in browser session; real OAuth and physical-phone checks remain deferred.

## Separate cloud-sync phase

Before progress can follow a Google account across devices, implement a versioned progress schema, a database, per-user authorization rules, account-specific storage selection, an explicit guest-import/merge flow, conflict recovery and saving/offline/error feedback. Define deletion and recovery behavior too. Test those rules and migration paths before uploading real progress. This phase makes no claim that gameplay data is already saved to or protected in a cloud database. Track that work in [TODO section 5](../TODO.md#5-save-and-synchronize-progress).

Dependency maintenance: the Firebase 13.1.0 umbrella package also installs unused Firestore/Node dependencies. The production npm audit reports four inherited high findings through `@grpc/grpc-js` 1.9.16; its certificate-validation advisory is fixed in 1.13.6 and newer. The current browser adapter imports only `firebase/app` and `firebase/auth`, and its built chunk contains no Firestore/gRPC code path. Recheck the dependency chain before adding database/Node functionality; do not apply the audit tool's forced Firebase 9 downgrade as a sign-in fix. See [the gRPC advisory](https://github.com/advisories/GHSA-m9gg-hp2v-232j).
