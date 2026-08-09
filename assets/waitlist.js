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
    // Formulario web de Odoo (crea el lead en crm.lead)
    endpoint: 'https://www.proyectocaminodesantiago.com/website/form/crm.lead',
    csrfToken: '',                      // opcional: token CSRF de Odoo si tu instancia lo exige
    campaign: 'Lista de espera AURO',   // aparecerá en el nombre del lead
    source: 'Landing prelanzamiento',
    // Equipo de ventas de AURO en Odoo (CRM → Configuración → Equipos de ventas).
    // La compañía del lead NO se puede fijar a mano: crm.lead._compute_company_id
    // la deriva del equipo (equipo > comercial > cliente) y descarta cualquier
    // company_id que la contradiga. Basta con que el equipo sea de AURO.
    // Equipo de ventas: desactivado a propósito. Mandarlo desde el formulario web
    // resultó poco fiable, así que la compañía y el equipo se asignan en Odoo con
    // una regla sobre el lead ya creado. Aquí solo van campos seguros.
    teamId: null,
    // ID del idioma en Odoo (res.lang). Se envía en crm.lead.lang_id para que
    // las plantillas de correo salgan automáticamente en el idioma del contacto.
    langIds: { es: 83, en: 22, de: 33 }
  };

  // Etiquetas legibles y códigos de Odoo (res.lang) por idioma de la web
  var LANG_INFO = {
    es: { label: 'Español',  odoo: 'es_ES' },
    en: { label: 'English',  odoo: 'en_US' },
    de: { label: 'Deutsch',  odoo: 'de_DE' }
  };

  /* ---------- idioma en el que se está leyendo la web ---------- */
  function currentLang() {
    // 1) i18n.js ya resuelve carpeta /es/ /en/, ?lang=, preferencia guardada y navegador
    try {
      if (window.AuroI18n && window.AuroI18n.lang) return window.AuroI18n.lang;
    } catch (e) {}
    // 2) Respaldos por si i18n.js no ha cargado
    var m = location.pathname.match(/\/(es|en|de)\//);
    if (m) return m[1];
    try {
      var qp = (new URLSearchParams(location.search)).get('lang');
      if (qp && LANG_INFO[qp.toLowerCase()]) return qp.toLowerCase();
    } catch (e) {}
    try {
      var saved = localStorage.getItem('auro_lang');
      if (saved && LANG_INFO[saved]) return saved;
    } catch (e) {}
    var htmlLang = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
    if (LANG_INFO[htmlLang]) return htmlLang;
    var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || '').slice(0, 2).toLowerCase();
    return LANG_INFO[nav] ? nav : 'de';
  }

  var LS_KEY = 'auro_waitlist_leads';
  var WAITLIST_BASE = 200;   // inscritos de partida. Edítalo cuando quieras.
  var PER_DAY = 3;           // ritmo de altas simuladas por día
  var WL_COUNT_KEY = 'auro_wl_count_v2'; // v2: cache-bust para descartar valores obsoletos

  /* ---------- referidos ---------- */
  // Código de referido propio (estable en este navegador)
  function myRefCode() {
    var c = null;
    try { c = localStorage.getItem('auro_ref_me'); } catch (e) {}
    if (!c) {
      c = (Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 5)).toUpperCase().slice(0, 7);
      try { localStorage.setItem('auro_ref_me', c); } catch (e) {}
    }
    return c;
  }
  // Captura ?ref= de la URL (quién te ha invitado) y lo recuerda
  function incomingRef() {
    try {
      var u = new URLSearchParams(location.search).get('ref');
      if (u) { u = u.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32); if (u) localStorage.setItem('auro_ref_in', u); }
      return localStorage.getItem('auro_ref_in') || '';
    } catch (e) { return ''; }
  }
  incomingRef(); // se ejecuta al cargar la página para capturar el ?ref

  // Número de lata reservada. Clave v2 para descartar valores de la fórmula vieja.
  var CAN_KEY = 'auro_can_no_v2';

  // Asigna un número NUEVO para el alta que se está enviando y deja el contador
  // del formulario en ese mismo valor. Se llama una sola vez por envío: si no se
  // recalculase, un segundo registro desde el mismo navegador repetiría el número
  // de la primera vez mientras el contador de la landing sí avanza.
  function assignCanNumber() {
    var local = 0;
    try { local = (JSON.parse(localStorage.getItem(LS_KEY) || '[]')).length; } catch (e) {}
    var START = Date.UTC(2026, 7, 1);
    var days = Math.max(0, (Date.now() - START) / 86400000);
    var n = WAITLIST_BASE + Math.floor(days * PER_DAY) + local + 1;  // +1: el alta en curso
    var cached = 0;
    try { cached = parseInt(localStorage.getItem(WL_COUNT_KEY), 10) || 0; } catch (e) {}
    n = Math.max(n, cached + 1);   // monótono: nunca retrocede
    try {
      localStorage.setItem(CAN_KEY, String(n));
      localStorage.setItem(WL_COUNT_KEY, String(n));
    } catch (e) {}
    return n;
  }

  // Lee el número ya asignado (lo usa el envío a Odoo). Solo asigna si falta.
  function myCanNumber() {
    var n = 0;
    try { n = parseInt(localStorage.getItem(CAN_KEY), 10) || 0; } catch (e) {}
    return n || assignCanNumber();
  }

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

    var mine = myRefCode();
    var ref = incomingRef();
    var can = myCanNumber();
    var lg = currentLang();
    var info = LANG_INFO[lg] || LANG_INFO.de;

    // `extras` = campos que Odoo puede rechazar según cómo esté configurado
    // (equipo de ventas e idioma). El lead básico nunca depende de ellos.
    function buildForm(extras) {
      var fd = new FormData();
      fd.append('email_from', email);
      fd.append('contact_name', name || email);
      fd.append('name', '[' + lg.toUpperCase() + '] ' + ODOO.campaign + ' — ' + (name || email));
      fd.append('description',
        'Alta en la lista de espera (prelanzamiento AURO).\n' +
        'Origen: ' + ODOO.source + '\n' +
        'Idioma de lectura: ' + info.label + ' (' + lg + ' · ' + info.odoo + ')\n' +
        'Página: ' + location.pathname + '\n' +
        'Puesto en la lista: Nº ' + can + ' (las primeras 1.000 se llevan la cosecha numerada)\n' +
        'Código de referido propio: ' + mine +
        (ref ? ('\nInvitado por (ref): ' + ref) : ''));
      if (extras) {
        // Equipo de ventas: de él cuelga la compañía del lead.
        if (ODOO.teamId) fd.append('team_id', String(ODOO.teamId));
        // Idioma real del lead (crm.lead.lang_id), si está permitido en el formulario.
        if (ODOO.langIds && ODOO.langIds[lg]) fd.append('lang_id', String(ODOO.langIds[lg]));
      }
      if (ODOO.csrfToken) fd.append('csrf_token', ODOO.csrfToken);
      return fd;
    }

    // Un envío. Marca `rejected` cuando Odoo ha CONTESTADO rechazando: en ese
    // caso no ha creado nada y se puede repetir sin riesgo de duplicar el lead.
    function post(extras) {
      return fetch(ODOO.endpoint, { method: 'POST', body: buildForm(extras), mode: 'cors' })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (data) {
            var bad = null;
            if (!r.ok) bad = 'HTTP ' + r.status;
            else if (data && data.error_fields && data.error_fields.length) bad = 'campos rechazados: ' + data.error_fields.join(', ');
            else if (data && data.error) bad = String(data.error);
            if (bad) { var e = new Error(bad); e.rejected = true; throw e; }
            return data;
          });
        });
    }

    function withTimeout(p) {
      return Promise.race([p, new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error('timeout')); }, 7000);
      })]);
    }

    // Si Odoo rechaza el equipo o el idioma, se reintenta sin ellos para que el
    // lead entre igualmente. Ante un fallo de red NO se reintenta: el POST puede
    // haber llegado y repetirlo crearía un lead duplicado.
    return withTimeout(post(true)).catch(function (err) {
      if (!err || !err.rejected) throw err;
      console.warn('[AURO] Odoo rechazó los campos opcionales, reintento sin ellos:', err.message);
      return withTimeout(post(false));
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
    var honey   = document.getElementById('wlCompany'); // honeypot anti-bots
    var loadedAt = Date.now();                          // marca de tiempo para el "time trap"

    function showError(msg) { errEl.textContent = msg; errEl.hidden = false; }
    function clearError() { errEl.textContent = ''; errEl.hidden = true; }

    // El botón solo se habilita si se acepta la política de privacidad
    function syncConsent() { submit.disabled = !consent.checked; }
    consent.addEventListener('change', syncConsent);
    syncConsent();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError();

      var em = (email.value || '').trim();
      var nm = (name.value || '').trim();

      // Anti-bots (honeypot): si el campo señuelo trae valor, es un bot.
      // Simulamos éxito sin enviar nada a Odoo ni guardar el registro.
      if (honey && honey.value) { goThanks(nm); return; }

      // Anti-bots (time trap): los bots rellenan y envían en milisegundos.
      // Un humano tarda en escribir el email y marcar el consentimiento.
      if (Date.now() - loadedAt < 2000) { goThanks(nm); return; }

      if (!isEmail(em)) { showError('Introduce un email válido.'); email.focus(); return; }
      if (!consent.checked) { showError('Necesitamos tu consentimiento para poder avisarte.'); return; }

      submit.disabled = true;
      var original = submit.textContent;
      submit.textContent = 'Enviando…';

      myRefCode();        // garantiza el código de referido para la página de gracias
      assignCanNumber();  // número de lata de ESTE alta; deja el contador en el mismo valor

      // Copia local SIEMPRE (aunque Odoo falle, no perdemos el registro)
      saveLocal({ email: em, name: nm, ref: incomingRef() || '', ts: new Date().toISOString() });

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

  /* ---------- contador de plazas (sube al apuntarse) ---------- */
  (function initCounter() {
    var el = document.getElementById('wlCount');
    if (!el) return;
    var local = 0;
    try { local = (JSON.parse(localStorage.getItem(LS_KEY) || '[]')).length; } catch (e) {}

    // Crecimiento suave con el tiempo (simulado) + altas locales reales.
    // Se cachea en el navegador y es MONÓTONO: solo sube, nunca baja al recargar.
    var START = Date.UTC(2026, 7, 1);                 // fecha de referencia (1 ago 2026)
    var PER_DAY = 3;                                   // ritmo de altas simuladas por día
    var days = Math.max(0, (Date.now() - START) / 86400000);
    var grown = WAITLIST_BASE + Math.floor(days * PER_DAY) + local;

    var cached = 0;
    try { cached = parseInt(localStorage.getItem(WL_COUNT_KEY), 10) || 0; } catch (e) {}
    var target = Math.max(grown, cached, WAITLIST_BASE);
    try { localStorage.setItem(WL_COUNT_KEY, String(target)); } catch (e) {}

    function fmt(n) { return Math.round(n).toLocaleString('es-ES'); }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(target); return; }
    var from = Math.max(0, target - 40), t0 = null, dur = 1200;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (target - from) * p);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
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
