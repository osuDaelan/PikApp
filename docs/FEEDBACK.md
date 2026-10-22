# PikApp feedback

Last reviewed: October 22, 2026. The user chose **GitHub issues — public feedback, requires GitHub account**. This feature prepares a report for the public `osuDaelan/PikApp` repository. It is independent of the hidden Google sign-in feature and does not require a PikApp account, Firebase configuration or a feedback backend.

## Visitor flow

1. Open **Feedback** in the header, beside the browser-save control. The button is compact on narrow screens.
2. Choose a feedback type and app section, enter a title and details, then select **Review feedback**. The dialog warns that submitted feedback is public and should not contain private information.
3. Review the prepared report, then choose **Continue on GitHub**. This opens a prefilled issue draft at [PikApp's GitHub repository](https://github.com/osuDaelan/PikApp/issues/new).
4. Sign in to GitHub if needed, review or edit the draft there, and submit it on GitHub. Closing the draft without submitting creates no issue.

PikApp does not automatically submit feedback, receive an issue number or know whether the visitor submitted the GitHub draft. The UI must describe a draft being opened rather than claim that a report was created. GitHub documents [prefilling issue titles and bodies with URL query parameters](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue#creating-an-issue-from-a-url-query); final submission remains a separate GitHub action.

## Implementation ownership and configuration

Paths are relative to the project root.

| File | Role |
| --- | --- |
| `src/features/feedback/FeedbackButton.jsx` | Native dialog lifecycle, selected type/section, title/details inputs, review and explicit continuation |
| `src/features/feedback/feedback.css` | Header button, dialog, review, error and responsive presentation |
| `src/features/feedback/feedback.js` / `normalizeFeedback`, `buildFeedbackIssueUrl`, `createFeedbackGuard` | Allowed values/text validation, URL construction, fingerprint metadata and local draft-opening limits |
| `src/shared/components/AppHeader.jsx` | Mounts the feedback control next to browser-save status; no feedback state belongs in calculator, checklist or map stores |
| `src/shared/components/app-header.css` | Groups header controls without overlapping the logo or desktop map navigation; places controls below the clock on smaller screens |
| `tests/feedback.test.js` | Pure-helper validation, encoded URL and local-limit regression checks |

The target is fixed to `https://github.com/osuDaelan/PikApp/issues/new`. The helper uses only `title` and `body` query parameters, with the report type and section represented in the report text. It does not use labels, assignees, issue types that require repository privileges, GitHub API calls, OAuth scopes or personal access tokens. There are no new environment variables or secrets to configure. Change the fixed target and its tests together if the repository moves; do not accept a destination URL from form input or the current page URL.

`FEEDBACK_TYPES` allows Bug report, Suggestion and Question. `FEEDBACK_SECTIONS` allows General, Overview, Decor checklist and Decor map. Trimmed titles must contain 8–100 characters and details 20–1,000 characters; both the form and helper enforce these bounds. The helper rejects unexpected input fields as well as unsupported type/section values.

## Privacy boundaries

Only the selected type/section and entered title/details are used to prepare the report. PikApp does not automatically attach calculator stats, checklist selections, map pins or notes, precise coordinates, the current URL, browser user agent or other device details. Normal browser navigation to GitHub still follows GitHub's own account and privacy behavior.

Choosing **Continue on GitHub** sends the encoded report text in a URL to GitHub, where it can appear in browser history. Submitting the draft publishes it in the public issue tracker. Visitors should remove private information before continuing or submitting. Progress export files, credentials and private pin locations should not be attached to public feedback.

Draft text is kept in the form's memory rather than browser progress storage. Local anti-spam storage contains fingerprint/timestamp metadata under `pb_feedback_v1`, not the title or details. The helper uses a memory fallback when browser storage is unavailable. This metadata is not app progress and is excluded from full-progress export/import and recovery.

## Best-effort spam controls

| Control | Behavior |
| --- | --- |
| Minimum review time | Wait at least three seconds before reviewing a newly opened form |
| Honeypot | Reject a filled hidden bot-trap field |
| Validation | Allow only known type/section values, an 8–100-character title and 20–1,000-character details; encode the issue URL rather than concatenating raw input |
| URL length | Reject an encoded issue URL longer than 7,500 characters; ask for a shorter report rather than truncate it silently |
| Short cooldown | At least 60 seconds between GitHub draft opens |
| Hourly limit | At most three draft opens within an hour |
| Duplicate limit | Prevent the same normalized report from opening again within 24 hours |

The rate and duplicate limits count the explicit opening of a GitHub draft, even if the visitor later cancels it on GitHub. Reviewing or canceling inside PikApp does not prove that an issue exists. Draft text changes can result in a different fingerprint; the short and hourly limits still apply.

These are browser-side friction, not server-side enforcement. Clearing site data, using a different browser/device, modifying the client or going directly to the GitHub issue tracker can bypass them. Memory fallback does not survive a page reload. No CAPTCHA, IP restriction, private feedback service or global submission quota is implemented. GitHub account requirements and repository moderation provide the actual external enforcement boundary.

Maintainers can review [GitHub's moderation tools](https://docs.github.com/en/communities/moderating-comments-and-conversations). If abuse warrants it, repository admins can choose [temporary repository interaction limits](https://docs.github.com/en/communities/moderating-comments-and-conversations/limiting-interactions-in-your-repository), which may also prevent legitimate new visitors from opening feedback. This is an optional operational choice; the feedback feature does not activate or change GitHub restrictions.

## Verification and remaining work

The full suite passes **97 Node tests**, including 12 feedback tests. These cover known fields/text boundaries, honeypot rejection, fixed and encoded title/body-only URLs, URL length, exact cooldown/hour/day boundaries, duplicate checks, fresh guards with persisted storage, memory/quota fallback, metadata-only storage and bounded recovery from corrupt/future or 5 MB oversized history. The production build passes with the `/PikApp/` base and no new dependency or service configuration.

On October 22, a separate production preview confirmed the initial three-second disabled review button, rejection of a short message, selected type/section and exact prepared text, and review-heading focus. Continuing opened GitHub's sign-in page with the prepared issue URL preserved as its return target. PikApp showed a draft-opening notice rather than claiming submission; the cooldown survived reload. Escape closed the dialog and returned focus. At 390px the dialog fit without horizontal overflow; at the 1100px desktop-map breakpoint, the grouped actions, centered logo and right navigation did not overlap. The public repository's Issues feature was confirmed enabled.

No public test issue was created, no GitHub account was signed in, and no user progress or repository moderation setting was changed. Opening a draft cannot verify authenticated final submission, notification delivery or future moderation outcomes. Physical-phone layout/touch and an actual visitor's final submission remain separate checks.
