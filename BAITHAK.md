# Gully Baithak

Scheduled, anonymous audio hangouts for Hyderabad's 18+ Gully community.

## Product rules agreed on 18 September 2026

- Hosts request rooms at least **12 hours before the start**.
- A **Gully admin** must approve the request before discovery lists it.
- Duration choices: **30, 45, or 60 minutes**.
- Capacity choices: **15, 20, 25, or 30 people**, including the host and speakers.
- Up to **6 people on the mic**, including the host; everyone else listens.
- Dates are entered and displayed in **Hyderabad time (IST / Asia/Kolkata)**, regardless of device time zone.
- Hosts can start only an approved room during its scheduled slot. A late start does not extend the end time.
- Edits require fresh approval and another valid 12-hour notice period. Overlapping requests from the same host are rejected.
- Pending requests expire at their requested start time. An approved room that never opens is marked missed after its slot.
- Hosts can withdraw requests, approve speaker requests, mute speakers, return speakers to the audience, remove participants, and end the room.
- A host can mute another person; only that speaker can unmute themselves.
- Removed people cannot rejoin that room in the local model. One person can participate in one active room at a time.
- No recording in Gully. Public identity uses anonymous handles; a person's voice can still identify them.

## Included frontend

- Discovery with Upcoming, On air, and My plans filters, plus the existing area selector.
- Request form, IST validation, local persistence, review states, editing and withdrawal.
- Clearly labelled admin simulation with approval, rejection reason, and a review queue.
- Scheduled detail screen, save-to-plans, and downloadable calendar events explicitly marked as preview events.
- Live-room simulation with stage/audience, listener entry and departure, hand raising, muted speaker admission, host controls, reactions, local reports, and countdown.
- Responsive navigation, keyboard-accessible dialogs, and always-reachable mobile room controls.

## Current boundary

This is an **interactive frontend**, not a live audio service. There is no connected microphone, audio transport, verified host, real admin role, delivered report, push reminder, seat reservation, or cross-device state. All records are local to the browser. Sample people are fictional. Calendar downloads are real files, but their events are labelled as frontend previews.

State is under `baithak` in the existing `gully.frontend.v1` localStorage record. Existing Gully data is preserved; resetting the demo resets Baithak too. The room timer checks the absolute scheduled end on each tick and on return to the tab. These client-side rules are for the preview; they are not a security boundary.

## AWS implementation next

Keep the agreed AWS stack: Cognito identity, API Gateway/Lambda, RDS PostgreSQL, and a managed audio service (planned: Amazon IVS Real-Time). Verify service availability, SDK support, quotas, and current cost before provisioning.

The production backend must own roles, time, approval state, and participant membership. The browser must never authorize an admin or mint participant credentials.

Suggested API contract:

| Operation | Server requirement |
| --- | --- |
| Request or revise a room | Verified adult account policy; validate 12-hour notice, duration, capacity, topic, and overlaps; new revision invalidates approval |
| List rooms | Only publish approved rooms; pending/declined details visible only to owner and authorized reviewers |
| Approve or decline | Admin authorization, revision check, decision audit, useful decline reason |
| Start or join | Check approval and scheduled window; reserve admission transactionally to prevent concurrent over-capacity joins |
| Issue audio credentials | Short-lived credentials bound to approved membership and listener/speaker permissions |
| Approve speaker | Atomic six-speaker cap; publish permission only after host approval and speaker consent |
| Mute, remove, or end | Verify host/admin authority; revoke publish/join permissions; allow admin emergency termination |
| End automatically | Server scheduler and audio-service disconnect enforce the deadline, even with all clients offline |
| Reports | Deliver to moderation with private account accountability and a minimal audit trail |

Before live release: test two real devices, listener/speaker permission transitions, concurrent joins, removal/rejoin, reconnects, denied microphone access, interrupted networks, and end-room revocation. Add usage limits and billing alerts before enabling production audio.

## Files

- `frontend/baithak.js` and published `docs/baithak.js`: module and local adapter.
- `frontend/baithak.css` and published `docs/baithak.css`: visuals and responsive room controls.
- `check-baithak.cjs`: browser verification; uses intercepted local files by default and starts no local server.
- Published `scripts/check-baithak.cjs`: portable version; `GULLY_PREVIEW_URL` selects a deployed preview.

The existing Expo WebView wrapper inherits this web UI. Native microphone/audio integration and physical-device testing remain for the live-audio phase.
