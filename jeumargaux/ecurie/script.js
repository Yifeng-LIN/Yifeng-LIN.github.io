// ===== Centre Équestre de Margaux =====
// Déplacement libre aux flèches. On entre dans un box (E) pour seller (S),
// puis on monte (M) et on dirige le cheval au pas/trot/galop (P/T/G).
// On peut aussi mettre le licol (L) pour mener le cheval au pré ou en balade.

// ---- Caractères possibles ----
// fugue = tendance à s'enfuir quand on le mène au licol sans l'attacher (0 = jamais)
const CARACTERES = {
  energique: { trait: "⚡", texte: "énergique", fugue: 0 },
  gourmand:  { trait: "🍎", texte: "gourmand",  fugue: 0 },
  caline:    { trait: "🥰", texte: "câline",    fugue: 0 },
  calme:     { trait: "😌", texte: "calme",     fugue: 0 },
  joueur:    { trait: "🎈", texte: "joueur",    fugue: 1 },
  peureux:   { trait: "😨", texte: "peureux",   fugue: 2 },
  fugueur:   { trait: "🏃", texte: "fugueur",   fugue: 3 },
};

// ---- Les 10 chevaux ----
const chevaux = [
  { nom: "Éclair",   emoji: "🐴", car: "energique" },
  { nom: "Caramel",  emoji: "🐎", car: "gourmand"  },
  { nom: "Bella",    emoji: "🦄", car: "caline"    },
  { nom: "Tonnerre", emoji: "🐴", car: "fugueur"   },
  { nom: "Praline",  emoji: "🐎", car: "calme"     },
  { nom: "Réglisse", emoji: "🐴", car: "joueur"    },
  { nom: "Étoile",   emoji: "🦄", car: "peureux"   },
  { nom: "Câlin",    emoji: "🐎", car: "caline"    },
  { nom: "Vanille",  emoji: "🐴", car: "gourmand"  },
  { nom: "Ouragan",  emoji: "🐎", car: "fugueur"   },
];
chevaux.forEach(c => {
  c.faim = 60; c.energie = 80; c.bonheur = 60;
  c.selle = false; c.licol = false; c.attache = false; c.poteau = -1;
  c.lieu = "box"; // "box" | "pre" | "avec-toi" | "attache"
});
function carDe(c) { return CARACTERES[c.car]; }

// ---- État du jeu ----
let coeurs = 0;
const perso = { x: 120, y: 380 };      // position sur la carte
let mode = "pied";                      // "pied" | "dansBox" | "monte" | "licol"
let chevalActif = null;                 // index du cheval géré
let allure = "pas";                     // "pas" | "trot" | "galop"
const touches = {};                     // flèches enfoncées

// parcours chronométré + compteur de sauts
let sautsReussis = 0;
let parcoursActif = false;
let parcoursDebut = 0;
let parcoursFaits = 0;
let record = null;
try { const r = localStorage.getItem("recordParcours"); if (r) record = parseFloat(r); } catch (e) {}

// ---- Géométrie de la carte (doit coller au CSS) ----
const SCENE_W = 1000, SCENE_H = 700;
const ECURIE = { left: 8, top: 484, width: 984, height: 208, pad: 10, gap: 6 };
const NB = 10;
const BOX_W = (ECURIE.width - 2 * ECURIE.pad - (NB - 1) * ECURIE.gap) / NB;

// zones (mêmes rectangles que le CSS)
const ZONES = {
  foret:   { l: 8,   t: 8,   r: 330, b: 300 },
  terrain: { l: 338, t: 8,   r: 662, b: 300 },
  pre:     { l: 670, t: 8,   r: 992, b: 300 },
};

// mur de l'écurie : on ne peut pas descendre plus bas quand on marche
const MUR_BAS = 470;

// obstacles à sauter sur le terrain d'entraînement
const obstacles = [
  { x: 420, y: 90 },
  { x: 560, y: 150 },
  { x: 450, y: 220 },
  { x: 600, y: 250 },
];

// poteaux d'attache dans la cour
const poteaux = [
  { x: 180, y: 350 },
  { x: 500, y: 350 },
  { x: 820, y: 350 },
];

// rivières à franchir dans la forêt (bandes horizontales)
const FORET_X1 = 16, FORET_X2 = 322;
const rivieres = [
  { yTop: 100, yBot: 132 },
  { yTop: 210, yBot: 242 },
];
function centreRiviere(r) { return (r.yTop + r.yBot) / 2; }
function dansRiviere(x, y) {
  if (x < FORET_X1 || x > FORET_X2) return false;
  return rivieres.some(r => y > r.yTop && y < r.yBot);
}

// ---- Éléments ----
const scene = document.getElementById("scene");
const ecurieEl = document.getElementById("ecurie");
const persoEl = document.getElementById("perso");
const bulle = document.getElementById("persoBulle");
const scoreCoeurs = document.getElementById("scoreCoeurs");
const nomPersoInput = document.getElementById("nomPerso");
const hudCheval = document.getElementById("hudCheval");
const hudJauges = document.getElementById("hudJauges");
const hudEtat = document.getElementById("hudEtat");
const sautsCountEl = document.getElementById("sautsCount");
const parcoursInfoEl = document.getElementById("parcoursInfo");
const chronoEl = document.getElementById("chrono");
const recordEl = document.getElementById("record");
const btnParcours = document.getElementById("btnParcours");

// ---- Construire les box ----
function construireEcurie() {
  ecurieEl.innerHTML = "";
  chevaux.forEach((c, i) => {
    const box = document.createElement("div");
    box.className = "box";
    box.id = "box-" + i;
    box.innerHTML = `
      <span class="badge" id="badge-${i}"></span>
      <span class="cheval-emoji" id="emoji-${i}">${c.emoji}</span>
      <span class="nom">${c.nom}<br><small>${carDe(c).trait} ${carDe(c).texte}</small></span>`;
    ecurieEl.appendChild(box);
    document.getElementById("emoji-" + i).addEventListener("click", () => calin(i));

    // représentation du cheval hors du box (au poteau ou au pré)
    const libre = document.createElement("div");
    libre.className = "cheval-libre";
    libre.id = "libre-" + i;
    libre.textContent = c.emoji;
    libre.hidden = true;
    libre.addEventListener("click", () => clicChevalLibre(i));
    scene.appendChild(libre);
  });
}

// ---- Construire les poteaux ----
function construirePoteaux() {
  poteaux.forEach((p, i) => {
    const el = document.createElement("div");
    el.className = "poteau";
    el.id = "poteau-" + i;
    el.style.left = p.x + "px";
    el.style.top = p.y + "px";
    el.innerHTML = `<span class="poteau-tete">🪢</span>`;
    scene.appendChild(el);
  });
}

// ---- Construire les rivières ----
function construireRivieres() {
  rivieres.forEach((r, i) => {
    const el = document.createElement("div");
    el.className = "riviere";
    el.id = "riviere-" + i;
    el.style.left = FORET_X1 + "px";
    el.style.top = r.yTop + "px";
    el.style.width = (FORET_X2 - FORET_X1) + "px";
    el.style.height = (r.yBot - r.yTop) + "px";
    scene.appendChild(el);
  });
}

// centre horizontal du box i (coordonnées scène)
function boxCentreX(i) {
  return ECURIE.left + ECURIE.pad + i * (BOX_W + ECURIE.gap) + BOX_W / 2;
}
// box devant lequel se trouve la cavalière (ou -1)
function boxDevant() {
  if (perso.y < 320 || perso.y > 500) return -1; // il faut être dans la cour, près de l'écurie
  let best = -1, bestD = 60;
  for (let i = 0; i < NB; i++) {
    const d = Math.abs(perso.x - boxCentreX(i));
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

// poteau le plus proche de la cavalière (ou -1)
function poteauProche(dmax = 70) {
  let best = -1, bestD = dmax;
  poteaux.forEach((p, i) => {
    const d = Math.hypot(perso.x - p.x, perso.y - p.y);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}
// cheval attaché le plus proche (ou -1)
function chevalAttacheProche(dmax = 70) {
  let best = -1, bestD = dmax;
  chevaux.forEach((c, i) => {
    if (c.lieu !== "attache") return;
    const p = poteaux[c.poteau];
    const d = Math.hypot(perso.x - p.x, perso.y - p.y);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}
// position affichée d'un cheval au pré (même calcul que dans dessiner)
function posPre(i) {
  return { x: 700 + (i % 5) * 55, y: 60 + (i % 3) * 70 };
}
// cheval au pré le plus proche (ou -1)
function chevalPreProche(dmax = 80) {
  let best = -1, bestD = dmax;
  chevaux.forEach((c, i) => {
    if (c.lieu !== "pre") return;
    const p = posPre(i);
    const d = Math.hypot(perso.x - p.x, perso.y - p.y);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}
// reprendre un cheval au pré : on lui remet le licol et on le mène
function reprendrePre(i) {
  const c = chevaux[i];
  c.lieu = "avec-toi"; c.licol = true; c.attache = false; c.poteau = -1;
  mode = "licol"; chevalActif = i;
  perso.y = Math.min(Math.max(perso.y, 24), MUR_BAS);
  parler(`Tu remets le licol à ${c.nom} et tu le ramènes. 🪢`);
}

function zoneCourante() {
  for (const [nom, z] of Object.entries(ZONES)) {
    if (perso.x >= z.l && perso.x <= z.r && perso.y >= z.t && perso.y <= z.b) return nom;
  }
  return perso.y > 480 ? "ecurie" : "cour";
}

// ---- Boucle de déplacement ----
function vitesse() {
  if (mode === "monte") return allure === "galop" ? 6.5 : allure === "trot" ? 4 : 2.2;
  return 2.6; // à pied ou en menant
}
function boucle() {
  if (mode !== "dansBox") {
    let dx = 0, dy = 0;
    if (touches["ArrowLeft"]) dx -= 1;
    if (touches["ArrowRight"]) dx += 1;
    if (touches["ArrowUp"]) dy -= 1;
    if (touches["ArrowDown"]) dy += 1;
    if (dx || dy) {
      const v = vitesse();
      if (dx && dy) { dx *= 0.71; dy *= 0.71; }
      const nx = Math.max(24, Math.min(SCENE_W - 24, perso.x + dx * v));
      // collision : on ne traverse pas le mur de l'écurie
      const ny = Math.max(24, Math.min(MUR_BAS, perso.y + dy * v));
      // collision : on ne marche pas dans la rivière (il faut sauter avec Espace)
      if (dansRiviere(nx, ny)) {
        perso.x = nx; // on peut longer la berge horizontalement
      } else {
        perso.x = nx; perso.y = ny;
      }
      effetZone();
      bruitSabots(v);
    }
  }
  dessiner();
  requestAnimationFrame(boucle);
}

// ---- Affichage ----
function dessiner() {
  persoEl.style.left = perso.x + "px";
  persoEl.style.top = perso.y + "px";
  // apparence de la cavalière selon le mode
  let av = "🧑‍🌾";
  if (mode === "monte") av = "🏇";
  else if (mode === "licol" && chevalActif != null) av = "🧑‍🌾" + chevaux[chevalActif].emoji;
  persoEl.textContent = av;

  // box actif (à pied) + box vides (chevaux sortis)
  const devant = mode === "pied" ? boxDevant() : (mode === "dansBox" ? chevalActif : -1);
  chevaux.forEach((c, i) => {
    const box = document.getElementById("box-" + i);
    box.classList.toggle("actif", i === devant || i === chevalActif && mode === "dansBox");
    box.classList.toggle("vide", c.lieu !== "box");
    const emoji = document.getElementById("emoji-" + i);
    emoji.textContent = c.lieu === "box" ? c.emoji : "…";
    document.getElementById("badge-" + i).textContent =
      (c.selle ? "🐎" : "") + (c.licol ? "🪢" : "");

    // cheval au poteau ou au pré
    const libre = document.getElementById("libre-" + i);
    if (c.lieu === "attache" && c.poteau >= 0) {
      libre.hidden = false;
      libre.classList.add("attache");
      libre.style.left = poteaux[c.poteau].x + "px";
      libre.style.top = (poteaux[c.poteau].y - 30) + "px";
    } else if (c.lieu === "pre") {
      libre.hidden = false;
      libre.classList.remove("attache");
      // position fixe et dispersée dans le pré selon l'index
      libre.style.left = (700 + (i % 5) * 55) + "px";
      libre.style.top = (60 + (i % 3) * 70) + "px";
    } else {
      libre.hidden = true;
    }
  });
  majHUD();
  majParcours();
}

function majHUD() {
  scoreCoeurs.textContent = coeurs;
  let i = chevalActif;
  if (i == null && mode === "pied") { const d = boxDevant(); if (d >= 0) i = d; }
  if (i == null) {
    hudCheval.textContent = "Aucun";
    hudJauges.hidden = true;
    hudEtat.textContent = "";
    return;
  }
  const c = chevaux[i];
  hudCheval.innerHTML = c.emoji + " " + c.nom + ` <small>(${carDe(c).trait} ${carDe(c).texte})</small>`;
  hudJauges.hidden = false;
  document.getElementById("hFaim").style.width = c.faim + "%";
  document.getElementById("hEnergie").style.width = c.energie + "%";
  document.getElementById("hBonheur").style.width = c.bonheur + "%";
  let etat = [];
  if (c.selle) etat.push("sellé 🐎");
  if (c.licol) etat.push("licol 🪢");
  if (mode === "monte") etat.push("monté — allure&nbsp;: " + allure);
  if (mode === "licol") etat.push("mené au licol");
  if (c.lieu === "pre") etat.push("au pré 🌿");
  hudEtat.innerHTML = etat.join(" · ") || "au repos";
}

// ---- Messages ----
function parler(msg) {
  const nom = nomPersoInput.value.trim() || "La cavalière";
  bulle.innerHTML = `<strong>${nom}</strong>&nbsp;: ${msg}`;
}
function borne(v) { return Math.max(0, Math.min(100, v)); }
function gagnerCoeur(n = 1) { coeurs += n; }

// clic sur un cheval hors du box (au pré ou au poteau)
function clicChevalLibre(i) {
  const c = chevaux[i];
  if (c.lieu === "pre") {
    if (mode === "pied") { reprendrePre(i); }
    else { parler("Pose ton cheval actuel avant d'en reprendre un autre. 🐎"); }
    return;
  }
  if (c.lieu === "attache") {
    c.bonheur = borne(c.bonheur + 8); gagnerCoeur();
    parler(`${c.nom} apprécie ta caresse au poteau. 🥰 (appuie sur K à côté pour le détacher)`);
    return;
  }
}

function calin(i) {
  if (chevaux[i].lieu !== "box") { parler("Ce cheval n'est pas dans son box. 🐎"); return; }
  chevaux[i].bonheur = borne(chevaux[i].bonheur + 10);
  gagnerCoeur();
  animerCheval(i);
  parler(`${chevaux[i].nom} apprécie ta caresse. 🥰`);
}
function animerCheval(i) {
  const el = document.getElementById("emoji-" + i);
  if (!el) return;
  el.classList.remove("galope"); void el.offsetWidth; el.classList.add("galope");
}
function sauterPerso() { persoEl.classList.remove("saute"); void persoEl.offsetWidth; persoEl.classList.add("saute"); }

// ---- Son des sabots (synthétisé, sans fichier) ----
let audioCtx = null;
function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
}
function clop(volume) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(70, t + 0.06);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(t); osc.stop(t + 0.09);
}
let dernierClop = 0;
function bruitSabots() {
  if (mode !== "monte" || !audioCtx) return;
  const intervalle = allure === "galop" ? 150 : allure === "trot" ? 260 : 520; // ms
  const maintenant = performance.now();
  if (maintenant - dernierClop >= intervalle) {
    dernierClop = maintenant;
    clop(allure === "galop" ? 0.28 : 0.2);
  }
}

// ---- Obstacles à sauter (terrain d'entraînement) ----
function construireObstacles() {
  obstacles.forEach((o, i) => {
    const el = document.createElement("div");
    el.className = "obstacle";
    el.id = "obs-" + i;
    el.textContent = "🚧";
    el.style.left = o.x + "px";
    el.style.top = o.y + "px";
    scene.appendChild(el);
    o.pretJusqu = 0; // horodatage de disponibilité
  });
}
function actionSauter() {
  if (mode !== "monte" && mode !== "licol") { parler("Monte ou mène un cheval pour sauter. 🏇"); return; }
  sauterPerso();

  // 1) franchir une rivière dans la forêt (à cheval ou en main)
  let rTouche = -1, rBest = 55;
  rivieres.forEach((r, i) => {
    if (perso.x < FORET_X1 - 20 || perso.x > FORET_X2 + 20) return;
    const d = Math.abs(perso.y - centreRiviere(r));
    if (d < rBest) { rBest = d; rTouche = i; }
  });
  if (rTouche >= 0) {
    const r = rivieres[rTouche];
    const centre = centreRiviere(r);
    perso.y = perso.y <= centre ? r.yBot + 24 : r.yTop - 24; // on saute de l'autre côté
    perso.y = Math.max(24, Math.min(MUR_BAS, perso.y));
    const c = chevaux[chevalActif];
    c.bonheur = borne(c.bonheur + 4);
    sautsReussis++; majParcours();
    gagnerCoeur(2);
    clop(0.3);
    parler(`Splash évité&nbsp;! Rivière franchie avec ${c.nom}&nbsp;! 💦🏇 +2 ❤️`);
    return;
  }

  // 2) sauter un obstacle du terrain (uniquement à cheval, avec de l'élan)
  if (mode !== "monte") { parler("Approche-toi d'une rivière 💦 pour la franchir."); return; }
  if (allure === "pas") { parler("Prends de l'élan (T ou G) pour sauter&nbsp;! 🏇"); return; }
  const c = chevaux[chevalActif];
  let touche = -1, best = 70;
  obstacles.forEach((o, i) => {
    const d = Math.hypot(perso.x - o.x, perso.y - o.y);
    if (d < best) { best = d; touche = i; }
  });
  if (touche < 0) { parler("Aucun obstacle tout près. Va sur le terrain 🚩."); return; }
  const o = obstacles[touche];
  const maintenant = performance.now();
  if (maintenant < o.pretJusqu) { parler("Cet obstacle vient d'être sauté&nbsp;!"); return; }
  o.pretJusqu = maintenant + 3000;
  const el = document.getElementById("obs-" + touche);
  el.classList.add("saute-ok");
  setTimeout(() => el.classList.remove("saute-ok"), 600);
  c.bonheur = borne(c.bonheur + 6); c.energie = borne(c.energie - 4);
  sautsReussis++;
  gagnerCoeur(3);
  clop(0.3);
  // parcours chronométré : compter cet obstacle
  if (parcoursActif && !o.faitCeParcours) {
    o.faitCeParcours = true;
    parcoursFaits++;
    if (parcoursFaits >= obstacles.length) finirParcours();
    else parler(`Obstacle ${parcoursFaits}/${obstacles.length} sauté&nbsp;! Continue&nbsp;! 🏁`);
  } else {
    parler(`Superbe saut avec ${c.nom}&nbsp;! 🏆 +3 ❤️`);
  }
  majParcours();
}

// ---- Parcours chronométré ----
function formatTemps(ms) { return (ms / 1000).toFixed(1) + " s"; }
function majParcours() {
  sautsCountEl.textContent = sautsReussis;
  recordEl.textContent = record == null ? "—" : formatTemps(record);
  // annulation si on n'est plus à cheval pendant le parcours
  if (parcoursActif && mode !== "monte") {
    parcoursActif = false;
    btnParcours.textContent = "🏁 Départ parcours";
    parcoursInfoEl.innerHTML = "Parcours annulé (tu n'es plus en selle). Réessaie&nbsp;!";
    chronoEl.textContent = "—";
    return;
  }
  if (parcoursActif) {
    chronoEl.textContent = formatTemps(performance.now() - parcoursDebut);
  }
}
function demarrerParcours() {
  if (mode !== "monte") { parler("Monte d'abord un cheval sellé pour faire le parcours&nbsp;! 🏇"); return; }
  parcoursActif = true;
  parcoursDebut = performance.now();
  parcoursFaits = 0;
  obstacles.forEach(o => { o.faitCeParcours = false; o.pretJusqu = 0; });
  btnParcours.textContent = "⏱️ En cours…";
  parcoursInfoEl.innerHTML = "C'est parti&nbsp;! Saute les 4 🚧 au trot ou au galop. 0/4";
  parler("Parcours lancé&nbsp;! Fonce sauter les 4 obstacles&nbsp;! 🏁");
}
function finirParcours() {
  parcoursActif = false;
  const temps = performance.now() - parcoursDebut;
  chronoEl.textContent = formatTemps(temps);
  btnParcours.textContent = "🏁 Départ parcours";
  gagnerCoeur(10);
  let msg = `Parcours terminé en ${formatTemps(temps)}&nbsp;! 🏆 +10 ❤️`;
  if (record == null || temps < record) {
    record = temps;
    try { localStorage.setItem("recordParcours", String(record)); } catch (e) {}
    msg += " 🎉 Nouveau record&nbsp;!";
  }
  parcoursInfoEl.innerHTML = "Bravo&nbsp;! Relance pour battre ton record.";
  parler(msg);
  majParcours();
}

// ---- Attacher / détacher au poteau ----
function actionAttacher() {
  if (mode === "licol") {
    const p = poteauProche();
    if (p < 0) { parler("Approche-toi d'un poteau 🪢 pour attacher le cheval."); return; }
    // poteau déjà occupé ?
    if (chevaux.some(c => c.lieu === "attache" && c.poteau === p)) {
      parler("Ce poteau est déjà occupé&nbsp;! Va à un autre."); return;
    }
    const c = chevaux[chevalActif];
    c.lieu = "attache"; c.poteau = p; c.attache = true;
    parler(`${c.nom} est attaché au poteau. Il ne peut plus s'enfuir&nbsp;! 🪢`);
    gagnerCoeur();
    mode = "pied"; chevalActif = null;
  } else if (mode === "pied") {
    const i = chevalAttacheProche();
    if (i < 0) { parler("Aucun cheval attaché tout près à détacher."); return; }
    const c = chevaux[i];
    c.attache = false; c.lieu = "avec-toi"; c.poteau = -1;
    mode = "licol"; chevalActif = i;
    perso.y = Math.min(perso.y, MUR_BAS);
    parler(`Tu détaches ${c.nom} et le tiens au licol. 🪢`);
  } else {
    parler("Les poteaux servent quand tu mènes un cheval au licol. 🪢");
  }
}

// ---- Fugue : un fugueur non attaché peut s'échapper ----
function fuir(c) {
  const nom = c.nom;
  c.lieu = "box"; c.selle = false; c.licol = false; c.attache = false; c.poteau = -1;
  c.bonheur = borne(c.bonheur - 5);
  mode = "pied"; chevalActif = null; allure = "pas";
  parler(`Oh non&nbsp;! ${nom} s'est échappé et galope jusqu'à son box&nbsp;! 🏃💨 Attache-le la prochaine fois.`);
  clop(0.25);
}

// ---- Effet des zones (balade, entraînement, pré) ----
let dernierEffet = 0, tick = 0;
function effetZone() {
  if (mode !== "monte" && mode !== "licol") return;
  const z = zoneCourante();
  const c = chevaux[chevalActif];
  tick++;
  if (tick - dernierEffet < 40) return; // on espace les effets
  dernierEffet = tick;
  if (z === "foret") {
    c.bonheur = borne(c.bonheur + 3); c.energie = borne(c.energie - 2); c.faim = borne(c.faim - 1);
    gagnerCoeur();
    parler(`Belle balade en forêt avec ${c.nom}&nbsp;! 🌲` + (mode === "monte" ? " (au " + allure + ")" : ""));
  } else if (z === "terrain" && mode === "monte") {
    c.bonheur = borne(c.bonheur + 2); c.energie = borne(c.energie - 3);
    gagnerCoeur();
    parler(`Séance d'entraînement sur le terrain avec ${c.nom}. 🚩`);
  }
}

// ---- Actions clavier ----
function actionEntrerSortir() {
  if (mode === "pied") {
    const i = boxDevant();
    if (i < 0) { parler("Approche-toi d'un box pour entrer. 🚶"); return; }
    if (chevaux[i].lieu !== "box") { parler("Ce box est vide, le cheval est sorti. "); return; }
    mode = "dansBox"; chevalActif = i;
    // se placer dans le box
    perso.x = boxCentreX(i); perso.y = 470;
    parler(`Tu es dans le box de ${chevaux[i].nom}. Appuie sur S pour le seller ou L pour le licol. 🐴`);
  } else if (mode === "dansBox") {
    const c = chevaux[chevalActif];
    if (c.licol) {           // sortir en menant le cheval
      c.lieu = "avec-toi"; mode = "licol";
      perso.y = 400;
      if (carDe(c).fugue > 0)
        parler(`Attention&nbsp;! ${c.nom} est ${carDe(c).texte} ${carDe(c).trait} et aime s'enfuir. Attache-le à un poteau (K)&nbsp;! 🪢`);
      else
        parler(`Tu sors avec ${c.nom} au licol. Va au pré 🌿 ou en balade en forêt 🌲.`);
    } else {                 // sortir seul(e)
      mode = "pied"; chevalActif = null; perso.y = 400;
      parler("Tu sors du box.");
    }
  } else if (mode === "monte" || mode === "licol") {
    // ranger le cheval si on est devant son box
    const i = boxDevant();
    if (i === chevalActif) rentrerCheval();
    else parler("Ramène le cheval devant son box pour le rentrer, ou va au pré 🌿.");
  }
}

function rentrerCheval() {
  const c = chevaux[chevalActif];
  c.lieu = "box"; c.selle = false; c.licol = false;
  parler(`${c.nom} est rentré dans son box. À bientôt&nbsp;! 🐴`);
  mode = "pied"; chevalActif = null; allure = "pas";
}

function actionSeller() {
  if (mode !== "dansBox") { parler("Entre d'abord dans le box (E) pour seller. 🐴"); return; }
  const c = chevaux[chevalActif];
  c.selle = !c.selle;
  parler(c.selle ? `${c.nom} est sellé, prêt à être monté&nbsp;! 🐎` : `Tu enlèves la selle de ${c.nom}.`);
}

function actionLicol() {
  if (mode === "dansBox") {
    const c = chevaux[chevalActif];
    c.licol = !c.licol;
    parler(c.licol ? `Licol mis à ${c.nom}. Sors (E) pour le mener. 🪢` : `Licol enlevé.`);
  } else if (mode === "licol") {
    if (zoneCourante() === "pre") {
      const c = chevaux[chevalActif];
      c.lieu = "pre"; c.licol = false;
      parler(`${c.nom} gambade dans le pré&nbsp;! 🌿 Pour le reprendre&nbsp;: approche-toi et appuie sur L (ou clique dessus).`);
      gagnerCoeur(2);
      mode = "pied"; chevalActif = null;
    } else {
      parler("Emmène le cheval jusqu'au pré 🌿 pour l'y laisser.");
    }
  } else if (mode === "pied") {
    // reprendre un cheval laissé au pré
    const i = chevalPreProche();
    if (i >= 0) { reprendrePre(i); return; }
    parler("Le licol se met dans le box (E puis L), ou approche-toi d'un cheval au pré 🌿 pour le reprendre.");
  } else {
    parler("Tu es déjà avec un cheval.");
  }
}

function actionMonter() {
  if (mode === "dansBox") {
    const c = chevaux[chevalActif];
    if (!c.selle) { parler(`Selle d'abord ${c.nom} (touche S)&nbsp;! 🐎`); return; }
    if (c.energie < 20) { parler(`${c.nom} est trop fatigué pour être monté. 😴`); return; }
    c.lieu = "avec-toi"; mode = "monte"; allure = "pas";
    perso.y = 400;
    sauterPerso();
    parler(`En selle sur ${c.nom}&nbsp;! Dirige avec les flèches, P/T/G pour l'allure. 🏇`);
  } else if (mode === "pied") {
    const i = boxDevant();
    if (i >= 0 && chevaux[i].lieu === "box" && chevaux[i].selle) {
      chevalActif = i; actionMonter();
    } else parler("Entre dans le box et selle le cheval avant de monter. 🐴");
  } else {
    parler("Tu es déjà avec un cheval.");
  }
}

function actionDescendre() {
  if (mode !== "monte") { parler("Tu n'es pas monté. 🚶"); return; }
  const c = chevaux[chevalActif];
  c.licol = true;                 // on garde le cheval en main
  mode = "licol";
  parler(`Tu descends de ${c.nom} et le tiens au licol. 🪢`);
}

function actionNourrir() {
  // nourrit le cheval géré, ou celui devant le box
  let i = (mode === "dansBox" || mode === "monte" || mode === "licol") ? chevalActif : boxDevant();
  if (i == null || i < 0) { parler("Approche-toi d'un cheval pour le nourrir. 🍎"); return; }
  const c = chevaux[i];
  c.faim = borne(c.faim + 30); c.bonheur = borne(c.bonheur + 5);
  gagnerCoeur();
  if (c.lieu === "box") animerCheval(i);
  parler(`Miam&nbsp;! ${c.nom} adore ses pommes. 🍎`);
}

function actionAllure(a) {
  if (mode !== "monte") { parler("Monte un cheval pour changer d'allure. 🏇"); return; }
  const c = chevaux[chevalActif];
  if (a !== "pas" && c.energie < 15) { parler(`${c.nom} est trop fatigué pour accélérer. 😴`); return; }
  allure = a;
  const mots = { pas: "Au pas… tranquille. 🚶", trot: "Au trot&nbsp;! 🏇", galop: "Au galop&nbsp;!! 💨" };
  parler(mots[a] + " " + c.nom);
}

// ---- Clavier ----
document.addEventListener("keydown", (e) => {
  if (document.activeElement === nomPersoInput) return; // on tape le prénom
  initAudio(); // débloque le son au premier appui
  const fleches = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
  if (fleches.includes(e.key)) { touches[e.key] = true; e.preventDefault(); return; }
  if (e.key === " " || e.code === "Space") { actionSauter(); e.preventDefault(); return; }
  const k = e.key.toLowerCase();
  if (k === "e" || e.key === "Enter") { actionEntrerSortir(); e.preventDefault(); }
  else if (k === "s") actionSeller();
  else if (k === "l") actionLicol();
  else if (k === "m") actionMonter();
  else if (k === "d") actionDescendre();
  else if (k === "k") actionAttacher();
  else if (k === "a") actionNourrir();
  else if (k === "p") actionAllure("pas");
  else if (k === "t") actionAllure("trot");
  else if (k === "g") actionAllure("galop");
});
document.addEventListener("keyup", (e) => { touches[e.key] = false; });

// ---- Le temps passe ----
setInterval(() => {
  chevaux.forEach(c => {
    if (c.lieu === "pre") { c.energie = borne(c.energie + 4); c.bonheur = borne(c.bonheur + 1); c.faim = borne(c.faim - 1); }
    else if (c.lieu === "box") { c.energie = borne(c.energie + 2); c.faim = borne(c.faim - 2); }
    if (c.faim < 20) c.bonheur = borne(c.bonheur - 2);
  });
}, 4000);

// ---- Tentatives de fugue ----
setInterval(() => {
  if (mode !== "licol" || chevalActif == null) return;
  const c = chevaux[chevalActif];
  if (c.attache) return;
  const proba = carDe(c).fugue * 0.11; // fugueur ~0.33, peureux ~0.22, joueur ~0.11
  if (proba > 0 && Math.random() < proba) fuir(c);
}, 2500);

// ---- Démarrage ----
construireEcurie();
construireObstacles();
construirePoteaux();
construireRivieres();
majParcours();
btnParcours.addEventListener("click", () => { initAudio(); demarrerParcours(); scene.focus(); });
scene.focus();
scene.addEventListener("click", () => { scene.focus(); initAudio(); });
requestAnimationFrame(boucle);
parler("Bienvenue&nbsp;! Approche-toi d'un box et appuie sur E. 🌿");
