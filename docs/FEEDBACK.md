# PikApp feedback

Last reviewed: October 22, 2026. The user changed the preferred route to **private feedback**, with public GitHub issues as an optional alternative. The private route uses a normal HTML POST to an owner-controlled Formspree form. Google sign-in remains hidden; visitors need no PikApp or Google account.

**Setup is pending.** No owner-provided Formspree endpoint/account or verified receiving inbox has been connected. With an empty or invalid `VITE_FEEDBACK_ENDPOINT`, the private handoff is visibly unavailable; optional public GitHub feedback remains usable. A prepared UI or passing build does not establish private delivery.

## Visitor flow

1. Open **Feedback** in the header, beside the browser-save control. The button is compact on narrow screens.
2. Choose a feedback type and app section, enter a title and details, then select **Review feedback**.
3. When private feedback is configured, explicitly continue with the private route. The browser POSTs the reviewed fields to Formspree in a new tab. Finish any hosted CAPTCHA or confirmation step there and read that page's result. Provider-side validation or service errors are shown by Formspree.
4. Alternatively, explicitly choose **Continue on GitHub** after its public warning. This opens a prefilled issue draft at [PikApp's public repository](https://github.com/osuDaelan/PikApp/issues/new). A GitHub account and final submission on GitHub are required; canceling the draft creates no issue.

PikApp reports a handoff request, not confirmed delivery. The native POST is not an AJAX request, and the app cannot inspect the cross-origin provider result, confirm an inbox email or know whether the hosted step was completed. Likewise, it cannot observe whether a GitHub draft became an issue. Formspree documents [plain HTML form integration](https://formspree.io/html/); GitHub documents [prefilled issue URLs](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue#creating-an-issue-from-a-url-query).

## Implementation ownership and configuration

Paths are relative to the project root.

| File | Role |
| --- | --- |
| `src/features/feedback/FeedbackButton.jsx` | Native dialog, fields/review, configured private POST and optional explicit public GitHub continuation |
| `src/features/feedback/feedback.css` | Header button, dialog, review, error and responsive presentation |
| `src/features/feedback/feedback.js` / `normalizeFeedback`, `getPrivateFeedbackEndpoint`, `buildPrivateFeedbackFields`, `buildFeedbackIssueUrl`, `createFeedbackGuard` | Allowed fields, endpoint validation, POST field allowlist, fixed GitHub URL and local handoff limits |
| `src/shared/components/AppHeader.jsx` | Mounts the feedback control next to browser-save status; no feedback state belongs in calculator, checklist or map stores |
| `src/shared/components/app-header.css` | Groups header controls without overlapping the logo or desktop map navigation; places controls below the clock on smaller screens |
| `tests/feedback.test.js` | Pure-helper validation, endpoint/encoded URL and local-limit regression checks |
| `.env.example`, `.github/workflows/deploy.yml` | Document local public endpoint configuration and pass the repository variable into the Pages build |
| `index.html` | Origin-only cross-origin referrer policy for private provider domain checks, excluding map URLs and query strings |

Private handoff accepts only the configured `https://formspree.io/f/{owned-form-id}` endpoint. The form uses `method="POST"` and `target="_blank"`, sending `title`, `message`, `type`, `section` and an empty Formspree `_gotcha` honeypot field. There is no AJAX client, added dependency, embedded secret or PikApp backend. The Formspree form ID is a public client identifier, not a secret or proof of access control. Never put account credentials, service keys or a personal access token into a `VITE_*` variable.

The optional GitHub target remains fixed to `https://github.com/osuDaelan/PikApp/issues/new`, using only `title` and `body` query parameters. It does not use labels, assignees, privileged issue types, GitHub API calls, OAuth scopes or access tokens. Neither endpoint is taken from visitor input or the current page URL.

`FEEDBACK_TYPES` allows Bug report, Suggestion and Question. `FEEDBACK_SECTIONS` allows General, Overview, Decor checklist and Decor map. Trimmed titles must contain 8–100 characters and details 20–1,000 characters; both the form and helper enforce these bounds. The helper rejects unexpected input fields as well as unsupported type/section values.

## Owner setup before enabling private feedback

1. Create or use the owner's [Formspree account](https://formspree.io/register) and create a new form. Use its Integration endpoint, not an email-address action URL. [Formspree's setup guide](https://formspree.io/html/) describes creating the form and copying its endpoint.
2. Select the receiving inbox and complete the account/email verification requested by Formspree. Confirm its email action points to that verified address; see [receiving-email settings](https://help.formspree.io/articles/form-and-project-settings/changing-a-form-email-address/).
3. Keep provider-side spam protection and hosted CAPTCHA enabled in the actual form settings. Review [reCAPTCHA settings](https://help.formspree.io/articles/form-and-project-settings/recaptcha-settings) rather than assuming a newly created form has the desired configuration. The hosted CAPTCHA is separate from Google account sign-in; visitors do not need Google login for PikApp.
4. Set the project's **Restrict to Domain** to `osudaelan.github.io`, without a scheme or `/PikApp/` path. Check the provider's [domain-restriction instructions](https://help.formspree.io/articles/form-and-project-settings/restrict-to-domain/). This uses the browser's origin/referrer and filters unauthorized origins into spam; it is not visitor authentication. A localhost test will not match that production domain, so use a deliberately configured test form for local delivery tests.
5. Add the repository **Actions variable** `VITE_FEEDBACK_ENDPOINT` with the owned endpoint under GitHub Settings → Secrets and variables → Actions → Variables. The Pages build consumes it. Rebuild/redeploy after changing it; an already published static bundle does not read new repository variables at runtime.
6. For localhost, put the equivalent value in the Git-ignored `.env.local` file and restart Vite:

   ```dotenv
   VITE_FEEDBACK_ENDPOINT=https://formspree.io/f/YOUR_OWNED_FORM_ID
   ```

   This is a placeholder, not a connected form. Leave the value blank to keep private handoff disabled. Do not commit a receiving email, account credentials or secrets.
7. Submit a clearly labeled test through the actual published site, finish the hosted step, and verify the report in the intended inbox and Formspree dashboard/spam folder. Check provider rejection/cancel behavior too. Only after this can private delivery be recorded as verified.

The domain check needs an origin referrer. Keep the private handoff compatible with `strict-origin-when-cross-origin` and `noopener`; do not add `noreferrer`, `no-referrer` or a `same-origin` referrer policy to that handoff, which would make Formspree treat it as spam. Cross-origin referrers should contain only the site origin, not the map URL or query. Some privacy browsers may suppress the header; include this in real inbox testing. The GitHub link can retain `noreferrer`.

As checked October 22, Formspree's [free plan](https://formspree.io/plans) allows **50 submissions per month** with a 30-day archive. This is a service/account quota, separate from the per-browser limits below. [Over-limit submissions](https://help.formspree.io/articles/form-and-project-settings/over-limit-submissions) can be retained by Formspree without notification email or plugin processing until the owner reprocesses them with available quota. Monitor the provider dashboard and quota; a hosted success page is not proof that an email reached the inbox.

## Privacy boundaries

Only the selected type/section and entered title/details are used to prepare the report. PikApp does not automatically attach calculator stats, checklist selections, map pins or notes, precise coordinates, the current URL, browser user agent or other device details. A native Formspree request still exposes normal network/browser information and the site origin to that provider; its CAPTCHA, processing, retention and email delivery follow its own service behavior. Private means the report is not posted to the public GitHub tracker, not that it bypasses a third-party processor.

Choosing **Continue on GitHub** sends the encoded report text in a URL to GitHub, where it can appear in browser history. Submitting the draft publishes it in the public issue tracker. Visitors should remove private information before continuing or submitting. Progress export files, credentials and private pin locations should not be attached to public feedback.

Draft text is kept in the form's memory rather than browser progress storage. Local anti-spam storage contains fingerprint/timestamp metadata under `pb_feedback_v1`, not the title or details. The helper uses a memory fallback when browser storage is unavailable. This metadata is not app progress and is excluded from full-progress export/import and recovery.

## Best-effort spam controls

| Control | Behavior |
| --- | --- |
| Minimum review time | Wait at least three seconds before reviewing a newly opened form |
| Honeypot | Reject a filled hidden bot-trap field |
| Validation | Allow only known type/section values, an 8–100-character title and 20–1,000-character details |
| GitHub URL length | Reject an encoded issue URL longer than 7,500 characters; this URL cap is for the optional public route |
| Short cooldown | At least 60 seconds between feedback handoffs, shared across private/public routes |
| Hourly limit | At most three handoffs within an hour, shared across routes |
| Duplicate limit | Prevent the same normalized report from being handed off again through the same route within 24 hours |

The local limits count the explicit private handoff or public draft opening, even if the provider step is canceled, rejected or never completed. They cannot count confirmed inbox deliveries or issues. Duplicate fingerprints distinguish private and public routes so a failed private attempt does not block the same public report for 24 hours; the shared minute/hour limits still apply. Editing the report may produce a different fingerprint. Blank/unconfigured private handoff must not send a request or claim a successful delivery.

These are browser-side friction, not server-side enforcement. Clearing site data, using a different browser/device, modifying the client or calling the public endpoint directly can bypass them. Memory fallback does not survive a page reload. Real spam filtering/CAPTCHA is performed by the configured Formspree service; its settings must be enabled and checked by the owner. No private-route spam protection or inbox delivery is verified while the endpoint is unconnected. The optional GitHub route relies on GitHub accounts and repository moderation.

Maintainers can review [GitHub's moderation tools](https://docs.github.com/en/communities/moderating-comments-and-conversations). If abuse warrants it, repository admins can choose [temporary repository interaction limits](https://docs.github.com/en/communities/moderating-comments-and-conversations/limiting-interactions-in-your-repository), which may also prevent legitimate new visitors from opening feedback. This is an optional operational choice; the feedback feature does not activate or change GitHub restrictions.

## Verification and remaining work

The full suite passes **112 Node tests**, including 16 feedback tests, and the production `/PikApp/` build passes. Feedback checks cover allowed endpoints, the private POST field allowlist, bounded Unicode text without GitHub URL restrictions, separate private/public duplicate fingerprints with legacy GitHub compatibility, known fields/text boundaries, honeypot rejection, fixed/encoded GitHub URLs, URL length, cooldown/hour/day boundaries, persistent/memory fallback, metadata privacy and bounded corrupt/future/oversized-history recovery.

On October 22, that public-route preview confirmed the initial three-second disabled review button, short-message rejection, selected type/section, prepared text/focus, GitHub sign-in handoff, cooldown after reload and Escape/focus return. Its 390px dialog and 1100px desktop-map header did not overflow/overlap. Issues was enabled. Recheck the updated private/public UI; prior layout results do not cover the new controls.

The updated production-preview checks confirmed private feedback is selected by default and disabled with blank configuration, switching to the public route still allows explicit review, and Escape/reopen returns to private mode. A separate configured preview checked the private review fields and native form's POST action, new-tab target and `noopener` relationship. The browser console was clean. That form was not submitted to Formspree; provider processing or inbox delivery was not tested.

No public test issue was created, no GitHub account was signed in, and no user progress or repository moderation setting was changed. The owner's Formspree endpoint, verified inbox, service-side spam/domain configuration, hosted CAPTCHA/error/cancel behavior and actual private delivery remain pending. Physical-phone layout/touch and authenticated final GitHub submission remain separate checks.
