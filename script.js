/* ==========================================================================
   ElectroCenter — script.js
   Menu mobile · onglets Solutions · formulaire · coordonnées · animations du hero
   ========================================================================== */

/* ---------------------------------------------------------------------------
   1. CONFIGURATION — modifiez uniquement ce bloc
   Les coordonnées ci-dessous sont reportées automatiquement partout sur le site.
   --------------------------------------------------------------------------- */
const SITE = {
  whatsapp: '2250704051832',          // numéro WhatsApp au format international, sans « + » ni espaces
  phone: '+225 07 04 05 18 32',       // numéro de téléphone affiché
  email: 'contact@electrocenter.ci',
  formEmail: 'support@electrocenter.ci', // adresse qui reçoit les messages du formulaire de contact
  address: "Abidjan, Côte d'Ivoire",  // ex. « Cocody, Abidjan, Côte d'Ivoire »
  hours: "Horaires d'ouverture à préciser", // ex. « Lun – Sam · 8 h – 18 h »

  // Réseaux sociaux : laissez vide ('') pour masquer le lien
  facebook: '',
  instagram: '',
  linkedin: '',

  // Application ECMarket : dès qu'un lien est renseigné, le bouton de téléchargement
  // s'affiche et le badge « Bientôt sur Android et iOS » disparaît
  ecmarketAndroid: '',
  ecmarketIos: ''
};

(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
     2. Coordonnées : liens et textes
     --------------------------------------------------------------------------- */
  function formatWhatsapp(number) {
    const digits = String(number).replace(/\D/g, '');
    const ci = digits.match(/^(225)(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
    return ci ? '+' + ci.slice(1).join(' ') : '+' + digits;
  }

  function applyConfig() {
    const links = {
      whatsapp: SITE.whatsapp ? 'https://wa.me/' + String(SITE.whatsapp).replace(/\D/g, '') : '',
      phone: SITE.phone ? 'tel:' + SITE.phone.replace(/[^+\d]/g, '') : '',
      email: SITE.email ? 'mailto:' + SITE.email : '',
      facebook: SITE.facebook,
      instagram: SITE.instagram,
      linkedin: SITE.linkedin,
      ecmarketAndroid: SITE.ecmarketAndroid,
      ecmarketIos: SITE.ecmarketIos
    };

    const texts = {
      whatsapp: SITE.whatsapp ? formatWhatsapp(SITE.whatsapp) : '',
      phone: SITE.phone,
      email: SITE.email,
      address: SITE.address,
      hours: SITE.hours
    };

    document.querySelectorAll('[data-config-link]').forEach(function (el) {
      const key = el.getAttribute('data-config-link');
      if (!(key in links)) return;
      const url = links[key];
      const hideTarget = el.hasAttribute('data-hide-if-empty') ? el : el.closest('[data-hide-if-empty]');

      if (url) {
        el.setAttribute('href', url);
        if (hideTarget) hideTarget.hidden = false;
      } else if (hideTarget) {
        hideTarget.hidden = true;
      }
    });

    document.querySelectorAll('[data-config-text]').forEach(function (el) {
      const value = texts[el.getAttribute('data-config-text')];
      if (value) el.textContent = value;
    });

    // Liste des réseaux sociaux entièrement masquée si aucun lien n'est renseigné
    document.querySelectorAll('.socials').forEach(function (list) {
      const visible = list.querySelectorAll('li:not([hidden])').length;
      list.hidden = visible === 0;
    });

    // ECMarket : remplace le badge « Bientôt » quand un lien de téléchargement existe
    if (SITE.ecmarketAndroid || SITE.ecmarketIos) {
      document.querySelectorAll('[data-store-fallback]').forEach(function (el) {
        el.hidden = true;
      });
    }
  }

  /* ---------------------------------------------------------------------------
     3. Menu mobile
     --------------------------------------------------------------------------- */
  function initMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    const desktop = window.matchMedia('(min-width: 921px)');
    const onChange = function (mq) { if (mq.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange); // anciens Safari
  }

  /* ---------------------------------------------------------------------------
     4. Onglets Solutions (Buzzer System / ECMarket)
     --------------------------------------------------------------------------- */
  function initTabs() {
    const tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"][data-tab]'));
    if (!tabs.length) return;

    function activate(name, moveFocus) {
      tabs.forEach(function (tab) {
        const selected = tab.getAttribute('data-tab') === name;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
        if (selected && moveFocus) tab.focus();
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activate(tab.getAttribute('data-tab'), false);
      });

      // Navigation au clavier : flèches gauche/droite, Début, Fin
      tab.addEventListener('keydown', function (event) {
        let next = null;
        if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
        if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === 'Home') next = tabs[0];
        if (event.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          event.preventDefault();
          activate(next.getAttribute('data-tab'), true);
        }
      });
    });

    // Liens qui ouvrent directement un onglet (pied de page, bandeau Composants)
    document.querySelectorAll('[data-show-tab]').forEach(function (link) {
      link.addEventListener('click', function () {
        activate(link.getAttribute('data-show-tab'), false);
      });
    });

    // Adresse directe : …/#buzzer ou …/#ecmarket
    function fromHash() {
      const name = window.location.hash.replace('#', '');
      if (tabs.some(function (tab) { return tab.getAttribute('data-tab') === name; })) {
        activate(name, false);
        const section = document.getElementById('solutions');
        if (section) section.scrollIntoView();
      }
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  /* ---------------------------------------------------------------------------
     5. Liens « Demander un devis » : pré-remplit l'objet du formulaire
     --------------------------------------------------------------------------- */
  function initSubjects() {
    const select = document.getElementById('ec-subject');
    if (!select) return;

    document.querySelectorAll('a[href="#contact"][data-subject]').forEach(function (link) {
      link.addEventListener('click', function () {
        const wanted = link.getAttribute('data-subject');
        const option = Array.prototype.find.call(select.options, function (opt) {
          return opt.text === wanted;
        });
        if (option) select.value = option.value;
      });
    });
  }

  /* ---------------------------------------------------------------------------
     6. Formulaire de contact : envoi par e-mail via FormSubmit (formsubmit.co)
     Les messages arrivent à l'adresse SITE.formEmail (section 1), sans quitter
     la page. Sans JavaScript, le formulaire s'envoie quand même, via la page
     FormSubmit. En cas d'échec, le message propose WhatsApp ou l'e-mail.
     --------------------------------------------------------------------------- */
  function initForm() {
    const form = document.querySelector('form[name="contact"]');
    if (!form) return;
    const status = form.querySelector('.form-status');
    const button = form.querySelector('button[type="submit"]');
    const recipient = String(SITE.formEmail || '').trim();

    // Adresse de destination, aussi pour l'envoi sans JavaScript
    if (recipient) form.action = 'https://formsubmit.co/' + recipient;

    function showStatus(kind, html) {
      status.classList.toggle('is-error', kind === 'error');
      status.innerHTML = html;
      status.hidden = false;
    }

    form.addEventListener('submit', function (event) {
      // Pas d'adresse configurée ou navigateur très ancien : envoi classique
      if (!recipient || !window.fetch) return;
      event.preventDefault();
      button.disabled = true;

      // Champs du formulaire → objet { nom, telephone, email, objet, message, … }
      const data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });

      // Objet de l'e-mail reçu, ex. « Site ElectroCenter · Formation · Awa Koné »
      data._subject = 'Site ElectroCenter · ' + (data.objet || 'Nouvelle demande') + (data.nom ? ' · ' + data.nom : '');
      // Permet de répondre directement au visiteur depuis votre messagerie
      if (data.email) data._replyto = data.email;

      fetch('https://formsubmit.co/ajax/' + recipient, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (response) {
          return response.json()
            .catch(function () { return {}; })
            .then(function (json) {
              const ok = response.ok && (json.success === true || json.success === 'true');
              if (!ok) throw new Error(json.message || 'Envoi refusé (' + response.status + ')');
            });
        })
        .then(function () {
          form.reset();
          showStatus('success', '<strong>Merci, votre demande est envoyée.</strong>&nbsp;Nous vous répondons sous 24&nbsp;h.');
        })
        .catch(function (error) {
          // Message technique visible dans la console du navigateur (F12)
          console.warn('Formulaire de contact :', error.message);
          const wa = SITE.whatsapp ? 'https://wa.me/' + String(SITE.whatsapp).replace(/\D/g, '') : '#contact';
          showStatus('error', '<span><strong>L\'envoi n\'a pas abouti.</strong> Réessayez dans un instant, ou écrivez-nous sur <a href="' + wa + '" target="_blank" rel="noopener noreferrer">WhatsApp</a> ou à <a href="mailto:' + recipient + '">' + recipient + '</a>.</span>');
        })
        .finally(function () {
          button.disabled = false;
          status.scrollIntoView({ block: 'nearest' });
        });
    });
  }

  /* ---------------------------------------------------------------------------
     7. Puce 3D : elle s'incline doucement vers la souris
     (sur mobile et pour les visiteurs sans animation, elle reste inclinée et flotte)
     --------------------------------------------------------------------------- */
  function initChip3D() {
    const chip = document.querySelector('.chip-3d');
    const hero = document.querySelector('.hero');
    if (!chip || !hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const BASE_X = 14;   // inclinaison de repos (degrés), identique à styles.css
    const BASE_Y = -16;
    const MAX = 14;      // amplitude maximale autour de la position de repos

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = null;

    function clamp(v) { return Math.max(-1, Math.min(1, v)); }

    function render() {
      // Interpolation douce vers la cible
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      chip.style.setProperty('--rx', (BASE_X + current.x).toFixed(2) + 'deg');
      chip.style.setProperty('--ry', (BASE_Y + current.y).toFixed(2) + 'deg');

      const moving = Math.abs(target.x - current.x) > 0.02 || Math.abs(target.y - current.y) > 0.02;
      frame = moving ? window.requestAnimationFrame(render) : null;
    }

    function start() {
      if (!frame) frame = window.requestAnimationFrame(render);
    }

    hero.addEventListener('pointermove', function (event) {
      const box = chip.getBoundingClientRect();
      const dx = (event.clientX - (box.left + box.width / 2)) / (window.innerWidth / 2);
      const dy = (event.clientY - (box.top + box.height / 2)) / (window.innerHeight / 2);
      target.y = clamp(dx) * MAX;
      target.x = clamp(-dy) * MAX;
      start();
    });

    hero.addEventListener('pointerleave', function () {
      target.x = 0;
      target.y = 0;
      start();
    });
  }

  /* ---------------------------------------------------------------------------
     8. Arrière-plan du hero : réseau de nœuds électroniques
     Les nœuds dérivent, se relient quand ils sont proches, et les liaisons
     s'illuminent autour du curseur. L'animation se met en pause quand le hero
     n'est pas visible ou quand l'onglet est en arrière-plan.
     --------------------------------------------------------------------------- */
  function initHeroNetwork() {
    const canvas = document.querySelector('.hero-canvas');
    const hero = document.querySelector('.hero');
    if (!canvas || !hero || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    // Réglages — modifiez ici l'apparence de l'animation
    const NET = {
      nodeColor: '141, 179, 190',  // points (R, G, B). Cyan de votre version d'origine : '0, 255, 204'
      lineColor: '124, 196, 214',  // liaisons au repos. D'origine : '0, 150, 255'
      glowColor: '170, 214, 226',  // liaisons près du curseur. D'origine : '0, 255, 204'
      density: 9000,               // 1 nœud pour 9 000 px² (plus petit = plus de nœuds)
      maxNodes: 160,               // plafond pour les très grands écrans
      linkDistance: 110,           // distance max pour relier deux nœuds (px)
      mouseRadius: 180,            // rayon d'effet autour du curseur (px)
      speed: 1.2                   // vitesse de dérive
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouse = { x: null, y: null };
    let nodes = [];
    let width = 0;
    let height = 0;
    let running = false;
    let frame = null;
    let onScreen = true;

    function makeNode() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * NET.speed,
        vy: (Math.random() - 0.5) * NET.speed,
        size: Math.random() * 2 + 1.2
      };
    }

    // Le canvas prend la taille du hero, en haute définition sur écrans Retina
    function resize() {
      const box = hero.getBoundingClientRect();
      const newWidth = Math.round(box.width);
      const newHeight = Math.round(box.height);
      if (!newWidth || !newHeight) return;

      const widthChanged = newWidth !== width;
      width = newWidth;
      height = newHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (widthChanged || !nodes.length) {
        // Moins de nœuds sur mobile pour préserver la batterie
        const density = width < 700 ? NET.density * 1.6 : NET.density;
        const count = Math.min(NET.maxNodes, Math.floor((width * height) / density));
        nodes = [];
        for (let i = 0; i < count; i++) nodes.push(makeNode());
      } else {
        // Seule la hauteur change (barre d'adresse mobile) : on garde les nœuds
        nodes.forEach(function (n) { if (n.y > height) n.y = Math.random() * height; });
      }

      if (!running) draw();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const linkSq = NET.linkDistance * NET.linkDistance;
      const mouseSq = NET.mouseRadius * NET.mouseRadius;
      const hasMouse = mouse.x !== null;

      // 1. Les liaisons (« pistes de circuit ») entre nœuds proches
      for (let a = 0; a < nodes.length; a++) {
        const na = nodes[a];
        let nearMouse = false;
        if (hasMouse) {
          const mdx = na.x - mouse.x;
          const mdy = na.y - mouse.y;
          nearMouse = mdx * mdx + mdy * mdy < mouseSq;
        }

        for (let b = a + 1; b < nodes.length; b++) {
          const nb = nodes[b];
          const dx = na.x - nb.x;
          const dy = na.y - nb.y;
          const distSq = dx * dx + dy * dy;
          if (distSq >= linkSq) continue;

          const strength = 1 - Math.sqrt(distSq) / NET.linkDistance;
          if (nearMouse) {
            ctx.strokeStyle = 'rgba(' + NET.glowColor + ',' + Math.min(1, strength * 2.5).toFixed(3) + ')';
            ctx.lineWidth = 1.2;
          } else {
            ctx.strokeStyle = 'rgba(' + NET.lineColor + ',' + (strength * (hasMouse ? 0.3 : 0.22)).toFixed(3) + ')';
            ctx.lineWidth = 0.6;
          }
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        }
      }

      // 2. Les nœuds, par-dessus les liaisons ; plus lumineux près du curseur
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let alpha = 0.55;
        if (hasMouse) {
          const mdx = n.x - mouse.x;
          const mdy = n.y - mouse.y;
          if (mdx * mdx + mdy * mdy < mouseSq) alpha = 1;
        }
        ctx.fillStyle = 'rgba(' + NET.nodeColor + ',' + alpha + ')';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step() {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        // Rebond sur les bords du hero
        if (n.x < 0 || n.x > width) { n.vx *= -1; n.x = Math.max(0, Math.min(width, n.x)); }
        if (n.y < 0 || n.y > height) { n.vy *= -1; n.y = Math.max(0, Math.min(height, n.y)); }
      }
      draw();
      frame = window.requestAnimationFrame(step);
    }

    function start() {
      if (running || reduceMotion || !onScreen || document.hidden) return;
      running = true;
      frame = window.requestAnimationFrame(step);
    }

    function stop() {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      frame = null;
    }

    // Position du curseur, relative au hero (le canvas laisse passer les clics)
    hero.addEventListener('pointermove', function (event) {
      const box = canvas.getBoundingClientRect();
      mouse.x = event.clientX - box.left;
      mouse.y = event.clientY - box.top;
      if (!running) draw();
    });
    hero.addEventListener('pointerleave', function () {
      mouse.x = null;
      mouse.y = null;
      if (!running) draw();
    });

    // Taille : suit le hero
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
    else window.addEventListener('resize', resize);

    // Pause quand le hero sort de l'écran
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) start(); else stop();
      }).observe(hero);
    }

    // Pause quand l'onglet est en arrière-plan
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    resize();
    start();
  }

  /* ---------------------------------------------------------------------------
     9. Année du copyright
     --------------------------------------------------------------------------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* --------------------------------------------------------------------------- */
  applyConfig();
  initMenu();
  initTabs();
  initSubjects();
  initForm();
  initChip3D();
  initHeroNetwork();
  initYear();
})();
