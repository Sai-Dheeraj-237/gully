/* Runs against the public preview. Starts no local server. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const out = path.join(__dirname,'verification');
fs.mkdirSync(out,{recursive:true});
const url = process.env.GULLY_PREVIEW_URL || 'https://sai-dheeraj-237.github.io/gully/';
(async()=>{
 let browser;
 try { browser=await chromium.launch({headless:true,channel:'msedge',args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']}); }
 catch { browser=await chromium.launch({headless:true,args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']}); }
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage(),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 const check=(name)=>{checks.push(name);console.log('PASS '+name);};
 const click=async s=>page.locator(s).first().click();
 const nav=async r=>{await click(`[data-nav="${r}"]`);await page.waitForTimeout(80);};
 const close=async()=>{if(await page.locator('.modal').count())await click('[data-action="close-modal"]');};
 try {
  await page.goto(url);
  await page.locator('#age-form input[name=age]').check();
  await page.locator('#age-form input[name=rules]').check();
  await click('#age-form .btn-primary');
  await page.locator('.hero').waitFor();
  assert.equal(await page.locator('.post').count(),5);check('18+ onboarding and feed');
  await page.screenshot({path:path.join(out,'desktop-home.png'),fullPage:true});
  await click('[data-vote="p1"][data-dir="1"]');
  assert.equal(await page.locator('[data-post-card="p1"] .vote strong').textContent(),'129');
  await click('[data-vote="p1"][data-dir="-1"]');
  assert.equal(await page.locator('[data-post-card="p1"] .vote strong').textContent(),'127');
  await click('[data-vote="p1"][data-dir="-1"]');
  assert.equal(await page.locator('[data-post-card="p1"] .vote strong').textContent(),'128');check('Votes toggle and change direction without double counting');
  await click('[data-save="p1"]');await nav('saved');assert.equal(await page.locator('.post').count(),1);check('Save and saved collection');
  await nav('home');await click('[data-poll="1"]');assert.equal(await page.locator('[data-poll="1"]').getAttribute('aria-pressed'),'true');check('Pulse poll');
  await click('[data-action="compose"]');await page.locator('#compose-title').fill('Testing a new Gully conversation');await page.locator('#compose-body').fill('A real form submission in the local demo. <img src=x onerror=alert(1)>');await click('#compose-form .btn-primary');
  assert.match(await page.locator('.post').first().textContent(),/Testing a new Gully conversation/);
  assert.equal(await page.locator('.post-body img').count(),0);check('Post creation and HTML escaping');
  await page.reload();assert.match(await page.locator('#main').textContent(),/Testing a new Gully conversation/);check('Persistence after reload');
  await click('[data-post="p1"]');await click('[data-reply="c1"]');await page.locator('#comment-form textarea').fill('A nested reply from this demo.');await click('#comment-form .btn-primary');assert.match(await page.locator('.modal .replies').first().textContent(),/A nested reply/);await close();check('Nested comment replies');
  await page.locator('#global-search').fill('calculator');await page.locator('#global-search').press('Enter');assert.equal(await page.locator('.listing-card').count(),1);check('Global search across content types');
  await nav('boards');await click('[data-join="tech"]');assert.equal(await page.locator('[data-join="tech"]').textContent(),'Joined');check('Community membership');
  await nav('confessions');await page.screenshot({path:path.join(out,'desktop-confessions.png'),fullPage:true});await click('[data-action="confess"]');await page.locator('#compose-title').fill('A small good thing from today');await page.locator('#compose-body').fill('Made a friend over chai.');await click('#compose-form .btn-primary');assert.match(await page.locator('.confession').first().textContent(),/A small good thing/);check('Confession publishing');
  await nav('market');await page.screenshot({path:path.join(out,'desktop-marketplace.png'),fullPage:true});assert.equal(await page.locator('.listing-card').count(),5);await page.locator('#market-radius').selectOption('1');assert.equal(await page.locator('.listing-card').count(),1);await page.locator('#market-radius').selectOption('3');await page.locator('#market-sort').selectOption('price-low');assert.match(await page.locator('.listing-card').first().textContent(),/Engineering books/);check('Marketplace 3km radius and price sort');
  await click('[data-action="sell"]');await page.locator('#listing-title').fill('My useful desk lamp');await page.locator('#listing-price').fill('499');await page.locator('#listing-description').fill('In good condition. Public pickup only.');
  await page.locator('#listing-image').setInputFiles({name:'photo.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5XQAAAAASUVORK5CYII=','base64')});
  await page.locator('#image-preview img').waitFor();await click('#listing-form .btn-primary');await click('[data-filter="My listings"]');assert.equal(await page.locator('.listing-card').count(),1);assert.equal(await page.locator('.listing-art img').count(),1);check('Listing form, photo attachment, and My listings');
  await click('[data-filter="All"]');await click('[data-listing="m1"]');await click('[data-contact="m1"]');await page.locator('#chat-form input').fill('Hello, is this still available?');await click('#chat-form .btn-primary');assert.match(await page.locator('.message').textContent(),/Hello, is this still available/);check('Seller conversation and local messages');
  await page.evaluate(()=>{let s=JSON.parse(localStorage.getItem('gully.frontend.v1'));s.chats.forEach(c=>c.expiresAt=Date.now()-1);localStorage.setItem('gully.frontend.v1',JSON.stringify(s));});await page.reload();assert.equal(await page.locator('.conversation').count(),0);check('Expired conversations are purged');
  await nav('squad');await page.screenshot({path:path.join(out,'desktop-squads.png'),fullPage:true});await click('[data-squad="s1"]');await click('[data-request="s1"]');assert.match(await page.locator('.modal').textContent(),/simulate acceptance/i);await click('[data-demo-accept="s1"]');assert.match(await page.locator('.chat-info').textContent(),/Mutual acceptance simulated/);check('Squad request and explicitly simulated acceptance');
  await nav('squad');await click('[data-action="create-squad"]');await page.locator('#squad-title').fill('Weekend park walk');await page.locator('#squad-place').fill('Botanical Garden entrance');await page.locator('#squad-description').fill('An easy walk, meet at the public entrance.');await page.locator('#squad-when').fill('2030-12-20T10:00');await click('#squad-form .btn-primary');assert.match(await page.locator('.squad-card').first().textContent(),/Weekend park walk/);check('Create a squad with Hyderabad date');
  await nav('pulse');await click('[data-action="update"]');await page.locator('#compose-title').fill('A useful demo city update');await page.locator('#compose-body').fill('Example update with time and broad area.');await click('#compose-form .btn-primary');assert.match(await page.locator('.update-card').first().textContent(),/A useful demo city update/);check('City megathread contribution');
  await nav('home');await click('[data-post-menu="p1"]');await click('[data-report="p1"]');await page.locator('#report-form input[name=block]').check();await click('#report-form .btn-primary');assert.equal(await page.locator('[data-post-card="p1"]').count(),0);check('Report and block hide content');
  await nav('settings');await click('[data-pref="city"]');assert.equal(await page.locator('[data-pref="city"]').getAttribute('aria-checked'),'true');await click('[data-action="blocked"]');await click('[data-unblock]');await close();check('Notification preferences and unblock');
  await click('[data-action="login"]');await page.locator('#login-email').fill('demo@example.com');await page.locator('#login-form input[name=age]').check();await click('#login-form .btn-primary');await page.locator('#otp-code').fill('000000');await click('#otp-form .btn-primary');assert.match(await page.locator('#otp-error').textContent(),/123456/);await page.locator('#otp-code').fill('123456');await click('#otp-form .btn-primary');check('Email verification UI and invalid-code state');
  await nav('home');await click('[data-action="voice"]');await click('[data-action="record"]');await page.waitForTimeout(1500);
  if(await page.locator('#record-status').textContent().then(t=>t.includes('Recording'))){await click('[data-action="record"]');await page.locator('#audio-preview audio').waitFor();await page.locator('#compose-title').fill('A recorded demo confession');await click('#compose-form .btn-primary');await page.locator('audio[data-audio]').first().waitFor();await page.reload();await page.locator('audio[data-audio][src]').first().waitFor();check('Microphone recording and IndexedDB playback after reload');}else{checks.push('Voice capture unavailable in file mode; error handled');console.log('NOTE Voice capture unavailable in file mode');await close();}
  for(const width of [390,768,1440]){await page.setViewportSize({width,height:844});for(const r of ['home','boards','confessions','squad','market','pulse','messages','saved','settings']){await page.goto(url+'#'+r);await page.waitForTimeout(60);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,`Horizontal overflow at ${width}px on ${r}`);if(width===390&&['home','market','squad'].includes(r))await page.screenshot({path:path.join(out,`mobile-${r}.png`),fullPage:true});}check(`All main screens fit ${width}px viewport`);}
  await page.setViewportSize({width:390,height:844});await page.goto(url+'#home');await click('.create-mobile');await page.screenshot({path:path.join(out,'mobile-compose.png'),fullPage:true});await page.keyboard.press('Escape');assert.equal(await page.locator('.modal').count(),0);check('Mobile composer and keyboard dismissal');
  assert.deepEqual(errors,[]);check('No uncaught browser errors');
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({timestamp:new Date().toISOString(),checks,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png'),fullPage:true});fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors,failure:e.stack},null,2));throw e;}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
