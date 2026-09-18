/* Gully Baithak: local frontend adapter. No audio transport or real authorization. */
'use strict';
const Baithak = (() => {
  const HOUR = 3600000, MINUTE = 60000, LEAD = 12 * HOUR, SELF = 'local-self';
  const durations = [30, 45, 60], capacities = [15, 20, 25, 30];
  const languages = ['Telugu + English', 'Dakhni + Hindi', 'English', 'Telugu', 'Hindi'];
  let tab = 'Upcoming', previewHost = false, renderedRoomStatus = '';
  const getRoom = id => data().rooms.find(room => room.id === id);
  const me = () => ({id: SELF, handle: state.profile.handle, avatar: state.profile.avatar, role: 'listener', muted: true});
  const hostOf = room => room.members.find(person => person.id === room.hostId);
  const owns = room => room.hostId === SELF;
  const canHost = room => owns(room) || (previewHost && room.sample);
  const button = (action, label, id = '', cls = 'btn btn-outline', extra = '') => `<button class="${cls}" data-ba="${action}" data-room="${esc(id)}" ${extra}>${label}</button>`;
  const dateText = timestamp => new Intl.DateTimeFormat('en-IN', {timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'}).format(timestamp) + ' IST';
  const dateInput = timestamp => new Date(timestamp + 330 * MINUTE).toISOString().slice(0, 16);
  const earliest = () => Math.ceil((Date.now() + LEAD) / MINUTE) * MINUTE;
  const clockText = end => { const seconds = Math.max(0, Math.ceil((end - Date.now()) / 1000)); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; };
  function sampleRoom(id, title, description, offset, duration, capacity, areaName, topic, handle, color) {
    return {id, title, description, startsAt: Date.now() + offset * HOUR, duration, capacity, area: areaName, topic, language: languages[0], color, status: 'approved', hostId: id + '-host', members: [{id: id + '-host', handle, avatar: 2, role: 'host', muted: false}], requests: [], removed: [], saved: false, sample: true, submittedAt: Date.now() - 24 * HOUR, reviewedAt: Date.now() - HOUR, revision: 1};
  }
  function seed() {
    const live = sampleRoom('chai-break', 'Chai, first salaries & big-city life', 'First salary celebrations, PG survival stories, and figuring out Hyderabad together. Pull up a chair, miyaan.', -0.12, 45, 20, 'Madhapur', 'tech', 'DeccanChai', 'mint');
    live.startedAt = live.startsAt;
    const names = ['MetroMischief', 'KondapurCloud', 'IraniBiscuit', 'GachibowliGupshup', 'CharminarChill', 'DeccanDosa', 'BiriyaniByte', 'OsmaniaOwl', 'KukatpallyKite', 'HitechHush'];
    names.forEach((handle, i) => live.members.push({id: 'sample-person-' + i, handle, avatar: i % 5, role: i < 2 ? 'speaker' : 'listener', muted: true}));
    live.requests = ['sample-person-3', 'sample-person-5'];
    const pending = sampleRoom('campus-after-hours', 'Campus stories after the last bell', 'A relaxed conversation about fests, friendships, and the next semester. Keep college gossip kind and anonymous.', 26, 30, 15, 'Osmania', 'campus', 'CampusComet', 'lavender');
    pending.status = 'pending'; pending.reviewedAt = null;
    return {version: 1, rooms: [live,
      sampleRoom('pg-roundtable', 'PG dinner support group. Bring chai.', 'Share your best budget meal discoveries and the little things that make a shared room feel like home.', 18, 30, 15, 'Kukatpally', 'pg', 'MaggiAfterMidnight', 'peach'),
      sampleRoom('weekend-deccan', 'A weekend in Hyderabad, under ₹500', 'Local walks, budget eats, and underrated hangouts. Swap ideas with people who call this city home.', 22, 60, 30, 'Secunderabad', 'city', 'CharminarChill', 'lavender'), pending], reports: []};
  }
  function data() {
    if (!state.baithak || state.baithak.version !== 1) { state.baithak = seed(); persist(); }
    return state.baithak;
  }
  function status(room) {
    if (room.status === 'cancelled') return 'Cancelled';
    if (room.endedAt) return 'Ended';
    if (room.status === 'declined') return 'Declined';
    if (room.status === 'pending') return room.startsAt <= Date.now() ? 'Expired request' : 'Awaiting approval';
    if (Date.now() >= room.startsAt + room.duration * MINUTE) return room.startedAt ? 'Ended' : 'Missed';
    if (room.startedAt) return 'On air';
    return Date.now() >= room.startsAt ? 'Ready to start' : 'Scheduled';
  }
  const isPublic = room => room.status === 'approved' && !['Ended', 'Missed'].includes(status(room));
  const badge = room => `<span class="ba-status ${status(room) === 'On air' ? 'is-live' : ''}">${status(room) === 'On air' ? '<span class="dot"></span>' : icon('clock')}${status(room)}</span>`;
  const previewNote = () => `<div class="ba-preview">${icon('code')}<span><strong>Interactive preview</strong> · Sample rooms and browser-only activity. Live audio is not connected.</span></div>`;
  function emptyList(title, copy) { return `<div class="ba-empty">${icon('coffee')}<h3>${title}</h3><p>${copy}</p>${button('schedule', 'Request a Baithak', '', 'btn btn-dark')}</div>`; }
  function card(room) {
    const current = status(room), live = current === 'On air';
    return `<article class="ba-card ${room.color || 'peach'}" data-ba-card="${esc(room.id)}"><div class="ba-card-top">${badge(room)}<span class="ba-language">${esc(room.language)}</span></div><div class="ba-card-inner"><span class="eyebrow">${esc(room.area)} · ${esc(board(room.topic).name)}</span><h3>${button('open', esc(room.title), room.id, 'ba-title-button')}</h3><p>${esc(room.description)}</p><div class="ba-host">${avatar(hostOf(room)?.avatar || 0, 'tiny')}<span>with <strong>${esc(hostOf(room)?.handle || 'Gully host')}</strong>${owns(room) ? ' · You' : ''}</span></div><div class="ba-details"><span>${icon('clock')}${live ? `${clockText(room.startsAt + room.duration * MINUTE)} left` : dateText(room.startsAt)}</span><span>${icon('users')}${live ? `${room.members.length}/${room.capacity} in room` : `${room.capacity} people max`} · ${room.duration} min</span></div><div class="ba-card-foot"><span class="ba-small">${room.sample ? 'Sample session' : 'Your local request'}${room.saved ? ' · Saved' : ''}</span>${button('open', live ? 'Enter preview ' + icon('arrow') : 'View Baithak ' + icon('arrow'), room.id, 'btn btn-small ' + (live ? 'btn-dark' : 'btn-outline'))}</div></div></article>`;
  }
  function landing() {
    const rooms = data().rooms;
    let list = rooms.filter(room => (area === 'All Hyderabad' || room.area === area) && !state.blocked.includes(hostOf(room)?.handle));
    list = list.filter(room => tab === 'My plans' ? (owns(room) || (room.saved && isPublic(room))) : tab === 'On air' ? isPublic(room) && status(room) === 'On air' : isPublic(room) && ['Scheduled', 'Ready to start'].includes(status(room)));
    list.sort((a,b) => a.startsAt - b.startsAt);
    return `${heading('Gully Baithak', 'Familiar city. Unfamiliar voices. Good conversations.', button('schedule', icon('plus') + 'Request a Baithak', '', 'btn btn-primary'))}${previewNote()}<section class="ba-hero"><div class="ba-hero-copy"><div class="ba-kicker"><span></span>HYDERABAD, ON MIC.</div><h2>Arrey, pull up<br>a <em>conversation.</em></h2><p>A little chai energy. A room full of your people.<br>Anonymous audio hangouts, with room to be you.</p><div class="ba-hero-tags"><span>${icon('clock')}30–60 minutes</span><span>${icon('users')}15–30 people</span><span>${icon('shield')}18+ only</span></div></div><div class="ba-art" aria-hidden="true"><div class="ba-orbit orbit-one"></div><div class="ba-orbit orbit-two"></div><div class="ba-mic">${icon('mic')}</div><div class="ba-art-person person-one">${avatar(0)}<span>Chalo, baat karein.</span></div><div class="ba-art-person person-two">${avatar(1)}</div><div class="ba-art-person person-three">${avatar(2)}</div><div class="ba-art-person person-four">${avatar(3)}</div><div class="ba-sound">${[12,22,36,25,44,20,32,14].map(h=>`<i style="height:${h}px"></i>`).join('')}</div><span class="ba-art-caption">YOUR VOICE. YOUR GULLY.</span></div></section><div class="ba-layout"><section><div class="ba-toolbar"><div class="ba-tabs" role="group" aria-label="Baithak filters">${['Upcoming','On air','My plans'].map(label=>button('tab', label, label, 'ba-tab ' + (tab === label ? 'active' : ''), `aria-pressed="${tab === label}"`)).join('')}</div><span class="ba-small">All times IST</span></div><div class="ba-grid">${list.map(card).join('')}</div>${!list.length ? emptyList(tab === 'My plans' ? 'Your next conversation starts here.' : 'A quiet corner, for now.', tab === 'My plans' ? 'Your requests and saved upcoming sessions appear here.' : 'Try another area or request a session at least 12 hours ahead.') : ''}</section><aside class="ba-rail"><div class="ba-how"><span class="eyebrow">GREAT CONVERSATIONS TAKE A LITTLE PLANNING</span><h3>First a plan.<br>Then a Baithak.</h3><ol><li><strong>Pick your conversation</strong><span>Choose a topic, 30–60 minutes, and a cap of 15–30 people.</span></li><li><strong>Give us 12 hours</strong><span>Send your request ahead of time. A Gully admin reviews it before it’s public.</span></li><li><strong>Pull up, on time</strong><span>Listen first. Raise your hand to speak. The room closes at its scheduled end.</span></li></ol></div><div class="ba-ground"><span class="ba-chai">☕</span><h3>Keep the chai warm.<br>Keep the conversation kind.</h3><p>Anonymous handles. No recording in Gully. Your voice can still identify you—share only what feels comfortable.</p></div><details class="ba-demo-tools"><summary>Preview tools</summary><p>Test admin approval locally. This is not a real admin account.</p>${button('review', 'Open admin preview', '', 'text-btn')}</details></aside></div>`;
  }
  function schedule(id) {
    if (!gate()) return;
    const room = id ? getRoom(id) : null;
    if (id && (!room || !owns(room) || room.startedAt || room.endedAt || room.status === 'cancelled')) return;
    const start = room && room.startsAt >= earliest() ? room.startsAt : earliest() + HOUR;
    const selectOptions = (items, value) => items.map(item => `<option value="${esc(item)}" ${String(item) === String(value) ? 'selected' : ''}>${esc(item)}</option>`).join('');
    showModal(`${modalHead(room ? 'Revise your Baithak' : 'What’s the Baithak about?', 'Request a room · reviewed by a Gully admin')}<div class="ba-rule-strip">${icon('shield')}Request at least <strong>12 hours ahead</strong>. ${room ? 'Changes need fresh approval.' : 'Your room stays private until approved.'}</div><form id="ba-schedule" data-edit="${esc(room?.id || '')}"><div class="form-field"><label for="ba-title">Give your conversation a name</label><input id="ba-title" name="title" minlength="8" maxlength="90" required placeholder="First job in Hyderabad. How’s it going?" value="${esc(room?.title || '')}"></div><div class="form-field"><label for="ba-description">What will you talk about?</label><textarea id="ba-description" name="description" minlength="20" maxlength="600" required placeholder="Set the mood, share a few talking points, and help the admin understand your plan.">${esc(room?.description || '')}</textarea></div><div class="form-grid"><div class="form-field"><label for="ba-area">Neighbourhood</label><select name="area" id="ba-area">${selectOptions(D.areas.slice(1), room?.area || state.profile.area)}</select></div><div class="form-field"><label for="ba-topic">Topic board</label><select name="topic" id="ba-topic">${D.boards.map(b=>`<option value="${b.id}" ${b.id === room?.topic ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></div></div><div class="form-field"><label for="ba-start">Date & start time · Hyderabad (IST)</label><input type="datetime-local" id="ba-start" name="startsAt" required min="${dateInput(earliest())}" value="${dateInput(start)}"><small id="ba-earliest">Earliest request: ${dateText(earliest())}. This field always uses IST, wherever you are.</small></div><div class="form-grid"><div class="form-field"><label for="ba-duration">Duration (minutes)</label><select id="ba-duration" name="duration">${selectOptions(durations, room?.duration || 45)}</select></div><div class="form-field"><label for="ba-capacity">Room size (including the host)</label><select id="ba-capacity" name="capacity">${selectOptions(capacities, room?.capacity || 20)}</select></div></div><div class="form-field"><label for="ba-language">Conversation language</label><select id="ba-language" name="language">${selectOptions(languages, room?.language || languages[0])}</select></div><div id="ba-plan-summary" class="ba-plan-summary" aria-live="polite"></div><label class="check-line"><input type="checkbox" name="agree" required> I’ll host an 18+ conversation, respect anonymous identities, and follow Gully’s community guidelines.</label><p id="ba-form-error" class="error-text" role="alert"></p><div class="form-footer"><small>Saved in this browser only. No request is sent to an admin yet.</small><button class="btn btn-primary" type="submit">${room ? 'Resubmit for approval' : 'Request approval'} ${icon('arrow')}</button></div></form>`, 'ba-schedule');
    updateSummary();
  }
  function updateSummary() {
    const form = $('#ba-schedule'); if (!form) return;
    const at = Date.parse(form.elements.startsAt.value + ':00+05:30'), duration = Number(form.elements.duration.value);
    $('#ba-plan-summary').textContent = Number.isFinite(at) ? `${dateText(at)} → ${dateText(at + duration * MINUTE)} · ${form.elements.capacity.value} people max` : 'Choose a valid start time in IST.';
  }
  function submitSchedule(form) {
    const values = Object.fromEntries(new FormData(form)), title = (values.title || '').trim(), description = (values.description || '').trim();
    const startsAt = Date.parse(values.startsAt + ':00+05:30'), duration = Number(values.duration), capacity = Number(values.capacity), now = Date.now();
    let error = '';
    if (title.length < 8 || title.length > 90 || description.length < 20 || description.length > 600) error = 'Add a title of 8–90 characters and a description of 20–600 characters.';
    else if (!Number.isFinite(startsAt) || startsAt < now + LEAD) error = 'Choose a Hyderabad start time at least 12 hours from now.';
    else if (!durations.includes(duration) || !capacities.includes(capacity)) error = 'Choose 30, 45, or 60 minutes and a room size of 15, 20, 25, or 30.';
    else if (!D.areas.slice(1).includes(values.area) || !D.boards.some(b => b.id === values.topic) || !languages.includes(values.language)) error = 'Choose a listed neighbourhood, board, and language.';
    else if (!values.agree) error = 'Please agree to host an 18+ conversation under the community guidelines.';
    const old = form.dataset.edit ? getRoom(form.dataset.edit) : null;
    if (form.dataset.edit && (!old || !owns(old) || old.startedAt || old.endedAt || old.status === 'cancelled')) error = 'This session can no longer be edited.';
    if (!error && data().rooms.some(r => r.id !== old?.id && owns(r) && ['pending','approved'].includes(r.status) && !r.endedAt && startsAt < r.startsAt + r.duration * MINUTE && startsAt + duration * MINUTE > r.startsAt)) error = 'You already have a requested or approved Baithak during this time. Choose a different slot.';
    if (error) { $('#ba-form-error').textContent = error; return; }
    const room = {...old, id: old?.id || uid(), title, description, startsAt, duration, capacity, area: values.area, topic: values.topic, language: values.language, color: 'peach', hostId: SELF, members: [{...me(), role:'host'}], requests: [], removed: [], status:'pending', submittedAt:now, reviewedAt:null, reviewNote:'', revision:(old?.revision || 0) + 1, sample:false, saved:false};
    if (old) data().rooms[data().rooms.indexOf(old)] = room; else data().rooms.push(room);
    persist(); tab = 'My plans'; area = 'All Hyderabad'; nav('baithak', room.id); toast('Request saved locally. Awaiting Gully admin approval.');
  }
  function reviewPage() {
    const pending = data().rooms.filter(r => r.status === 'pending').sort((a,b) => a.startsAt - b.startsAt);
    return `${heading('Baithak review desk', 'Admin workflow preview', button('back', 'Back to Baithak'))}<div class="ba-admin-note">${icon('shield')}<div><strong>Local admin simulation</strong><p>No admin account is connected. These controls change only this browser’s demo. Production approval must be authorized by AWS.</p></div></div><div class="ba-review-heading"><h2>Requests to review</h2><span>${pending.length} pending</span></div>${pending.map(room => `<article class="ba-review-card" data-ba-review="${esc(room.id)}"><div class="flex between">${badge(room)}<span class="ba-small">Revision ${room.revision}</span></div><h3>${esc(room.title)}</h3><p>${esc(room.description)}</p><div class="ba-details"><span>${icon('clock')}${dateText(room.startsAt)} · ${room.duration} min</span><span>${icon('users')}${room.capacity} people · ${esc(room.language)}</span><span>${icon('pin')}${esc(room.area)} · ${esc(board(room.topic).name)}</span></div><div class="ba-review-meta">Requested ${dateText(room.submittedAt)} by ${esc(hostOf(room)?.handle)}<br>${Math.round((room.startsAt-room.submittedAt)/HOUR * 10)/10} hours’ notice</div><div class="ba-review-actions">${button('approve', icon('check') + 'Simulate approval', room.id, 'btn btn-dark', status(room) === 'Expired request' ? 'disabled' : '')}${button('decline', 'Decline with a reason', room.id)}${button('open', 'View request', room.id, 'text-btn')}</div></article>`).join('') || '<div class="ba-empty"><h3>All caught up.</h3><p>New local requests will appear here for review.</p></div>'}`;
  }
  function detail(room) {
    const current = status(room), publicRoom = isPublic(room), active = current === 'On air';
    if (active) return roomPage(room);
    return `${heading('The next conversation.', 'Gully Baithak · Hyderabad', button('back', 'All Baithaks'))}${previewNote()}<div class="ba-detail-layout"><section class="ba-detail-card ${room.color || 'peach'}"><div class="ba-detail-body">${badge(room)}<h2>${esc(room.title)}</h2><p>${esc(room.description)}</p><div class="ba-host">${avatar(hostOf(room)?.avatar || 0)}<span>Hosted by <strong>${esc(hostOf(room)?.handle)}</strong>${owns(room) ? ' · You' : ''}</span></div><div class="ba-detail-facts"><div>${icon('clock')}<span>WHEN<strong>${dateText(room.startsAt)}</strong></span></div><div>${icon('users')}<span>THE ROOM<strong>${room.capacity} people · ${room.duration} minutes</strong></span></div><div>${icon('pin')}<span>YOUR CORNER<strong>${esc(room.area)} · ${esc(board(room.topic).name)}</strong></span></div><div>${icon('message')}<span>LANGUAGE<strong>${esc(room.language)}</strong></span></div></div><div class="ba-status-copy">${current === 'Awaiting approval' ? '<strong>Your request is in the queue.</strong><p>It will appear in discovery after a Gully admin approves it. Approval is not guaranteed.</p>' : current === 'Declined' ? `<strong>This request needs another look.</strong><p>${esc(room.reviewNote)}</p>` : current === 'Expired request' ? '<strong>The requested time has passed.</strong><p>Pick a new time at least 12 hours ahead and resubmit for approval.</p>' : current === 'Scheduled' ? '<strong>See you at the scheduled time.</strong><p>The host can open this approved room when the session starts. Saving a session does not reserve a seat.</p>' : current === 'Ready to start' ? '<strong>The room is waiting for its host.</strong><p>The session ends at its scheduled finish, even if it starts late.</p>' : `<strong>${current === 'Ended' ? 'That’s a wrap. Thanks for the conversation.' : 'This Baithak is no longer available.'}</strong><p>${esc(room.endReason || (current === 'Missed' ? 'The host did not open the room during its scheduled slot.' : 'You can explore another session or request your own.'))}</p>`}</div><div class="ba-detail-actions">${publicRoom && !owns(room) ? button('save', icon(room.saved ? 'check' : 'bookmark') + (room.saved ? 'Saved to my plans' : 'Save to my plans'), room.id, 'btn btn-dark') : ''}${current === 'Scheduled' ? button('calendar', icon('clock') + 'Add to calendar', room.id) : ''}${current === 'Ready to start' && owns(room) ? button('start', icon('mic') + 'Open room preview', room.id, 'btn btn-primary') : ''}${owns(room) && !['Ended','Cancelled','Missed'].includes(current) ? button('edit', 'Edit & resubmit', room.id) + button('cancel', 'Withdraw request', room.id, 'text-btn') : ''}</div></div></section><aside class="ba-rail"><div class="ba-how"><h3>Small room.<br>Space for everyone.</h3><p>Join as a listener. Raise your hand when you have something to add. The host can invite up to 6 people to the mic, including themselves.</p><div class="ba-divider"></div><p>We use anonymous handles, but voices can identify people. Gully won’t record these sessions.</p><div class="ba-divider"></div><span class="ba-small">Scheduled end: ${dateText(room.startsAt + room.duration * MINUTE)}</span></div>${room.status === 'pending' ? `<details class="ba-demo-tools"><summary>Preview approval</summary><p>Use the admin simulation to test this request.</p>${button('review', 'Open admin preview', '', 'text-btn')}</details>` : ''}</aside></div>`;
  }
  function memberCard(person, room, hostControls) {
    const requested = room.requests.includes(person.id), self = person.id === SELF;
    return `<div class="ba-person" data-person="${esc(person.id)}"><div class="ba-person-avatar ${person.role !== 'listener' && !person.muted ? 'speaking' : ''}">${avatar(person.avatar, 'large')}<span>${icon(person.role === 'listener' ? 'users' : person.muted ? 'lock' : 'mic')}</span></div><strong>${esc(person.handle)}${self ? ' (you)' : ''}</strong><small>${requested ? '✋ Hand raised' : person.role === 'host' ? 'Host' : person.role === 'speaker' ? (person.muted ? 'Speaker · muted' : 'Speaker') : 'Listening'}</small>${hostControls && person.id !== room.hostId ? `<div class="ba-person-controls">${person.role === 'speaker' ? button('mute-person', person.muted ? 'Muted' : 'Mute', room.id, 'text-btn', `data-person="${esc(person.id)}" ${person.muted ? 'disabled' : ''}`) + button('to-listener', 'To audience', room.id, 'text-btn', `data-person="${esc(person.id)}"`) : ''}${button('remove-person', 'Remove', room.id, 'text-btn', `data-person="${esc(person.id)}"`)}</div>` : ''}</div>`;
  }
  function roomPage(room) {
    const member = room.members.find(p=>p.id === SELF), hostControls = canHost(room), host = hostOf(room);
    const speakers = room.members.filter(p=>p.role !== 'listener'), audience = room.members.filter(p=>p.role === 'listener');
    const removed = room.removed.includes(SELF), full = room.members.length >= room.capacity;
    return `${heading('You’re in the Gully.', 'Gully Baithak · Audio room preview', button('back', 'All Baithaks'))}${previewNote()}<div class="ba-room-layout"><section class="ba-room"><header class="ba-room-head"><div class="flex between">${badge(room)}<span class="ba-room-timer">${icon('clock')}<strong id="ba-countdown" role="timer" aria-label="Time left">${clockText(room.startsAt + room.duration * MINUTE)}</strong> left</span></div><h2>${esc(room.title)}</h2><p>${esc(room.area)} · ${esc(room.language)} · ${room.members.length}/${room.capacity} people</p><div class="ba-wave-line" aria-hidden="true">${Array.from({length:48},(_,i)=>`<i style="height:${8 + (i * 17 % 29)}px"></i>`).join('')}</div><span class="ba-small">Illustrated room · No microphone access or audio transmission</span></header><div class="ba-room-body"><div class="ba-stage-label"><h3>At the mic</h3><span>${speakers.length}/6 speakers</span></div><div class="ba-people">${speakers.map(p=>memberCard(p,room,hostControls)).join('')}</div><div class="ba-stage-label"><h3>Just listening. Just belonging.</h3><span>${audience.length} listeners</span></div><div class="ba-people audience">${audience.map(p=>memberCard(p,room,hostControls)).join('')}</div>${!audience.length ? '<p class="ba-small">A little room for new voices.</p>' : ''}</div><footer class="ba-room-controls">${!member ? button('join', removed ? 'Removed from this room' : full ? 'Room is full' : icon('users') + 'Join as listener', room.id, 'btn btn-primary', removed || full ? 'disabled' : '') : member.role === 'listener' ? button('hand', room.requests.includes(SELF) ? '✋ Lower my hand' : '✋ Ask to speak', room.id, 'btn btn-dark', `aria-pressed="${room.requests.includes(SELF)}"`) : button('self-mute', icon('mic') + (member.muted ? 'Unmute (demo)' : 'Mute (demo)'), room.id, 'btn btn-dark', `aria-pressed="${member.muted}"`)}${member && !owns(room) ? button('leave', 'Leave quietly', room.id) : ''}${hostControls ? button('end', 'End Baithak', room.id, 'btn ba-end') : ''}${button('report', icon('flag') + 'Report', room.id, 'text-btn')}</footer><div id="ba-reaction" class="ba-reaction" role="status" aria-live="polite"></div>${member ? `<div class="ba-reactions" aria-label="Room reactions">${['🧡','👏','☕'].map(emoji=>button('react', emoji, room.id, 'ba-reaction-btn', `data-emoji="${emoji}" aria-label="React with ${emoji}"`)).join('')}<span>Reactions stay in this demo.</span></div>` : ''}</section><aside class="ba-rail"><div class="ba-how"><span class="eyebrow">HOSTED BY</span><div class="ba-host">${avatar(host?.avatar || 0)}<strong>${esc(host?.handle)}</strong></div><p>${esc(room.description)}</p><div class="ba-divider"></div><p>Ends ${dateText(room.startsAt + room.duration * MINUTE)}. No recording. Respect people’s privacy.</p></div>${hostControls ? `<div class="ba-queue"><div class="flex between"><h3>Hands raised</h3><span class="ba-small">${room.requests.length} waiting</span></div>${room.requests.map(id=>room.members.find(p=>p.id === id)).filter(Boolean).map(p=>`<div class="ba-request"><strong>${esc(p.handle)}</strong><div>${button('approve-speaker', 'Invite to mic', room.id, 'btn btn-small btn-dark', `data-person="${esc(p.id)}" ${speakers.length >= 6 ? 'disabled' : ''}`)}${button('dismiss-hand', 'Dismiss', room.id, 'text-btn', `data-person="${esc(p.id)}"`)}</div></div>`).join('') || '<p class="ba-small">Listeners can raise their hands to speak.</p>'}${speakers.length >= 6 ? '<p class="ba-small">All 6 mic spots are occupied.</p>' : ''}</div>` : `<div class="ba-ground"><h3>Listening counts, too.</h3><p>No pressure to speak. If you raise your hand, the host decides when to invite you to the mic.</p></div>`}${room.sample ? `<details class="ba-demo-tools" ${previewHost ? 'open' : ''}><summary>Room preview tools</summary><p>Switch to a simulated host to try the speaker queue, moderation, and end-room flow.</p>${button('host-preview', previewHost ? 'Return to listener view' : 'Simulate host controls', room.id, 'text-btn')}</details>` : ''}</aside></div>`;
  }
  function renderPage() {
    if (boardId === 'review') return reviewPage();
    const room = getRoom(boardId);
    if (room && (isPublic(room) || owns(room) || room.sample)) { renderedRoomStatus=status(room); return detail(room); }
    if (boardId !== 'pg') return `${heading('Baithak not available', 'This session may have been cancelled or is awaiting approval.', button('back','All Baithaks'))}${emptyList('There’s another conversation around the corner.', 'Explore approved sessions or request your own.')}`;
    return landing();
  }
  function changed(message = '') { persist(); refresh(); if (message) toast(message); }
  function downloadCalendar(room) {
    const utc = ms => new Date(ms).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    const ics = value => String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Gully//Baithak preview//EN','BEGIN:VEVENT',`UID:${room.id}@gully-preview`,`DTSTAMP:${utc(Date.now())}`,`DTSTART:${utc(room.startsAt)}`,`DTEND:${utc(room.startsAt+room.duration*MINUTE)}`,`SUMMARY:${ics('Gully Baithak (preview): '+room.title)}`,`DESCRIPTION:${ics('Frontend preview, not a real event. '+room.description)}`,'LOCATION:Gully frontend preview','END:VEVENT','END:VCALENDAR'];
    const url = URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));
    const link = document.createElement('a'); link.href=url; link.download='gully-baithak.ics'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); toast('Preview calendar event downloaded.');
  }
  function confirmEnd(room, cancel = false) {
    showModal(`${modalHead(cancel ? 'Withdraw this Baithak?' : 'End this Baithak for everyone?')}<p class="legal-copy">${cancel ? 'The request will be cancelled and removed from discovery. You can submit a new request later.' : 'Everyone leaves the room and it cannot be reopened. This affects only the local preview.'}</p><div class="form-footer"><button class="btn btn-outline" data-action="close-modal">Keep it open</button>${button(cancel ? 'confirm-cancel' : 'confirm-end', cancel ? 'Withdraw request' : 'End for everyone', room.id, 'btn ba-end')}</div>`, 'ba-confirm');
  }
  function action(kind, id, element) {
    if (kind === 'back') { previewHost = false; nav('baithak'); return; }
    if (kind === 'open') { previewHost = false; nav('baithak', id); return; }
    if (kind === 'tab') { tab = id; refresh(); return; }
    if (kind === 'schedule') { schedule(); return; }
    if (kind === 'review') { nav('baithak','review'); return; }
    if (!gate()) return;
    const room = getRoom(id); if (!room) return;
    const member = room.members.find(p=>p.id === SELF), current = status(room), hostControls = canHost(room);
    if (kind === 'edit') { schedule(id); return; }
    if (kind === 'save' && isPublic(room)) { room.saved = !room.saved; changed(room.saved ? 'Saved locally. No seat is reserved and no reminder will be sent.' : 'Removed from your saved plans.'); return; }
    if (kind === 'calendar' && current === 'Scheduled') { downloadCalendar(room); return; }
    if (kind === 'approve' && boardId === 'review' && room.status === 'pending') {
      if (room.startsAt <= Date.now() || room.startsAt - room.submittedAt < LEAD) { toast('This request cannot be approved. It needs a new start time with at least 12 hours’ notice.'); return; }
      room.status = 'approved'; room.reviewedAt = Date.now(); room.reviewNote = 'Approved in the local admin simulation.'; changed('Approval simulated. This room now appears in discovery.'); return;
    }
    if (kind === 'decline' && boardId === 'review' && room.status === 'pending') {
      showModal(`${modalHead('A little guidance for the host.', 'Decline a local request')}<form id="ba-decline" data-room="${esc(id)}"><div class="form-field"><label for="ba-review-note">Reason for declining</label><textarea id="ba-review-note" name="reason" required minlength="10" maxlength="400" placeholder="Explain what needs to change before they submit again."></textarea></div><p class="error-text" id="ba-decline-error" role="alert"></p><button type="submit" class="btn ba-end">Simulate decline</button></form>`, 'ba-decline'); return;
    }
    if (kind === 'cancel' && owns(room) && !room.startedAt && room.status !== 'cancelled') { confirmEnd(room,true); return; }
    if (kind === 'confirm-cancel' && owns(room) && !room.startedAt && room.status !== 'cancelled') { room.status='cancelled'; room.saved=false; closeModal(); changed('Your request was withdrawn.'); return; }
    if (kind === 'start' && owns(room) && current === 'Ready to start' && room.status === 'approved') { if(data().rooms.some(r=>r.id!==id && status(r)==='On air' && r.members.some(p=>p.id===SELF))) { toast('Leave your other Baithak before opening this one.'); return; } room.startedAt=Date.now(); changed('Room preview opened. Live audio is not connected.'); return; }
    if (current !== 'On air') { refresh(); toast('This room is not on air.'); return; }
    if (kind === 'host-preview' && room.sample) { previewHost=!previewHost; refresh(); return; }
    if (kind === 'join') {
      if (member) return;
      if (room.removed.includes(SELF)) { toast('The host removed you from this room.'); return; }
      if (room.members.length >= room.capacity) { toast('This Baithak is full. Try another session.'); return; }
      if (data().rooms.some(r=>r.id !== id && status(r) === 'On air' && r.members.some(p=>p.id === SELF))) { toast('Leave your other Baithak before joining this one.'); return; }
      room.members.push(me()); changed('Joined the local room preview. No audio is connected.'); return;
    }
    if (kind === 'leave' && member && !owns(room)) { room.members=room.members.filter(p=>p.id!==SELF); room.requests=room.requests.filter(p=>p!==SELF); changed('You left the Baithak.'); return; }
    if (kind === 'hand' && member?.role === 'listener') { room.requests=room.requests.includes(SELF) ? room.requests.filter(p=>p!==SELF) : [...room.requests,SELF]; changed(); return; }
    if (kind === 'self-mute' && member && member.role !== 'listener') { member.muted=!member.muted; changed('Mic state changed in the preview. No audio is transmitted.'); return; }
    if (kind === 'react' && member) { const target=$('#ba-reaction'); if(target) target.textContent=`${state.profile.handle}: ${element.dataset.emoji} · local reaction`; return; }
    if (kind === 'report') {
      showModal(`${modalHead('Keep the Baithak respectful.', 'Report this room · local preview')}<form id="ba-report" data-room="${esc(id)}"><div class="form-field"><label for="ba-report-reason">What happened?</label><select id="ba-report-reason" name="reason"><option>Harassment or hate</option><option>Sharing private information</option><option>Underage participant</option><option>Spam or unsafe behaviour</option></select></div><div class="form-field"><label for="ba-report-details">Details (optional)</label><textarea id="ba-report-details" name="details" maxlength="500"></textarea></div><p class="legal-copy">This report stays in this browser. It is not sent to a moderator.</p><button class="btn btn-primary" type="submit">Save local report</button></form>`, 'ba-report'); return;
    }
    if (!hostControls) return;
    if (kind === 'end') { confirmEnd(room); return; }
    if (kind === 'confirm-end') { room.endedAt=Date.now(); room.endReason='The host ended this session.'; room.requests=[]; room.members=room.members.filter(p=>p.id===room.hostId); closeModal(); changed('Baithak ended.'); return; }
    const person = room.members.find(p=>p.id === element.dataset.person);
    if (!person || person.id === room.hostId) return;
    if (kind === 'approve-speaker' && person.role === 'listener' && room.requests.includes(person.id)) {
      if (room.members.filter(p=>p.role!=='listener').length >= 6) { toast('The stage has reached its 6-speaker limit.'); return; }
      person.role='speaker'; person.muted=true; room.requests=room.requests.filter(p=>p!==person.id); changed('Speaker invited, with their mic muted.');
    } else if (kind === 'dismiss-hand') { room.requests=room.requests.filter(p=>p!==person.id); changed(); }
    else if (kind === 'mute-person' && person.role === 'speaker') { person.muted = true; changed('Speaker muted. Only that speaker can unmute their microphone.'); }
    else if (kind === 'to-listener') { person.role='listener'; person.muted=true; changed(); }
    else if (kind === 'remove-person') { room.members=room.members.filter(p=>p.id!==person.id); room.requests=room.requests.filter(p=>p!==person.id); room.removed.push(person.id); changed('Participant removed from this local room.'); }
  }
  document.addEventListener('click', event => { const element=event.target.closest('[data-ba]'); if(element) action(element.dataset.ba,element.dataset.room,element); });
  document.addEventListener('change', event => { if (event.target.closest('#ba-schedule')) updateSummary(); });
  document.addEventListener('submit', event => {
    const form=event.target;
    if (!['ba-schedule','ba-decline','ba-report'].includes(form.id)) return;
    event.preventDefault(); if(!gate()) return;
    if(form.id==='ba-schedule') { submitSchedule(form); return; }
    const room=getRoom(form.dataset.room); if(!room) return;
    const values=Object.fromEntries(new FormData(form));
    if(form.id==='ba-decline' && boardId==='review' && room.status==='pending') {
      const note=String(values.reason||'').trim();
      if(note.length<10 || note.length>400) { $('#ba-decline-error').textContent='Add a useful reason of 10–400 characters.'; return; }
      room.status='declined'; room.reviewNote=note; room.reviewedAt=Date.now(); closeModal(); changed('Decline simulated. The host can revise and resubmit.');
    } else if(form.id==='ba-report') { data().reports.push({id:uid(),roomId:room.id,reason:values.reason,details:values.details,at:Date.now()}); closeModal(); changed('Report saved locally. It has not been sent to a moderator.'); }
  });
  function tick() {
    if(!state.baithak) return;
    let ended=false;
    data().rooms.forEach(room=>{
      if(room.startedAt && !room.endedAt && Date.now()>=room.startsAt+room.duration*MINUTE) { room.endedAt=room.startsAt+room.duration*MINUTE; room.endReason='The scheduled time is up. Thanks for joining.'; room.requests=[]; room.members=room.members.filter(p=>p.id===room.hostId); ended=true; }
    });
    if(ended) { persist(); if(route==='baithak') refresh(); }
    if(route==='baithak') {
      const room=getRoom(boardId), label=$('#ba-countdown');
      if(room && label) label.textContent=clockText(room.startsAt+room.duration*MINUTE);
      if(room && renderedRoomStatus!==status(room) && !modalKind) refresh();
    }
  }
  setInterval(tick,1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden) {tick(); if(route==='baithak'&&!modalKind)refresh();}});
  return {renderPage};
})();
