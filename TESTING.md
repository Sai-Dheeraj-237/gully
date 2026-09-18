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
