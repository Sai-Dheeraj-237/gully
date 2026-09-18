# Gully frontend

An 18+ Hyderabad community frontend. Responsive desktop and mobile layouts with a no-install browser preview.

Preview: https://sai-dheeraj-237.github.io/gully/

## Frontend features

- Home feed with trending/new sorting, neighbourhood filters, followed communities, and daily poll.
- Four community boards with join/leave controls and dedicated feeds.
- Anonymous handles and avatars; 18+ self-declaration onboarding.
- Text and image posts, up/down voting, bookmarks, sharing, nested replies, and deletion of own posts.
- Confessions by mood, optional 30-second voice recording, playback, and local audio persistence.
- Squad plans with future Hyderabad dates, 2–8 participants, join requests, and explicitly simulated host acceptance.
- Marketplace with 1–3 km sample radius, category and price filters, image uploads, listings, seller enquiries, and saved items.
- Pinned daily city thread, categories, community submissions, and voting.
- Anonymous demo messages with a two-hour expiry timer and expired-message removal.
- Search across conversations, squads, and marketplace listings.
- Reporting, blocking/unblocking, notification preferences, and local account settings.
- Email code, Google and Apple sign-in UI. Demo verification code: **123456**.
- Keyboard-accessible dialogs, focus trapping, semantic forms, responsive navigation, and reduced-motion support.

## What is real and what is simulated

The frontend interactions work. Records live in browser localStorage, with recorded audio in IndexedDB. Browser data is not shared with other users or devices. Email addresses entered in the sign-in preview are not retained. Reports are local and are not sent to a moderation team. Notifications are local activity entries, not push notifications.

Sample content, vote counts, member counts, events and distances are illustrative. The location selector does not collect GPS data. Sign-in does not verify users. The 18+ checkbox is a self-declaration, not age verification. Message expiry is enforced only by the running frontend; secure server expiry is not yet implemented. Voices and photos can identify people; there is no voice anonymization.

## Preview and source

`docs/` is the complete GitHub Pages frontend. It uses standard HTML, CSS, and JavaScript, with no package install or build step. Google Fonts is optional; system fonts take over if unavailable. All illustrations are local SVG. No product analytics are included.

`mobile/App.js` is an Expo/React Native preview shell that displays the shared frontend through a WebView. Paste it into Expo Snack and add `react-native-webview` and `react-native-safe-area-context` if you want an Expo preview. A native store build and device verification have not been completed. Phone browsers can use the Pages URL directly. Native microphone permissions and native OAuth redirects must be completed before a store release.

GitHub Pages should publish from **main /docs**. `.nojekyll` disables unnecessary Jekyll processing. This is the preview host; the planned production backend remains AWS.

## AWS integration boundary

The next implementation replaces the local state adapter with Cognito identity and API Gateway/Lambda endpoints backed by PostgreSQL on RDS. Store public handles separately from private account identifiers. Add S3 media uploads with signed URLs, server-side validation, actual geospatial distances, rate limiting, moderation, push delivery, and server-enforced mutual chat acceptance/expiry. OAuth provider setup and Apple sign-in credentials belong in backend configuration, not source files.

Data fixtures: `docs/data.js`. State, routing and screens: `docs/app.js`. Dialogs and secondary screens: `docs/ui.js`. Form handlers, persistence and recording: `docs/interactions.js`. Design and responsive layouts: `docs/styles.css`.

## Verification

`scripts/check-frontend.cjs` tests the public preview with Playwright and takes desktop/mobile screenshots. It covers navigation, onboarding, votes, posts, nested replies, search, joins, confessions, listing images, radius/sort, messaging, expiry, squads, city updates, reporting, preferences, and demo sign-in. It also checks for horizontal overflow at 390, 768, and 1440 pixels and captures uncaught browser errors. Test data stays in an isolated browser context and never reaches a backend.

For a prepared cloud development environment, install Playwright there and run `node scripts/check-frontend.cjs`; no laptop installation is needed. `GULLY_PREVIEW_URL` can point to another deployed preview.

## Gully Baithak — scheduled audio room frontend

The Baithak preview adds scheduled Hyderabad conversations, a Gully admin review simulation, and responsive room controls. Hosts request at least 12 hours ahead, choose 30/45/60 minutes and a cap of 15/20/25/30 people, and use IST for all session times. The stage holds at most six speakers including the host. Editing requires fresh approval; rooms finish at the original scheduled end.

Open `#baithak` from the sidebar, home banner, or mobile navigation. The Upcoming, On air, and My plans tabs cover discovery, sample live rooms, and local requests. Expand Preview tools to try admin approval; sample room tools expose simulated host controls.

**Live audio and real authorization are not connected.** Browser-local controls, participants, reports, and approvals are demonstrations. No microphone is accessed by Baithak. See [BAITHAK.md](BAITHAK.md) for the agreed rules, frontend scope, and AWS integration contract.
