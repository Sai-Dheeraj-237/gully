# Frontend verification

Verified against the public GitHub Pages deployment, not a local preview server:

https://sai-dheeraj-237.github.io/gully/

## Results

28 checks passed using an isolated headless Microsoft Edge browser context:

1. 18+ onboarding and initial feed.
2. Upvote/downvote toggling without double counting.
3. Saved posts and saved collection.
4. Daily poll voting.
5. Post creation and safe rendering of HTML-like input.
6. Browser persistence after reload.
7. Nested replies.
8. Search across content types.
9. Community membership.
10. Confession publishing.
11. Marketplace radius and price sorting.
12. Listing creation, image attachment, and own listings.
13. Seller enquiries and local messages.
14. Expired conversations removed after reload.
15. Squad requests and explicitly simulated host acceptance.
16. Squad creation with a future Hyderabad date.
17. City megathread contributions.
18. Reporting and blocking.
19. Notification preferences and unblocking.
20. Sign-in preview and invalid demo code handling.
21. Voice capture and IndexedDB playback after reload.
22. Nine main screens fit a 390px viewport without horizontal overflow.
23. Nine main screens fit a 768px viewport without horizontal overflow.
24. Nine main screens fit a 1440px viewport without horizontal overflow.
25. Mobile composer and keyboard dismissal.
26. No uncaught JavaScript errors during the main suite.
27. Automatic 30-second recording cutoff and microphone release.
28. Closing the composer stops active recording.

Desktop home and mobile home, marketplace, and composer screenshots were visually reviewed. GitHub Pages reported `built` and its public URL returned HTTP 200.

## Limits

Audio tests used a synthetic microphone. This is browser verification, not physical iOS/Android device certification. The Expo WebView shell is provided as source and has not been built or tested on a native device. AWS authentication, backend authorization, moderation, push notifications, secure cross-device chat expiry, real location distances, and multi-user interactions are not implemented by this frontend demo.

Main browser suite: `scripts/check-frontend.cjs`. Voice cutoff checks: `scripts/check-voice-limit.cjs`.

## Baithak feature verification — 18 September 2026

23 Baithak browser checks passed against the local source through request interception, with no local HTTP server. The existing 26-check main Gully suite also passed against the updated source. This regression run includes the existing voice confession recorder.

Baithak coverage includes approved-only discovery; 12-hour scheduling validation; duration/capacity bounds; IST conversion in a Chicago browser; HTML escaping; persistence and direct links; admin approval/rejection; approval reset after edits; overlapping host requests; saved plans and calendar export; admission and hand raising; muted speaker entry; host mute restrictions; six-speaker capacity; removal and full-room admission; local reports; confirmed room ending; late-start deadlines; automatic expiry; expired reviews; withdrawal; 360/390/768/1440px layouts; mobile navigation and browser Back; and uncaught browser errors.

Desktop discovery and mobile scheduling/room screenshots were visually inspected. The mobile room controls remain visible at the bottom of the screen.

Run `scripts/check-baithak.cjs` with Playwright in a prepared environment. By default it intercepts local `docs/` files without a server. Set `GULLY_PREVIEW_URL` to test a deployed copy. The suite freezes and advances the browser clock for timing tests and uses isolated browser storage. Results are recorded in `scripts/baithak-verification-results.json`.

No real multi-user audio, AWS authorization, server capacity enforcement, native mobile audio, or physical-device microphone behavior has been verified by these frontend tests.
