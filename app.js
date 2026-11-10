// Web care landing page: mock-up loader + contact form. No trackers, no cookies.
(function () {
  var C = window.CFG || {};
  var q = new URLSearchParams(location.search);
  var slug = (q.get('lead') || '').toLowerCase();

  // Mock-up: ?lead=<slug> → m/<slug>-desktop.jpg + m/<slug>-mobile.jpg (slug = [a-z0-9-] only)
  if (/^[a-z0-9-]{2,60}$/.test(slug) && document.getElementById('mock-lead')) {
    var desk = document.getElementById('mock-desk');
    var mob = document.getElementById('mock-mob');
    var name = slug.replace(/-/g, ' ');
    desk.onload = function () {
      document.getElementById('mock-generic').hidden = true;
      document.getElementById('mock-lead').hidden = false;
      document.getElementById('mock-intro').textContent =
        'Here is the refreshed look I sketched for ' + name + '. It is a mock-up: nothing on your live site has changed.';
      if (location.hash !== '#mockup') document.getElementById('mockup').scrollIntoView();
    };
    mob.onerror = function () { mob.closest('figure').hidden = true; };
    desk.src = 'm/' + slug + '-desktop.jpg';
    mob.src = 'm/' + slug + '-mobile.jpg';
    var lf = document.getElementById('lead-field');
    if (lf) lf.value = slug;
  }

  // Contact form: POST JSON to CONTACT_ENDPOINT; without one, fall back to an email draft.
  var f = document.getElementById('contact-form');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = document.getElementById('form-note');
    var d = Object.fromEntries(new FormData(f).entries());
    if (d._gotcha) return;
    if (!C.CONTACT_ENDPOINT) {
      location.href = 'mailto:' + C.EMAIL + '?subject=' + encodeURIComponent('Website care: ' + (d.website || d.name)) +
        '&body=' + encodeURIComponent(d.message + '\n\n' + d.name + '\n' + d.website);
      return;
    }
    note.textContent = 'Sending…';
    fetch(C.CONTACT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) })
      .then(function (r) { if (!r.ok) throw 0; f.reset(); note.textContent = 'Thanks, it’s with me. I’ll reply by email.'; })
      .catch(function () { note.textContent = 'That didn’t go through. Please email ' + C.EMAIL + ' instead.'; });
  });

  // Unsubscribe page: ?t=<token> from the email link, or an address typed in.
  var u = document.getElementById('unsub-form');
  if (u) {
    var msg = document.getElementById('unsub-note');
    var send = function (body) {
      if (!C.UNSUBSCRIBE_ENDPOINT) { msg.textContent = 'Please email ' + C.EMAIL + ' with the word "stop" and you will not hear from me again.'; return; }
      msg.textContent = 'Removing you…';
      fetch(C.UNSUBSCRIBE_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { if (!r.ok) throw 0; u.hidden = true; msg.textContent = 'Done. You will not receive any more emails from me.'; })
        .catch(function () { msg.textContent = 'Something failed. Email ' + C.EMAIL + ' with "stop" and I will remove you by hand today.'; });
    };
    var t = q.get('t');
    if (t && /^[A-Za-z0-9_-]{8,128}$/.test(t)) send({ token: t });
    u.addEventListener('submit', function (e) { e.preventDefault(); send({ email: u.email.value.trim() }); });
  }
})();
