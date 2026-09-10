/* ============================================================
   config.js — the three settings Dr Mompel changes.
   ============================================================ */
window.LAB_CONFIG = {

  /* Where a finished student's submission is sent.
     Paste the /exec URL of your deployed Apps Script web app here.
     Leave it empty and the app still works — students get a completion
     code to paste into Google Classroom instead. */
  submitUrl: 'https://script.google.com/macros/s/AKfycbzwjMHaa88OL_GzR8wZ2mV6a8rs1CKYahbW5iOTQPyzWzCGIrAZPApGsP2oujK34tRc/exec',

  /* Shown on the submission form so you can tell classes apart. */
  syllabusTopics: ['6', '8', '14.5', '16.3', '18.2'],   /* the topics this lab teaches: they come first when the syllabus is opened from the badge */
  classes: ['9A', '9B', '9C', '9D', '9E', 'Other'],

  /* The potometer keeps every run a student records, but shows its table and graph only when
     this word is typed in — so a class draws its own table and graph first, and you decide when
     to reveal the page's. What is stored is a fingerprint of the word, not the word, so a student
     reading this file learns nothing. To change it:
        node tools/unlock-hash.mjs "your new word"
     and paste the line it prints here. Leave it empty ('') and the table shows without a word. */
  potometerUnlock: 'c599a5e17676c3871dbd0ef1900232d5bbfc560197f64992b63d21ef932f1561',

  /* Signing in, so a hand-in can be attributed.

     These labs are public: anyone in the world can use one, and should. But only your own
     students' results should reach your spreadsheet, so a hand-in is recorded when the
     Google account that signed in is on your Students tab, and ignored otherwise. Everyone
     still gets their completion code on screen.

     A Client ID is a name-tag for your app, issued by Google — not a secret, and visible
     in this file on purpose. This page uses it to ask Google for a sign-in; the Apps Script
     uses the SAME id to check the token it gets back was made for your app and not somebody
     else's. Paste it in both places (it ends .apps.googleusercontent.com). Leave it empty
     and nothing is recorded anywhere — the lab still works, and everyone still gets a code.

     To make one: console.cloud.google.com ▸ pick or make a project ▸ Google Auth Platform ▸
     Branding (fill this in first — Google will not issue an id without it) ▸ Audience ▸
     Publish app ▸ Credentials ▸ Create credentials ▸ OAuth client ID ▸ Web application,
     with https://mompel226.github.io as an authorised JavaScript origin — no path, no
     trailing slash.

     The full version is in the hub README, under "Sign-in: what the Client ID is". */
  googleClientId: '749068441640-jgh9s0rbg8ed9hl14mtv6kdhg5jg6ddf.apps.googleusercontent.com',
};
