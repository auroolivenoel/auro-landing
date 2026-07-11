/* ============================================================
   AURO — Lista de espera + cuenta atrás.
   1) Captura el registro y crea un LEAD en Odoo (crm.lead).
   2) Guarda siempre una copia local (localStorage) por seguridad.
   3) Redirige a la página de gracias (gracias.html) con animación.
   4) Cuenta atrás real en el footer hasta la primera cosecha.
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     CONFIG ODOO  ·  ← EDITA ESTO
     ----------------------------------------------------------
     Pega en `endpoint` la URL que recibe el lead. Dos opciones:

       A) Formulario web de Odoo (si la web y Odoo comparten dominio,
          o tienes CORS/CSRF configurados):
          https://TU-EMPRESA.odoo.com/website/form/crm.lead

       B) Proxy serverless (recomendado para webs estáticas como
          GitHub Pages; guarda la API key en secreto en el servidor):
          https://tu-proxy.workers.dev/lead

     Si lo dejas VACÍO, la web funciona igual en "modo local":
     guarda los registros en el navegador (los puedes exportar con
     window.auroExportLeads() desde la consola) y lleva a gracias.html.
     ---------------------------------------------------------- */
  var ODOO = {
    endpoint: '',                       // ← pega aquí tu URL (A o B)
    csrfToken: '',                      // opcional: token CSRF de Odoo si tu instancia lo exige
    campaign: 'Lista de espera AURO',   // aparecerá en el nombre del lead
    source: 'Landing prelanzamiento'
  };

  var LS_KEY = 'auro_waitlist_leads';

  /* ---------- utilidades ---------- */
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function pad(x) { return (x < 10 ? '0' : '') + x; }

  function saveLocal(lead) {
    try {
      var arr = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
      arr.push(lead);
      localStorage.setItem(LS_KEY, JSON.stringify(arr));
    } catch (e) { /* almacenamiento no disponible: seguimos igual */ }
  }

  // Exporta los registros locales a CSV (útil durante la puesta en marcha)
  window.auroExportLeads = function () {
    var arr = [];
    try { arr = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) {}
    if (!arr.length) { console.log('[AURO] No hay registros locales.'); return; }
    var rows = [['email', 'nombre', 'fecha']].concat(arr.map(function (l) {
      return [l.email || '', l.name || '', l.ts || ''];
    }));
    var csv = rows.map(function (r) {
      return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');
    var a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'auro_leads.csv';
    a.click();
  };

  /* ---------- envío a Odoo ---------- */
  function sendToOdoo(email, name) {
    if (!ODOO.endpoint) return Promise.resolve({ local: true }); // modo local

    var fd = new FormData();
    fd.append('email_from', email);
    fd.append('contact_name', name || email);
    fd.append('name', ODOO.campaign + ' — ' + (name || email));
    fd.append('description',
      'Alta en la lista de espera (prelanzamiento AURO).\n' +
      'Origen: ' + ODOO.source + '\n' +
      'Regalo prometido: acceso a la IA de recetas.');
    if (ODOO.csrfToken) fd.append('csrf_token', ODOO.csrfToken);

    return fetch(ODOO.endpoint, { method: 'POST', body: fd, mode: 'cors' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json().catch(function () { return {}; });
      });
  }

  function goThanks(name) {
    try { sessionStorage.setItem('auro_name', name || ''); } catch (e) {}
    window.location.href = 'gracias.html';
  }

  /* ---------- formulario ---------- */
  (function initForm() {
    var form = document.getElementById('waitlistForm');
    if (!form) return;

    var email   = document.getElementById('wlEmail');
    var name    = document.getElementById('wlName');
    var consent = document.getElementById('wlConsent');
    var submit  = document.getElementById('wlSubmit');
    var errEl   = document.getElementById('wlError');

    function showError(msg) { errEl.textContent = msg; errEl.hidden = false; }
    function clearError() { errEl.textContent = ''; errEl.hidden = true; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError();

      var em = (email.value || '').trim();
      var nm = (name.value || '').trim();

      if (!isEmail(em)) { showError('Introduce un email válido.'); email.focus(); return; }
      if (!consent.checked) { showError('Necesitamos tu consentimiento para poder avisarte.'); return; }

      submit.disabled = true;
      var original = submit.textContent;
      submit.textContent = 'Enviando…';

      // Copia local SIEMPRE (aunque Odoo falle, no perdemos el registro)
      saveLocal({ email: em, name: nm, ts: new Date().toISOString() });

      sendToOdoo(em, nm)
        .then(function () { goThanks(nm); })
        .catch(function (err) {
          // El lead ya está guardado localmente → seguimos a la página de gracias
          console.warn('[AURO] Odoo no confirmó el lead (guardado en local):', err);
          submit.textContent = original;
          submit.disabled = false;
          goThanks(nm);
        });
    });
  })();

  /* ---------- cuenta atrás (footer) ---------- */
  (function initCountdown() {
    var cd = document.getElementById('countdown');
    if (!cd) return;
    var deadline = new Date(cd.getAttribute('data-deadline')).getTime();
    if (isNaN(deadline)) return;

    var out = {
      days:  cd.querySelector('[data-cd="days"]'),
      hours: cd.querySelector('[data-cd="hours"]'),
      mins:  cd.querySelector('[data-cd="mins"]'),
      secs:  cd.querySelector('[data-cd="secs"]')
    };

    function tick() {
      var diff = deadline - Date.now();
      if (diff < 0) diff = 0;
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      out.days.textContent  = d;
      out.hours.textContent = pad(h);
      out.mins.textContent  = pad(m);
      out.secs.textContent  = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  })();

})();
