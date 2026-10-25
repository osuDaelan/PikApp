# PikApp feedback

Last reviewed: October 25, 2026. The user wants **one in-app feedback form**, with no destination selector, GitHub links or public-report route in the app. The form uses a normal HTML POST to an owner-controlled Formspree endpoint. GitHub issues remain available directly on the repository, outside this UI. Google sign-in remains hidden; visitors need no PikApp or Google account.

**Provider configured October 25.** Created the owner's **PikApp Feedback** form, verified its email action exists, left Formshield enabled, enabled reCAPTCHA and saved the project domain restriction `osudaelan.github.io`. The Pages workflow now uses the public endpoint `https://formspree.io/f/xqppeeel`, with an optional repository-variable override. No receiving email or credentials are committed. Actual hosted submission and email receipt still need verification; configured settings alone do not prove delivery.

Local development remains disabled without `.env.local` configuration. With an empty or invalid built `VITE_FEEDBACK_ENDPOINT`, sending is disabled and the form says **Feedback isn’t available yet. Please check back soon.** For Pages, a blank repository variable uses the configured default; set the variable to `disabled` to explicitly disable the production form and rebuild.

## Visitor flow

1. Open **Feedback** in the header, beside the browser-save control. The button is compact on narrow screens.
2. Choose a feedback type and app section and enter a title and details. When the inbox is configured, select **Review feedback**.
3. Review the text, then explicitly choose **Continue to send ↗**. The browser POSTs the reviewed fields to Formspree in a new tab. Finish any hosted CAPTCHA or confirmation step there and read that page's result. Provider-side validation or service errors are shown by Formspree.

PikApp reports a handoff request, not confirmed delivery. The native POST is not an AJAX request, and the app cannot inspect the cross-origin provider result, confirm an inbox email or know whether the hosted step was completed. Formspree documents [plain HTML form integration](https://formspree.io/html/).

## Implementation ownership and configuration

Paths are relative to the project root.

| File | Role |
| --- | --- |
| `src/features/feedback/FeedbackButton.jsx` | Single native dialog/form, fields/review and configured private POST; no destination selector or GitHub links |
| `src/features/feedback/feedback.css` | Header button, dialog, review, error and responsive presentation |
| `src/features/feedback/feedback.js` / `normalizeFeedback`, `getPrivateFeedbackEndpoint`, `buildPrivateFeedbackFields`, `createFeedbackGuard` | Allowed fields, endpoint validation, POST field allowlist and local handoff limits; older GitHub URL helper retained only for compatibility/history |
| `src/shared/components/AppHeader.jsx` | Mounts the feedback control next to browser-save status; no feedback state belongs in calculator, checklist or map stores |
| `src/shared/components/app-header.css` | Groups header controls without overlapping the logo or desktop map navigation; places controls below the clock on smaller screens |
| `tests/feedback.test.js` | Pure-helper validation, endpoint/encoded URL and local-limit regression checks |
| `.env.example`, `.github/workflows/deploy.yml` | Document local public endpoint configuration and pass the repository variable into the Pages build |
| `index.html` | Origin-only cross-origin referrer policy for private provider domain checks, excluding map URLs and query strings |

Private handoff accepts only the configured `https://formspree.io/f/{owned-form-id}` endpoint. The form uses `method="POST"` and `target="_blank"`, sending `title`, `message`, `type`, `section` and an empty Formspree `_gotcha` honeypot field. There is no AJAX client, added dependency, embedded secret or PikApp backend. The Formspree form ID is a public client identifier, not a secret or proof of access control. Never put account credentials, service keys or a personal access token into a `VITE_*` variable.

The endpoint is not taken from visitor input or the current page URL. No GitHub API, access token or GitHub authentication client is involved in sending this form.

`FEEDBACK_TYPES` allows Bug report, Suggestion and Question. `FEEDBACK_SECTIONS` allows General, Calculator, Decor checklist, Decor map and Mushroom rewards. Trimmed titles must contain 8–100 characters and details 20–1,000 characters; both the form and helper enforce these bounds. The helper rejects unexpected input fields as well as unsupported type/section values.

## Owner setup before enabling private feedback

1. Create or use the owner's [Formspree account](https://formspree.io/register) and create a new form. Use its Integration endpoint, not an email-address action URL. [Formspree's setup guide](https://formspree.io/html/) describes creating the form and copying its endpoint.
2. Select the receiving inbox and complete the account/email verification requested by Formspree. Confirm its email action points to that verified address; see [receiving-email settings](https://help.formspree.io/articles/form-and-project-settings/changing-a-form-email-address/).
3. Keep provider-side spam protection and hosted CAPTCHA enabled in the actual form settings. Review [reCAPTCHA settings](https://help.formspree.io/articles/form-and-project-settings/recaptcha-settings) rather than assuming a newly created form has the desired configuration. The hosted CAPTCHA is separate from Google account sign-in; visitors do not need Google login for PikApp.
4. Set the project's **Restrict to Domain** to `osudaelan.github.io`, without a scheme or `/PikApp/` path. Check the provider's [domain-restriction instructions](https://help.formspree.io/articles/form-and-project-settings/restrict-to-domain/). This uses the browser's origin/referrer and filters unauthorized origins into spam; it is not visitor authentication. A localhost test will not match that production domain, so use a deliberately configured test form for local delivery tests.
5. The Pages workflow contains the owned public endpoint as its default. Optionally override it using the repository **Actions variable** `VITE_FEEDBACK_ENDPOINT` under GitHub Settings → Secrets and variables → Actions → Variables. Set `disabled` to turn off sending; a blank value restores the workflow default. Rebuild/redeploy after changing it; an already published static bundle does not read new repository variables at runtime.
6. For localhost, put the equivalent value in the Git-ignored `.env.local` file and restart Vite:

   ```dotenv
   VITE_FEEDBACK_ENDPOINT=https://formspree.io/f/YOUR_OWNED_FORM_ID
   ```

   This is a placeholder, not a connected form. Leave the value blank to keep private handoff disabled. Do not commit a receiving email, account credentials or secrets.
7. Submit a clearly labeled test through the actual published site, finish the hosted step, and verify the report in the intended inbox and Formspree dashboard/spam folder. Check provider rejection/cancel behavior too. Only after this can private delivery be recorded as verified.

The domain check needs an origin referrer. Keep the handoff compatible with `strict-origin-when-cross-origin` and `noopener`; do not add `noreferrer`, `no-referrer` or a `same-origin` referrer policy to that handoff, which would make Formspree treat it as spam. Cross-origin referrers should contain only the site origin, not the map URL or query. Some privacy browsers may suppress the header; include this in real inbox testing.

As checked October 22, Formspree's [free plan](https://formspree.io/plans) allows **50 submissions per month** with a 30-day archive. This is a service/account quota, separate from the per-browser limits below. [Over-limit submissions](https://help.formspree.io/articles/form-and-project-settings/over-limit-submissions) can be retained by Formspree without notification email or plugin processing until the owner reprocesses them with available quota. Monitor the provider dashboard and quota; a hosted success page is not proof that an email reached the inbox.

## Privacy boundaries

Only the selected type/section and entered title/details are used to prepare the report. PikApp does not automatically attach calculator stats, checklist selections, map pins or notes, precise coordinates, the current URL, browser user agent or other device details. A native Formspree request still exposes normal network/browser information and the site origin to that provider; its CAPTCHA, processing, retention and email delivery follow its own service behavior. Private means the report is not posted to the public GitHub tracker, not that it bypasses a third-party processor.

The app does not publish this feedback as a GitHub issue. Anyone opening an issue directly on the public repository is using a separate public workflow; keep credentials, progress files and private pin locations out of those issues.

Draft text is kept in the form's memory rather than browser progress storage. Local anti-spam storage contains fingerprint/timestamp metadata under `pb_feedback_v1`, not the title or details. The helper uses a memory fallback when browser storage is unavailable. This metadata is not app progress and is excluded from full-progress export/import and recovery.

## Best-effort spam controls

| Control | Behavior |
| --- | --- |
| Minimum review time | Wait at least three seconds before reviewing a newly opened form |
| Honeypot | Reject a filled hidden bot-trap field |
| Validation | Allow only known type/section values, an 8–100-character title and 20–1,000-character details |
| Short cooldown | At least 60 seconds between feedback handoffs |
| Hourly limit | At most three handoffs within an hour |
| Duplicate limit | Prevent the same normalized report from being handed off again within 24 hours |

The local limits count the explicit form handoff, even if the provider step is canceled, rejected or never completed. They cannot count confirmed inbox deliveries. Editing the report may produce a different fingerprint. Blank/unconfigured sending must not send a request or claim successful delivery. Existing limit metadata remains compatible with earlier versions; there is no public route in the current UI.

These are browser-side friction, not server-side enforcement. Clearing site data, using a different browser/device, modifying the client or calling the public endpoint directly can bypass them. Memory fallback does not survive a page reload. Real spam filtering/CAPTCHA is performed by the configured Formspree service; its settings must be enabled and checked by the owner. No service-side spam protection or inbox delivery is verified while the endpoint is unconnected.

The repository's separate public issue tracker can still use [GitHub's moderation tools](https://docs.github.com/en/communities/moderating-comments-and-conversations) or [temporary interaction limits](https://docs.github.com/en/communities/moderating-comments-and-conversations/limiting-interactions-in-your-repository) if needed. The in-app feature does not activate or change repository restrictions.

## Retained compatibility and history

Earlier versions offered GitHub-only feedback and then a private/public destination selector. Both UI approaches were superseded by the user's single-form decision. `buildFeedbackIssueUrl` and its tests remain for compatibility/history, using the fixed repository target, encoded title/body and a 7,500-character URL cap; nothing in the current feedback UI calls it. The limit helper retains legacy GitHub fingerprints alongside the private namespace. These retained helpers are not a second sending option.

## Verification and remaining work

The full suite passes **114 Node tests**, including 16 feedback tests, and the production `/PikApp/` build passes. Feedback checks cover allowed endpoints, the private POST field allowlist, bounded Unicode text without GitHub URL restrictions, separate private/public duplicate fingerprints with legacy GitHub compatibility, known fields/text boundaries, honeypot rejection, fixed/encoded GitHub URLs, URL length, cooldown/hour/day boundaries, persistent/memory fallback, metadata privacy and bounded corrupt/future/oversized-history recovery.

Historical October 22 public-route checks confirmed the three-second review delay, short-message rejection, prepared text/focus, GitHub sign-in handoff, cooldown after reload and Escape/focus return. Its 390px dialog and 1100px desktop-map header fitted. Those results describe the retired public UI.

Before selector removal, a configured preview checked the private fields and native POST/new-tab/`noopener` attributes with a clean console, without submitting to Formspree. After simplification, all 112 tests and the production build still passed. An isolated browser confirmed the **Feedback** dialog contains only type, section, title and details, has no destination selector or GitHub links, keeps sending disabled when unconfigured, and has a clean console. Screenshot: `outputs/pikapp-feedback-single-form.png`. No new submission or delivery verification was performed.

No public test issue was created, no GitHub account was signed in, and no user progress or repository moderation setting was changed during those historical checks. The October 25 setup supersedes the unconnected-provider status: the owner form, email action, spam filter, CAPTCHA and production domain restriction are configured. All 163 tests and a production `/PikApp/` build with the real endpoint pass. Hosted CAPTCHA/error/cancel behavior, dashboard receipt, actual email delivery and physical-phone layout/touch remain to be verified. Local browser limits can be bypassed and are not a substitute for the provider settings.
