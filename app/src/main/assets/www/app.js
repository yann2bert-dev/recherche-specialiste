window.S = {
  tab:"home", screen:"home", ville:"", code:"", dept:"", lat:null, lon:null, rayon:25,
  poids:{F:30,A:15,P:30,E:25},
  q:{zone:"",type:"",duree:"jours",alertes:[],texte:""},
  suggestions:[], spec:"chir_gen", results:[], current:null, detailTab:"synthese",
  history:[], pins:[], lastSearch:null, apiTests:{}, busy:false, srcNote:""
};
var S = window.S;
var VERSION = "1.3.0";
try { S.history = JSON.parse(localStorage.getItem("rs_hist")||"[]"); } catch(e) {}
try { S.pins = JSON.parse(localStorage.getItem("rs_pins")||"[]"); } catch(e) {}
try { S.lastSearch = JSON.parse(localStorage.getItem("rs_last")||"null"); } catch(e) {}
try { var pw=JSON.parse(localStorage.getItem("rs_poids")||"null"); if(pw&&pw.F!=null) S.poids=pw; } catch(e) {}

var SPEC = {
  chir_gen:"Chirurgie générale / viscérale", chir_vasc:"Chirurgie vasculaire",
  chir_ortho:"Chirurgie orthopédique", chir_cardio:"Chirurgie cardiaque",
  dermato:"Dermatologie", cardio:"Cardiologie", gastro:"Gastro-entérologie",
  gyneco:"Gynécologie-obstétrique", neuro:"Neurologie", ophtalmo:"Ophtalmologie",
  orl:"ORL", pneumo:"Pneumologie", psy:"Psychiatrie", rhumato:"Rhumatologie",
  uro:"Urologie", endocrino:"Endocrinologie", pediatrie:"Pédiatrie", med_gen:"Médecine générale"
};
var RPPS_SF = {
  chir_gen:"Chirurgie générale", chir_vasc:"Chirurgie vasculaire", chir_ortho:"Chirurgie orthopédique",
  chir_cardio:"Chirurgie thoracique", dermato:"Dermatologie", cardio:"Cardiologie",
  gastro:"Gastro-entérologie", gyneco:"Gynécologie", neuro:"Neurologie", ophtalmo:"Ophtalmologie",
  orl:"Oto-rhino", pneumo:"Pneumologie", psy:"Psychiatrie", rhumato:"Rhumatologie",
  uro:"Chirurgie urologique", endocrino:"Endocrinologie", pediatrie:"Pédiatrie", med_gen:"Médecine Générale"
};
var HAS_SF = {
  chir_gen:"Chirurgie viscérale", chir_vasc:"vasculaire", chir_ortho:"orthopéd",
  chir_cardio:"thoracique", cardio:"Cardiologie", gyneco:"Gynécologie", uro:"Urologie"
};
var VILLES = [
  ["Aix-en-Provence","13001","13",43.5297,5.4474],
  ["Marseille","13055","13",43.2965,5.3698],
  ["Paris","75056","75",48.8566,2.3522],
  ["Lyon","69123","69",45.764,4.8357],
  ["Toulouse","31555","31",43.6047,1.4442],
  ["Bordeaux","33063","33",44.8378,-0.5792],
  ["Lille","59350","59",50.6292,3.0573],
  ["Nantes","44109","44",47.2184,-1.5536],
  ["Nice","06088","06",43.7102,7.262],
  ["Montpellier","34172","34",43.6108,3.8767],
  ["Grenoble","38185","38",45.1885,5.7245]
];
var ZONES = [["peau","Peau / boule / abcès"],["dos","Dos / articulations"],["coeur","Poitrine / cœur / souffle"],["ventre","Ventre / digestion"],["tete","Tête / yeux / oreilles"],["urine","Urines / gynéco"],["moral","Moral / fatigue"]];
var TYPES = {
  peau:[["abces","Abcès, kyste, boule douloureuse"],["eruption","Éruption / démangeaison"]],
  dos:[["abces","Boule / abcès dans le dos"],["douleur","Douleur articulaire ou lombaire"]],
  coeur:[["thorax","Douleur thoracique"],["palp","Palpitations"],["souffle","Essoufflement / toux"]],
  ventre:[["digest","Troubles digestifs"],["reflux","Reflux / brûlures"]],
  tete:[["migraine","Maux de tête"],["vue","Troubles visuels"],["ouie","Baisse d’audition"]],
  urine:[["pipi","Troubles urinaires"],["cycle","Troubles du cycle"]],
  moral:[["anx","Anxiété / moral"],["fievre","Fièvre prolongée"]]
};
var ORIENT = {
  abces:[["chir_gen","Un chirurgien généraliste draine souvent un abcès collecté."],["dermato","Un dermatologue prend en charge un abcès ou kyste cutané."],["med_gen","Un médecin généraliste est le premier recours."]],
  eruption:[["dermato","Un dermatologue prend en charge les lésions de la peau."]],
  douleur:[["rhumato","Un rhumatologue évalue une douleur non traumatique."],["chir_ortho","Un chirurgien orthopédiste si une opération est envisagée."]],
  thorax:[["cardio","Un cardiologue évalue une douleur thoracique."]],
  palp:[["cardio","Un cardiologue évalue les palpitations."]],
  souffle:[["cardio","Cause cardiaque possible."],["pneumo","Cause respiratoire possible."]],
  digest:[["gastro","Un gastro-entérologue prend en charge les troubles digestifs."]],
  reflux:[["gastro","Un gastro-entérologue évalue un reflux."]],
  migraine:[["neuro","Un neurologue évalue des maux de tête persistants."]],
  vue:[["ophtalmo","Un ophtalmologue prend en charge la vision."]],
  ouie:[["orl","Un ORL évalue l’audition."]],
  pipi:[["uro","Un urologue prend en charge les troubles urinaires."]],
  cycle:[["gyneco","Un gynécologue évalue les troubles du cycle."]],
  anx:[["psy","Un psychiatre prend en charge l’anxiété."],["med_gen","Le généraliste est souvent le premier recours."]],
  fievre:[["med_gen","Un médecin généraliste est le premier recours."]]
};
var RID_RPPS = "fffda7e9-0ea2-4c35-bba0-4496f3af935d";
var RID_HAS = "53974cda-7ea5-4716-b82b-56a9138a0a8c";

function fold(s){ return String(s||"").toLowerCase().replace(/[àáâä]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[òóôö]/g,"o").replace(/[ùúûü]/g,"u").replace(/ç/g,"c"); }
function esc(s){
  var t = String(s == null ? "" : s);
  t = t.split("&").join("&#38;");
  t = t.split("<").join("&#60;");
  t = t.split(">").join("&#62;");
  t = t.split('"').join("&#34;");
  return t;
}
function persist(){
  localStorage.setItem("rs_hist", JSON.stringify(S.history.slice(0,50)));
  localStorage.setItem("rs_pins", JSON.stringify(S.pins.slice(0,2)));
  localStorage.setItem("rs_poids", JSON.stringify(S.poids));
  if (S.lastSearch) localStorage.setItem("rs_last", JSON.stringify(S.lastSearch));
}
function cls(n){ return n>=75?"ok":n>=55?"warn":"bad"; }
function lecture(n){ return n>=75?"lecture favorable":n>=55?"lecture prudente":"vigilance"; }
function avg(a){ var x=a.filter(function(v){return v!=null;}); return x.length?x.reduce(function(p,c){return p+c;},0)/x.length:5; }
function logo(){
  return '<div class="topbar"><img src="logo.png" alt="logo"/><div class="brand"><b>BY Innovation</b><span>Recherche de Spécialistes</span></div><div class="ver">v'+VERSION+'</div></div>';
}
function sliders(){
  return '<div class="card"><b>Ce qui compte pour vous</b><p class="muted">Ces poids changent le classement.</p>'+
    slider("F","Fiabilité professionnelle")+slider("A","Avis / signaux")+slider("P","Proximité")+slider("E","Ancienneté / suivi")+'</div>';
}
function slider(k,l){
  return '<label>'+l+' · '+S.poids[k]+' %</label><input type="range" min="0" max="50" value="'+S.poids[k]+'" data-poids="'+k+'"/>';
}
function go(sc, tab){ S.screen=sc; if(tab) S.tab=tab; render(); }
window.go = go;
window.goBack = function(){
  if(S.screen==="home") return "no";
  if(S.screen==="fiche") go(S.results.length?"results":"home");
  else if(S.screen==="results"||S.screen==="orient") go("searchform","search");
  else if(S.screen==="quiz2") go("quiz");
  else if(S.screen==="quiz3") go("quiz2");
  else go("home","home");
  return "yes";
};

function httpGet(url, header){
  return new Promise(function(resolve){
    try {
      if (window.Android && Android.httpGet) {
        var raw = Android.httpGet(url, header||"");
        resolve(JSON.parse(raw));
        return;
      }
    } catch(e) {}
    fetch(url).then(function(r){
      return r.text().then(function(t){ resolve({ok:r.ok,status:r.status,body:t}); });
    }).catch(function(err){ resolve({ok:false,status:0,error:String(err),body:""}); });
  });
}
function parseBody(res){
  if (!res || !res.body) return null;
  try { return JSON.parse(res.body); } catch(e) { return null; }
}

function scoreOf(p){
  var wanted = fold(RPPS_SF[S.spec]||"");
  var sous = fold(p.sous||"");
  var fit10 = 4;
  if (p.spec===S.spec && sous.indexOf(wanted)>=0) fit10 = 9;
  if (sous===wanted) fit10 = 10;
  else if (sous.indexOf(wanted)>=0) fit10 = Math.max(fit10, 8);
  else if (wanted && sous.indexOf(wanted.split(" ")[0])>=0) fit10 = Math.max(fit10, 6);
  if (p.communeExact) fit10 = Math.min(10, fit10+1);

  var F = 3;
  if (p.rpps && String(p.rpps).length>=8) F += 2;
  if (p.hasDate) {
    F += 3;
    var y = parseInt(String(p.hasDate).slice(0,4),10);
    if (y>=2024) F += 2;
    else if (y>=2022) F += 1;
  }
  if (p.oa) F += 0.5;
  F = Math.min(10, F);

  var A = 5;
  if (p.hasDate) A += 1;
  if ((p.sites||1)>1) A += Math.min(2, (p.sites-1)*0.7);
  if (p.mode && fold(p.mode).indexOf("liberal")>=0) A += 0.4;
  A = Math.min(10, A);

  var deptOnly = String(p.ville||"").indexOf("Dép.")===0;
  var prox = 5;
  if (p.communeExact) prox = 10;
  else if (!deptOnly && p.ville && fold(p.ville).indexOf(fold(S.ville))>=0) prox = 9;
  else if (deptOnly) prox = 4;
  if (S.lat!=null && p.realLat!=null) {
    var R=6371,dLat=(p.realLat-S.lat)*Math.PI/180,dLon=(p.realLon-S.lon)*Math.PI/180;
    var x=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(S.lat*Math.PI/180)*Math.cos(p.realLat*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    var distKm=2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
    prox = Math.max(0, 10*(1-distKm/Math.max(S.rayon,1)));
    p._dist = Math.round(distKm*10)/10;
  }

  var E = 4;
  if (p.hasDate) {
    var hy = parseInt(String(p.hasDate).slice(0,4),10);
    if (hy) E = Math.min(10, 4 + Math.max(0, 2026-hy)*0.6);
  }
  if (p.annee) E = Math.min(10, (2026-p.annee)/3);
  if ((p.sites||1)>=2) E = Math.min(10, E+1);

  var fields = ["rpps","tel","email","adresse","structure","finess","sous","mode","hasDate","ville"];
  var filled = 0;
  fields.forEach(function(k){ if (p[k] && String(p[k]).indexOf("Dép.")!==0) filled++; });
  var data = Math.round(100 * filled / fields.length);
  if (p.src && p.src.indexOf("RPPS")>=0 && p.src.indexOf("HAS")>=0) data = Math.min(100, data+8);

  var w=S.poids, sum=w.F+w.A+w.P+w.E||1;
  var fiab = Math.round(10*((w.F/sum)*F+(w.A/sum)*A+(w.P/sum)*prox+(w.E/sum)*E));
  var besoin = Math.round(0.45*(fit10*10)+0.35*fiab+0.20*data);
  var why = {
    besoin: "Pertinence "+besoin+"/100 = 45 % adéquation spécialité ("+fit10+"/10) + 35 % fiabilité pondérée ("+fiab+") + 20 % richesse des données ("+data+"). Spécialité demandée : "+(SPEC[S.spec]||S.spec)+". Libellé trouvé : "+(p.sous||"—")+".",
    fiab: "Fiabilité "+fiab+"/100 avec vos poids Fiabilité "+w.F+" %, Avis "+w.A+" %, Proximité "+w.P+" %, Ancienneté "+w.E+" %. Notes /10 : F="+F.toFixed(1)+" (RPPS"+(p.hasDate?" + HAS "+p.hasDate:"")+") · A="+A.toFixed(1)+" (avis patients absents en open data = neutre 5) · P="+prox.toFixed(1)+" · E="+E.toFixed(1)+".",
    data: "Données "+data+"/100 : "+filled+" champs remplis sur "+fields.length+" (RPPS, téléphone, e-mail, adresse, structure, FINESS, savoir-faire, mode, date HAS, commune). "+(p.src||"")+"."
  };
  return {fiab:fiab, besoin:besoin, data:data, dist:p._dist!=null?p._dist:(deptOnly?null:2), why:why, F:F, A:A, P:prox, E:E, fit10:fit10};
}

function home(){
  var last = S.lastSearch;
  return logo()+
    '<div class="hero"><img src="logo.png" alt="BY Innovation"/><h1>Recherche de Spécialistes</h1><p class="muted">L’application oriente vers un type de spécialiste et compare des profils publics. Elle ne pose aucun diagnostic et ne remplace pas un avis médical.</p></div>'+
    '<div class="urg"><b>En cas d’urgence</b>'+
    '<p><button type="button" class="linkurg" data-act="callurg" data-tel="15"><b>15 SAMU</b></button> — malaise, douleur violente, hémorragie, détresse vitale.</p>'+
    '<p><button type="button" class="linkurg" data-act="callurg" data-tel="18"><b>18 Pompiers</b></button> — feu, accident, personne coincée, secours.</p>'+
    '<p><button type="button" class="linkurg" data-act="callurg" data-tel="17"><b>17 Police</b></button> — agression, vol en cours, danger immédiat.</p>'+
    '<p><button type="button" class="linkurg" data-act="callurg" data-tel="112"><b>112</b></button> — numéro unique européen.</p>'+
    '<p><b>114</b> — SMS / fax d’urgence si vous ne pouvez pas parler (sourds, malentendants, impossibilité de téléphoner).</p></div>'+
    villeBox()+
    '<button type="button" class="btn primary" data-act="quiz">Décrire un symptôme</button>'+
    '<button type="button" class="btn ghost" data-act="searchform">Choisir une spécialité</button>'+
    sliders()+
    '<button type="button" class="btn soft" data-act="apis">Sources & API — tester</button>'+
    (last?'<div class="card"><div class="muted">Dernière recherche</div><b>'+esc(last.label)+'</b><button type="button" class="btn soft" data-act="replay-last">Reprendre</button></div>':'')+
    '<p class="disclaimer">Pas un dispositif médical. Urgences : 15 · 18 · 17 · 112 · SMS 114.</p>';
}
function villeBox(){
  return '<div class="card"><label>Ville</label><input id="ville" value="'+esc(S.ville)+'" placeholder="Tapez une ville, ex. Aix-en-Provence" autocomplete="off"/>'+
    '<div id="suggest"></div><div class="chips">'+VILLES.slice(0,6).map(function(v){
      return '<button type="button" class="chip '+(S.ville===v[0]?"on":"")+'" data-act="setville" data-nom="'+v[0]+'" data-code="'+v[1]+'" data-dept="'+v[2]+'" data-lat="'+v[3]+'" data-lon="'+v[4]+'">'+v[0]+'</button>';
    }).join("")+'</div>'+(S.ville?'<p class="muted">Sélection : <b>'+esc(S.ville)+'</b>'+(S.dept?' · dép. '+S.dept:'')+'</p>':'')+'</div>';
}
function quiz(){
  return '<button type="button" class="back" data-act="home">Retour</button><p class="muted">Étape 1 / 3</p><h1>Où se situe le problème ?</h1>'+
    '<label>Vous pouvez aussi écrire</label><textarea id="symtxt" rows="2" placeholder="Ex. abcès douloureux dans le dos depuis 3 jours">'+esc(S.q.texte)+'</textarea>'+
    ZONES.map(function(z){return '<button type="button" class="btn '+(S.q.zone===z[0]?"primary":"ghost")+'" data-act="zone" data-id="'+z[0]+'">'+z[1]+'</button>';}).join("");
}
function quiz2(){
  var list = TYPES[S.q.zone]||[];
  return '<button type="button" class="back" data-act="quiz">Retour</button><p class="muted">Étape 2 / 3</p><h1>Quel est le problème exact ?</h1>'+
    list.map(function(t){return '<button type="button" class="btn '+(S.q.type===t[0]?"primary":"ghost")+'" data-act="type" data-id="'+t[0]+'">'+t[1]+'</button>';}).join("");
}
function quiz3(){
  var durs=[["48h","Moins de 48 heures"],["jours","Quelques jours"],["sem","Plus de 2 semaines"]];
  var al=[["fievre","Fièvre"],["douleur","Douleur violente"],["etend","Rougeur qui s’étend"],["aucun","Aucun de ces signes"]];
  return '<button type="button" class="back" data-act="quiz2">Retour</button><p class="muted">Étape 3 / 3</p><h1>Durée et signes d’alerte</h1>'+
    '<label>Durée</label><select id="duree">'+durs.map(function(d){return '<option value="'+d[0]+'" '+(S.q.duree===d[0]?"selected":"")+'>'+d[1]+'</option>';}).join("")+'</select>'+
    '<div class="chips">'+al.map(function(a){return '<button type="button" class="chip '+(S.q.alertes.indexOf(a[0])>=0?"on":"")+'" data-act="alerte" data-id="'+a[0]+'">'+a[1]+'</button>';}).join("")+'</div>'+
    '<button type="button" class="btn primary" data-act="orient">Voir les spécialités</button>';
}
function orientV(){
  var urgent = S.q.alertes.some(function(a){return a!=="aucun";});
  return '<button type="button" class="back" data-act="quiz3">Retour</button><h1>Spécialistes suggérés</h1>'+
    (S.q.texte?'<div class="banner">Votre description : « '+esc(S.q.texte)+' »</div>':'')+
    (urgent?'<div class="alert">Signe d’alerte coché. Si fièvre, douleur forte ou rougeur qui s’étend : 15 ou urgences.</div>':'')+
    S.suggestions.map(function(s){return '<div class="item"><h3>'+SPEC[s[0]]+'</h3><p class="muted">'+s[1]+'</p><button type="button" class="btn primary" data-act="usespec" data-id="'+s[0]+'">Rechercher ces spécialistes</button></div>';}).join("")+
    '<button type="button" class="btn ghost" data-act="searchform">Autre spécialité</button>';
}
function searchForm(){
  var opts=""; for (var k in SPEC) opts += '<option value="'+k+'" '+(S.spec===k?"selected":"")+'>'+SPEC[k]+'</option>';
  return logo()+'<h1>Recherche</h1>'+villeBox()+
    '<label>Spécialité</label><select id="spec">'+opts+'</select>'+
    '<label>Rayon</label><select id="rayon">'+[10,25,50,100].map(function(r){return '<option '+(S.rayon===r?"selected":"")+' value="'+r+'">'+r+' km</option>';}).join("")+'</select>'+
    sliders()+
    '<button type="button" class="btn primary" data-act="run">'+(S.busy?"Recherche…":"Lancer la recherche")+'</button>'+
    (S.busy?'<p class="muted">Interrogation RPPS + HAS en cours…</p>':'');
}
function resultsV(){
  if (S.busy) return '<h1>Recherche…</h1><p class="muted">Connexion aux sources officielles.</p>';
  if (!S.results.length) return '<button type="button" class="back" data-act="searchform">Modifier</button><div class="card"><h2>Aucun résultat</h2><p>Élargissez le rayon, changez de ville ou de spécialité.</p></div>';
  return '<button type="button" class="back" data-act="searchform">Modifier</button><h1>'+esc(S.ville)+'</h1><p class="muted">'+S.results.length+' profils · '+esc(SPEC[S.spec]||"")+(S.srcNote?" · "+S.srcNote:"")+'</p>'+
    S.results.map(cardMini).join("")+'<p class="disclaimer">Classement d’aide à la lecture des sources ouvertes. Pas un avis médical.</p>';
}
function whyBox(s){
  if (!s||!s.why) return "";
  return '<details class="why"><summary>Pourquoi cette note</summary>'+
    '<p><b>Pertinence '+s.besoin+'/100</b> — '+esc(s.why.besoin)+'</p>'+
    '<p><b>Fiabilité '+s.fiab+'/100</b> — '+esc(s.why.fiab)+'</p>'+
    '<p><b>Données '+s.data+'/100</b> — '+esc(s.why.data)+'</p></details>';
}
function cardMini(p){
  var s=p.sc||scoreOf(p); p.sc=s;
  return '<div class="item"><div class="row"><h3 style="margin:0">'+esc(p.titre+" "+p.prenom+" "+p.nom)+'</h3><span class="muted">'+(s.dist!=null?s.dist+" km":esc(p.ville||""))+'</span></div>'+
    '<div class="muted">'+esc(p.sous||SPEC[p.spec]||"")+' · '+esc(p.ville||"")+'</div>'+
    '<div class="scores" style="margin-top:8px"><div class="score '+cls(s.besoin)+'"><b>'+s.besoin+'/100</b><span>Pertinence</span></div><div class="score '+cls(s.fiab)+'"><b>'+s.fiab+'/100</b><span>Fiabilité</span></div><div class="score '+cls(s.data)+'"><b>'+s.data+'/100</b><span>Données</span></div></div>'+
    whyBox(s)+
    '<button type="button" class="btn soft" data-act="fiche" data-id="'+p.id+'">Voir la fiche</button></div>';
}
function ficheV(){
  var p=S.current; if(!p) return '<button type="button" class="back" data-act="home">Retour</button>';
  var s=p.sc||scoreOf(p);
  var tabs=[["synthese","Synthèse"],["fiab","Fiabilité"],["acces","Accès"],["info","Informations"]];
  var body="";
  if (S.detailTab==="synthese") {
    body = '<div class="scores"><div class="score '+cls(s.besoin)+'"><b>'+s.besoin+'/100 ✓</b><span>Pertinence besoin · '+lecture(s.besoin)+'</span></div>'+
      '<div class="score '+cls(s.fiab)+'"><b>'+s.fiab+'/100 ✓</b><span>Fiabilité · '+lecture(s.fiab)+'</span></div>'+
      '<div class="score '+cls(s.data)+'"><b>'+s.data+'/100</b><span>Confiance dans les données</span></div></div>'+
      whyBox(s)+
      '<div class="row"><div class="metric"><b>'+esc(p.sous||SPEC[p.spec]||"—")+'</b><span class="muted">Savoir-faire</span></div><div class="metric"><b>'+esc(p.mode||"—")+'</b><span class="muted">Mode d’exercice</span></div></div>'+
      '<div class="row" style="margin-top:8px"><div class="card"><b class="fav">Points favorables</b>'+
        (p.hasDate?'<div class="fav">✓ Accréditation HAS '+esc(p.hasDate)+'</div>':'')+
        (p.rpps?'<div class="fav">✓ RPPS '+esc(p.rpps)+'</div>':'')+
        (p.tel?'<div class="fav">✓ Téléphone public</div>':'')+
        '<div class="fav">✓ Source administrative ouverte</div></div>'+
      '<div class="card"><b class="vig">Points de vigilance</b>'+
        (!p.hasDate?'<div class="vig">⚠ Accréditation HAS non listée</div>':'')+
        (!p.tel?'<div class="vig">⚠ Téléphone non publié</div>':'')+
        '<div class="vig">⚠ Pas un taux de réussite clinique</div></div></div>';
  } else if (S.detailTab==="fiab") {
    var rows=[["Diplômes / formation",p.noteDip],["Certification HAS",p.noteCert],["Avis patients (signal faible)",p.noteAvis],["Rôle / exercice",p.noteReco],["Complétude des sources",Math.round(s.data/10)]];
    body = rows.map(function(r){return '<div class="card"><div class="row"><b>'+r[0]+'</b><span>'+r[1]+'/10</span></div><div class="bar"><i style="width:'+(r[1]*10)+'%"></i></div></div>';}).join("");
  } else if (S.detailTab==="acces") {
    body = '<div class="card"><p><b>Ville</b> '+esc(p.ville)+'</p><p><b>Adresse</b> '+esc(p.adresse||"Non publiée")+'</p><p><b>Téléphone</b> '+esc(p.tel||"Non publié")+'</p><p><b>E-mail</b> '+esc(p.email||"Non publié")+'</p><p><b>Mode</b> '+esc(p.mode||"—")+'</p></div>';
  } else {
    body = '<div class="card"><p><b>RPPS</b> '+esc(p.rpps||"—")+'</p><p><b>Sources</b> '+esc(p.src)+'</p><p><b>FINESS</b> '+esc(p.finess||"—")+'</p><p><b>Structure</b> '+esc(p.structure||"—")+'</p></div>';
  }
  return '<button type="button" class="back" data-act="results">Retour</button><h1>'+esc(p.titre+" "+p.prenom+" "+p.nom)+'</h1><p class="muted">'+esc(p.sous||"")+' · '+esc(p.ville||"")+'</p>'+
    '<div class="tabs">'+tabs.map(function(t){return '<a href="#" class="'+(S.detailTab===t[0]?"on":"")+'" data-act="dtab" data-id="'+t[0]+'">'+t[1]+'</a>';}).join("")+'</div>'+body+
    '<div class="actions"><button type="button" class="btn ghost" data-act="call">Appeler</button><button type="button" class="btn ghost" data-act="mail">E-mail</button><button type="button" class="btn primary" data-act="maps">Itinéraire</button><button type="button" class="btn ghost" data-act="share">Partager</button></div>'+
    '<p class="disclaimer">Cette application aide à s’orienter vers un type de spécialiste et à comparer des profils. Elle ne pose aucun diagnostic. Urgence : 15.</p>';
}
function synth(){
  if (!S.lastSearch) return '<div class="card"><h2>Pas encore de synthèse</h2><button type="button" class="btn primary" data-act="home">Accueil</button></div>';
  return '<h1>Synthèse</h1><div class="card"><b>Dernière recherche</b><p>'+esc(S.lastSearch.label||"")+'</p><p class="muted">'+esc(S.srcNote)+'</p></div>'+(S.results||[]).slice(0,5).map(cardMini).join("");
}
function hist(){
  if (!S.history.length) return '<div class="card"><h2>Historique vide</h2></div>';
  return '<div class="row"><h1>Historique</h1><button type="button" class="back" data-act="wipe">Effacer</button></div>'+
    S.history.map(function(h,i){return '<div class="item" data-act="replay" data-i="'+i+'"><b>'+esc(h.label)+'</b><div class="muted">'+new Date(h.at).toLocaleString("fr-FR")+'</div></div>';}).join("");
}
function profil(){
  return logo()+'<h1>Profil</h1>'+sliders()+
    '<button type="button" class="btn soft" data-act="apis">Sources & API</button>'+
    '<p class="muted">Version '+VERSION+'. Les recherches interrogent les API officielles. Données stockées seulement sur l’appareil.</p>';
}
function apis(){
  var key = localStorage.getItem("fhirKey")||"";
  var rows = [
    ["geo","Géocodage geo.api.gouv.fr","Ville → code commune INSEE. Gratuit, sans clé.","https://geo.api.gouv.fr/communes?nom=Aix-en-Provence&fields=nom,code,departement,centre&limit=1"],
    ["rpps","RPPS tabulaire data.gouv.fr","Identité, spécialité, commune, téléphone public.","https://tabular-api.data.gouv.fr/api/resources/"+RID_RPPS+"/data/?page_size=1"],
    ["has","HAS médecins accrédités","Accréditation officielle, spécialité, département.","https://tabular-api.data.gouv.fr/api/resources/"+RID_HAS+"/data/?page_size=1"],
    ["datagouv","Métadonnées Annuaire Santé","Jeu RPPS publié chaque jour.","https://www.data.gouv.fr/api/1/datasets/annuaire-sante-extractions-des-donnees-en-libre-acces-des-professionnels-intervenant-dans-le-systeme-de-sante-rpps/"],
    ["fhir","API FHIR Annuaire Santé ANS","L’ANS impose une clé Gravitee. Sans clé le serveur répond 403 : ce n’est pas un bug de l’app. Créez une clé sur portal.api.esante.gouv.fr puis collez-la ici.","https://gateway.api.esante.gouv.fr/fhir/v2/metadata"]
  ];
  var html = logo()+'<button type="button" class="back" data-act="profil">Retour</button><h1>Sources & API</h1>'+
    '<div class="banner">Recherche réelle = geo.api.gouv.fr + RPPS + HAS. FHIR n’ajoute des fiches que si une clé ANS valide est collée.</div>'+
    '<div class="card"><label>Clé FHIR ANS</label><input id="fhirKey" value="'+esc(key)+'" placeholder="Collez la clé ESANTE-API-KEY"/>'+
    '<p class="muted">1) Compte sur portal.api.esante.gouv.fr · 2) Souscrire « API Annuaire Santé en libre accès » · 3) Copier la clé · 4) Tester.</p>'+
    '<button type="button" class="btn ghost" data-act="openurl" data-url="https://portal.api.esante.gouv.fr/">Ouvrir le portail ANS</button></div>';
  rows.forEach(function(r){
    var t=S.apiTests[r[0]];
    var badge;
    if (!t) badge='<span class="status offair">Non testé</span>';
    else if (t.ok) badge='<span class="status onair">OK '+t.status+'</span>';
    else if (r[0]==="fhir" && t.status===403) badge='<span class="status err">Clé requise · 403</span>';
    else badge='<span class="status err">Échec '+(t.status||"")+'</span>';
    html += '<div class="card"><div class="row"><b>'+r[1]+'</b>'+badge+'</div><p class="muted">'+r[2]+'</p>'+
      '<button type="button" class="btn ghost" data-act="test" data-id="'+r[0]+'" data-url="'+esc(r[3])+'">Tester la connexion</button>'+
      (t?'<p class="muted">'+esc((t.preview||t.error||"").toString().slice(0,240))+'</p>':'')+'</div>';
  });
  html += '<button type="button" class="btn primary" data-act="testall">Tout tester</button>';
  return html;
}

function setVille(nom, code, dept, lat, lon){
  S.ville=nom; S.code=code||S.code; S.dept=dept||S.dept;
  if (lat!=null) S.lat=+lat; if (lon!=null) S.lon=+lon;
}

function geocode(nom){
  var url="https://geo.api.gouv.fr/communes?nom="+encodeURIComponent(nom)+"&fields=nom,code,departement,centre,codesPostaux&boost=population&limit=8";
  return httpGet(url).then(function(res){
    var arr=parseBody(res);
    if (!arr && res.body) { try { arr=JSON.parse(res.body); } catch(e){} }
    if (!arr || !arr.length) return null;
    var c=arr[0];
    setVille(c.nom, c.code, c.departement && c.departement.code, c.centre && c.centre.coordinates && c.centre.coordinates[1], c.centre && c.centre.coordinates && c.centre.coordinates[0]);
    return arr;
  });
}

function mapRpps(r){
  var nom=r["Nom d'exercice"]||r.Nom||"";
  var prenom=r["Prénom d'exercice"]||r["Prénom"]||"";
  var rpps=String(r["Identifiant PP"]||r["N° RPPS"]||"");
  var ville=r["Libellé commune (coord. structure)"]||S.ville;
  var tel=r["Téléphone (coord. structure)"]||"";
  var sous=r["Libellé savoir-faire"]||r["Libellé profession"]||"";
  var mode=r["Libellé mode exercice"]||"";
  return {
    id:"rpps-"+rpps+"-"+fold(ville).replace(/\s/g,""),
    titre:(r["Libellé civilité d'exercice"]||"Dr"),
    nom:nom, prenom:prenom, spec:S.spec, sous:sous, ville:ville, dept:S.dept,
    lat:S.lat, lon:S.lon, tel:tel, email:r["Adresse e-mail (coord. structure)"]||"",
    adresse:[r["Numéro Voie (coord. structure)"], r["Libellé type de voie (coord. structure)"], r["Libellé Voie (coord. structure)"], ville].filter(Boolean).join(" "),
    structure:r["Raison sociale site"]||"", finess:r["Numéro FINESS site"]||"",
    communeExact: fold(ville)===fold(S.ville) || (S.code && String(r["Code commune (coord. structure)"]||"")===String(S.code)),
    annee:null, diplomes:[], hasDate:"", oa:"",
    noteDip:7, noteCert:4, noteAvis:5, noteReco:6, noteConf:5,
    mode:mode, rpps:rpps, src:"RPPS open data", sites:1, secteur:r["Libellé secteur d'activité"]||""
  };
}
function mapHas(r){
  var rpps=String(r["N° RPPS"]||"");
  return {
    id:"has-"+rpps,
    titre:"Dr", nom:r.Nom||"", prenom:r["Prénom"]||"", spec:S.spec,
    sous:String(r["Spécialité"]||"").replace(/;/g," ").trim(),
    ville:"Dép. "+(r["Département"]||S.dept||"?"), dept:String(r["Département"]||S.dept||""), lat:S.lat, lon:S.lon,
    tel:"", email:"", adresse:"", structure:"", finess:r.FINESS||"",
    annee:null, diplomes:[], hasDate:r["Date accréditation"]||"", oa:r.OA||"",
    noteDip:7, noteCert:9, noteAvis:5, noteReco:7, noteConf:5,
    mode:r.Statut||"", rpps:rpps, src:"HAS open data", sites:1, communeExact:false
  };
}

function runSearch(){
  if (!S.ville) { alert("Choisissez une ville."); return; }
  if (!S.spec) S.spec="chir_gen";
  S.busy=true; S.screen="results"; S.tab="search"; render();
  var ready = S.code ? Promise.resolve() : geocode(S.ville);
  ready.then(function(){
    var sf = RPPS_SF[S.spec]||"Médecin";
    var hs = HAS_SF[S.spec]||"";
    var jobs = [];
    if (S.code) {
      var u1="https://tabular-api.data.gouv.fr/api/resources/"+RID_RPPS+"/data/?page_size=30&"+
        encodeURIComponent("Code commune (coord. structure)")+"__exact="+encodeURIComponent(S.code)+"&"+
        encodeURIComponent("Libellé savoir-faire")+"__contains="+encodeURIComponent(sf);
      jobs.push(httpGet(u1).then(function(res){ return {kind:"rpps", res:res}; }));
    }
    if (S.dept && hs) {
      var u2="https://tabular-api.data.gouv.fr/api/resources/"+RID_HAS+"/data/?page_size=30&"+
        encodeURIComponent("Département")+"__exact="+encodeURIComponent(S.dept)+"&"+
        encodeURIComponent("Spécialité")+"__contains="+encodeURIComponent(hs);
      jobs.push(httpGet(u2).then(function(res){ return {kind:"has", res:res}; }));
    }
    return Promise.all(jobs);
  }).then(function(parts){
    var by={};
    function add(p){
      if (!p.rpps) return;
      var k=p.rpps;
      if (!by[k]) by[k]=p;
      else {
        by[k].sites = (by[k].sites||1)+1;
        if (p.hasDate) { by[k].hasDate=p.hasDate; by[k].noteCert=9; by[k].oa=p.oa||by[k].oa; }
        if (p.tel && !by[k].tel) by[k].tel=p.tel;
        if (p.email && !by[k].email) by[k].email=p.email;
        if (p.adresse && !by[k].adresse) by[k].adresse=p.adresse;
        if (p.structure && !by[k].structure) by[k].structure=p.structure;
        if (p.communeExact) { by[k].communeExact=true; by[k].ville=p.ville; }
        if (p.sous && (!by[k].sous || by[k].sous.length<p.sous.length)) by[k].sous=p.sous;
        by[k].src = Array.from(new Set((by[k].src+","+p.src).split(","))).join(" + ");
      }
    }
    (parts||[]).forEach(function(part){
      var js=parseBody(part.res);
      var rows = js && js.data ? js.data : [];
      rows.forEach(function(r){ add(part.kind==="has"?mapHas(r):mapRpps(r)); });
    });
    var list=Object.keys(by).map(function(k){ var p=by[k]; p.sc=scoreOf(p); return p; });
    list.sort(function(a,b){ return b.sc.besoin-a.sc.besoin || (b.sc.data-a.sc.data); });
    S.results=list.slice(0,40);
    S.srcNote=(parts||[]).map(function(p){return p.kind.toUpperCase()+" "+((parseBody(p.res)||{}).meta||{}).total;}).join(" · ");
    if (!S.results.length) S.srcNote="aucune ligne pour cette commune / spécialité";
    S.lastSearch={label:(SPEC[S.spec]||"")+" · "+S.ville+" · "+S.rayon+" km", spec:S.spec, ville:S.ville, code:S.code, dept:S.dept, lat:S.lat, lon:S.lon, rayon:S.rayon, at:Date.now()};
    S.history.unshift({type:"RECHERCHE", label:S.lastSearch.label, spec:S.spec, ville:S.ville, code:S.code, dept:S.dept, lat:S.lat, lon:S.lon, rayon:S.rayon, at:Date.now()});
    persist();
    S.busy=false; render();
  }).catch(function(e){
    S.busy=false; S.srcNote="erreur "+(e&&e.message?e.message:e); render();
  });
}

function openFiche(id){
  for (var i=0;i<S.results.length;i++) if (S.results[i].id===id) S.current=S.results[i];
  if (!S.current) return;
  S.current.sc=scoreOf(S.current);
  S.detailTab="synthese";
  S.history.unshift({type:"FICHE", label:S.current.titre+" "+S.current.prenom+" "+S.current.nom, at:Date.now()});
  persist(); go("fiche", S.tab);
}

function testApi(id, url){
  S.apiTests[id]={ok:false,status:0,preview:"test…"}; render();
  var header="";
  if (id==="fhir" && localStorage.getItem("fhirKey")) header="ESANTE-API-KEY:"+localStorage.getItem("fhirKey");
  httpGet(url, header).then(function(res){
    var preview=(res.body||res.error||"").toString().slice(0,180);
    if (id==="fhir" && !res.ok) {
      preview = res.status===403
        ? "403 confirmé sans clé ANS. Créez-en une sur portal.api.esante.gouv.fr (souscription Annuaire Santé libre accès). RPPS + HAS suffisent pour chercher."
        : "HTTP "+res.status+" — "+preview;
    }
    S.apiTests[id]={ok:!!res.ok,status:res.status||0,preview:preview,error:res.error}; render();
  });
}

function navHtml(){
  var items=[["home","Accueil","🏠","#1558C0"],["search","Recherche","🔎","#0277BD"],["synth","Synthèse","▣","#2E7D32"],["hist","Historique","🕘","#EF6C00"],["profil","Profil","👤","#6A1B9A"]];
  return items.map(function(it){return '<button type="button" class="'+(S.tab===it[0]?"on":"")+'" data-act="tab" data-id="'+it[0]+'"><div class="ico" style="background:'+it[3]+'">'+it[2]+'</div>'+it[1]+'</button>';}).join("");
}
function render(){
  var map={home:home,quiz:quiz,quiz2:quiz2,quiz3:quiz3,orient:orientV,searchform:searchForm,results:resultsV,fiche:ficheV,synth:synth,hist:hist,profil:profil,apis:apis};
  try {
    document.getElementById("app").innerHTML=(map[S.screen]||home)();
    document.getElementById("nav").innerHTML=navHtml();
  } catch(e) {
    document.getElementById("app").innerHTML=logo()+'<div class="alert">Erreur : '+esc(e.message)+'</div><button type="button" class="btn primary" data-act="home">Accueil</button>';
  }
  bindFields();
}
function bindFields(){
  var v=document.getElementById("ville");
  if (v) {
    v.addEventListener("input", function(){ S.ville=this.value; liveSuggest(this.value); });
  }
  var s=document.getElementById("spec"); if (s) s.addEventListener("change", function(){ S.spec=this.value; });
  var r=document.getElementById("rayon"); if (r) r.addEventListener("change", function(){ S.rayon=+this.value; });
  var t=document.getElementById("symtxt"); if (t) t.addEventListener("input", function(){ S.q.texte=this.value; });
  var d=document.getElementById("duree"); if (d) d.addEventListener("change", function(){ S.q.duree=this.value; });
  var k=document.getElementById("fhirKey"); if (k) k.addEventListener("change", function(){ localStorage.setItem("fhirKey", this.value.trim()); });
  var ranges=document.querySelectorAll("[data-poids]");
  for (var i=0;i<ranges.length;i++){
    ranges[i].addEventListener("input", function(){
      S.poids[this.getAttribute("data-poids")]=+this.value;
      persist();
      var lab=this.previousElementSibling;
      if (lab) lab.textContent=lab.textContent.replace(/\d+ %/, S.poids[this.getAttribute("data-poids")]+" %");
    });
  }
}
function liveSuggest(q){
  var box=document.getElementById("suggest"); if (!box) return;
  var local=VILLES.filter(function(v){return fold(v[0]).indexOf(fold(q))>=0;}).slice(0,6);
  if (!q) { box.style.display="none"; return; }
  box.style.display="block";
  box.innerHTML=local.map(function(v){return '<div data-act="setville" data-nom="'+v[0]+'" data-code="'+v[1]+'" data-dept="'+v[2]+'" data-lat="'+v[3]+'" data-lon="'+v[4]+'">'+v[0]+' ('+v[2]+')</div>';}).join("");
  if (q.length>=3) {
    httpGet("https://geo.api.gouv.fr/communes?nom="+encodeURIComponent(q)+"&fields=nom,code,departement,centre&boost=population&limit=6").then(function(res){
      var arr=parseBody(res); if (!arr||!arr.length||!document.getElementById("suggest")) return;
      document.getElementById("suggest").innerHTML=arr.map(function(c){
        var lat=c.centre&&c.centre.coordinates?c.centre.coordinates[1]:"";
        var lon=c.centre&&c.centre.coordinates?c.centre.coordinates[0]:"";
        var dep=c.departement?c.departement.code:"";
        return '<div data-act="setville" data-nom="'+esc(c.nom)+'" data-code="'+c.code+'" data-dept="'+dep+'" data-lat="'+lat+'" data-lon="'+lon+'">'+esc(c.nom)+' ('+dep+')</div>';
      }).join("");
    });
  }
}

document.addEventListener("click", function(e){
  var el = e.target;
  while (el && el !== document.body && !(el.getAttribute && el.getAttribute("data-act"))) el = el.parentNode;
  if (!el || !el.getAttribute) return;
  var act = el.getAttribute("data-act");
  if (!act) return;
  e.preventDefault();
  if (act==="home") go("home","home");
  else if (act==="tab") { var id=el.getAttribute("data-id"); S.tab=id; go(id==="search"?"searchform":id==="synth"?"synth":id==="hist"?"hist":id==="profil"?"profil":"home", id); }
  else if (act==="quiz") go("quiz","home");
  else if (act==="quiz2") go("quiz2");
  else if (act==="quiz3") go("quiz3");
  else if (act==="searchform") go("searchform","search");
  else if (act==="results") go("results","search");
  else if (act==="apis") go("apis","profil");
  else if (act==="profil") go("profil","profil");
  else if (act==="setville") { setVille(el.getAttribute("data-nom"), el.getAttribute("data-code"), el.getAttribute("data-dept"), el.getAttribute("data-lat"), el.getAttribute("data-lon")); var box=document.getElementById("suggest"); if(box) box.style.display="none"; render(); }
  else if (act==="zone") { S.q.zone=el.getAttribute("data-id"); go("quiz2"); }
  else if (act==="type") { S.q.type=el.getAttribute("data-id"); go("quiz3"); }
  else if (act==="alerte") {
    var a=el.getAttribute("data-id");
    if (a==="aucun") S.q.alertes=["aucun"];
    else {
      S.q.alertes=S.q.alertes.filter(function(x){return x!=="aucun"&&x!==a;});
      if (S.q.alertes.indexOf(a)<0) S.q.alertes.push(a);
    }
    render();
  }
  else if (act==="orient") {
    S.suggestions = ORIENT[S.q.type] || [["med_gen","Un médecin généraliste peut faire le premier point."]];
    S.spec = S.suggestions[0][0];
    go("orient");
  }
  else if (act==="usespec") { S.spec=el.getAttribute("data-id"); go("searchform","search"); }
  else if (act==="run") runSearch();
  else if (act==="fiche") openFiche(el.getAttribute("data-id"));
  else if (act==="dtab") { S.detailTab=el.getAttribute("data-id"); render(); }
  else if (act==="replay-last") {
    var h=S.lastSearch; if(!h){ alert("Aucune recherche à reprendre."); return; }
    S.spec=h.spec; S.ville=h.ville; S.code=h.code; S.dept=h.dept; S.lat=h.lat; S.lon=h.lon; S.rayon=h.rayon||25;
    runSearch();
  }
  else if (act==="replay") {
    var h=S.history[+el.getAttribute("data-i")];
    if (!h) return;
    if (h.type==="FICHE") return;
    S.spec=h.spec; S.ville=h.ville; S.code=h.code; S.dept=h.dept; S.lat=h.lat; S.lon=h.lon; S.rayon=h.rayon||25;
    runSearch();
  }
  else if (act==="callurg") {
    var tel=el.getAttribute("data-tel");
    if (window.Android && Android.call) Android.call(tel); else location.href="tel:"+tel;
  }
  else if (act==="openurl") {
    var u=el.getAttribute("data-url");
    if (window.Android && Android.openUrl) Android.openUrl(u); else window.open(u,"_blank");
  }
  else if (act==="wipe") { S.history=[]; persist(); render(); }
  else if (act==="test") testApi(el.getAttribute("data-id"), el.getAttribute("data-url"));
  else if (act==="testall") {
    document.querySelectorAll("[data-act=test]").forEach(function(btn){ testApi(btn.getAttribute("data-id"), btn.getAttribute("data-url")); });
  }
  else if (act==="call") {
    if (!S.current || !S.current.tel) { alert("Téléphone non publié dans l’open data."); return; }
    if (window.Android && Android.call) Android.call(S.current.tel); else location.href="tel:"+S.current.tel;
  }
  else if (act==="mail") {
    var m=S.current && S.current.email;
    if (!m) { alert("E-mail non publié."); return; }
    if (window.Android && Android.mail) Android.mail(m); else location.href="mailto:"+m;
  }
  else if (act==="maps") {
    var q=(S.current.adresse||S.current.ville||"");
    if (window.Android && Android.maps) Android.maps(q); else window.open("https://maps.google.com/?q="+encodeURIComponent(q));
  }
  else if (act==="share") {
    var p=S.current, sc=p.sc||{};
    var t=p.titre+" "+p.nom+" — "+(p.sous||"")+" — "+p.ville+" — pertinence "+(sc.besoin||"?")+"/100. Pas un avis médical.";
    if (window.Android && Android.share) Android.share(t); else alert(t);
  }
});

render();
