window.S = {
  tab:"home", screen:"home", ville:"", code:"", dept:"", lat:null, lon:null, rayon:25,
  poids:{F:35,A:10,P:15,E:40},
  sort:"qualite", filtres:{has:false, tel:false, liberal:false, hopital:false},
  q:{zone:"",type:"",duree:"jours",alertes:[],texte:""},
  suggestions:[], spec:"chir_gen", results:[], current:null, detailTab:"synthese",
  history:[], pins:[], lastSearch:null, apiTests:{}, busy:false, srcNote:""
};
var S = window.S;
var VERSION = "1.5.2";
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
var RID_DIPL = "41ae70ac-90c8-4c4e-8644-4ef1b100f045";
var RID_SF = "fb55f15f-bd61-4402-b551-51ef387f2fab";

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
  return '<div class="card"><b>Classer selon ce qui compte pour vous</b><p class="muted">Ces curseurs changent l’ordre, pas un avis médical.</p>'+
    slider("E","Expérience / ancienneté")+slider("F","Compétences / formation")+slider("P","Proximité")+slider("A","Signaux d’exercice (lieux, libéral)")+'</div>';
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

function tabularByRpps(rid, rpps){
  var col=encodeURIComponent("Identifiant PP");
  var url="https://tabular-api.data.gouv.fr/api/resources/"+rid+"/data/?page_size=30&"+col+"__exact="+encodeURIComponent(String(rpps));
  return httpGet(url).then(function(res){
    var js=parseBody(res);
    return (js && js.data) ? js.data : [];
  });
}
function uniqPush(arr, v){
  if (!v) return;
  var s=String(v).replace(/\s+/g," ").trim();
  if (!s) return;
  if (arr.indexOf(s)<0) arr.push(s);
}
function enrichQualifs(p){
  if (!p || !p.rpps) return Promise.resolve(p);
  if (p.qualifsLoaded) return Promise.resolve(p);
  p.qualifsNote="Chargement diplômes et savoir-faire…";
  return Promise.all([
    tabularByRpps(RID_DIPL, p.rpps),
    tabularByRpps(RID_SF, p.rpps)
  ]).then(function(pair){
    p.rawDipl=pair[0]||[];
    p.rawSf=pair[1]||[];
    p.diplomes=p.diplomes||[];
    p.autorisations=p.autorisations||[];
    p.savoirFaire=p.savoirFaire||[];
    p.rawDipl.forEach(function(r){
      uniqPush(p.diplomes, (r["Libellé type diplôme obtenu"]||"")+" — "+(r["Libellé diplôme obtenu"]||""));
      if (r["Libellé type autorisation"] || r["Libellé discipline autorisation"]) {
        uniqPush(p.autorisations, (r["Libellé type autorisation"]||"")+" "+(r["Libellé discipline autorisation"]||""));
      }
    });
    p.rawSf.forEach(function(r){
      uniqPush(p.savoirFaire, (r["Libellé type savoir-faire"]||"")+" — "+(r["Libellé savoir-faire"]||""));
    });
    p.qualifsLoaded=true;
    p.qualifsNote=p.rawDipl.length+" diplôme(s) · "+p.rawSf.length+" savoir-faire · date d’obtention non publiée dans l’open data";
    p.sc=scoreOf(p);
    return p;
  }).catch(function(e){
    p.qualifsNote="Échec chargement diplômes : "+(e&&e.message?e.message:e);
    return p;
  });
}
function fhirGet(path){
  return httpGet("https://gateway.api.esante.gouv.fr/fhir/v2/"+path, "ESANTE-API-KEY:"+getFhirKey());
}
function flattenObj(obj, prefix){
  var rows=[];
  function walk(o, p){
    if (o==null || o==="") return;
    if (Array.isArray(o)) { o.forEach(function(x,i){ walk(x, p+"["+i+"]"); }); return; }
    if (typeof o==="object") {
      Object.keys(o).forEach(function(k){
        if (k==="text" || k==="meta" || k==="div") return;
        walk(o[k], p?p+"."+k:k);
      });
      return;
    }
    var s=String(o);
    if (s.indexOf("data:image")===0 || s.length>220) s=s.slice(0,80)+"…";
    rows.push([p,s]);
  }
  walk(obj, prefix||"");
  return rows;
}
function sourceBox(title, rows, note){
  var body = !rows||!rows.length ? '<p class="muted">'+(note||"Aucune donnée renvoyée par cette source.")+'</p>' :
    rows.map(function(r){ return '<div class="kv"><span>'+esc(r[0])+'</span><b>'+esc(r[1])+'</b></div>'; }).join("");
  return '<div class="card srcbox"><b>'+title+'</b>'+body+'</div>';
}
function enrichOne(p){
  if (!getFhirKey() || !p.rpps) {
    p.fhirNote = getFhirKey() ? "Pas de n° RPPS pour interroger FHIR." : "Clé FHIR absente — collez-la dans Sources & API.";
    return Promise.resolve(p);
  }
  var q="Practitioner?identifier="+encodeURIComponent(p.rpps)+"&_revinclude=PractitionerRole:practitioner&_count=8";
  return fhirGet(q).then(function(res){
    p.fhirStatus=res&&res.status;
    p.fhirOk=!!(res&&res.ok);
    p.fhirRaw=[];
    var bundle=parseBody(res);
    if (!p.fhirOk || !bundle) {
      p.fhirNote="HTTP "+(p.fhirStatus||"?")+" — "+String((res&&res.body)||"").slice(0,160);
      return p;
    }
    var entries=(bundle.entry||[]).map(function(e){ return e.resource; }).filter(Boolean);
    if (!entries.length) p.fhirNote="Clé OK mais aucun Practitioner pour ce RPPS.";
    entries.forEach(function(r){
      p.fhirRaw=p.fhirRaw.concat(flattenObj(r, r.resourceType||"FHIR"));
      if (r.resourceType==="Practitioner") {
        if (r.birthDate) {
          p.birthDate=r.birthDate;
          p.age=new Date().getFullYear()-parseInt(String(r.birthDate).slice(0,4),10);
        }
        if (r.gender) p.gender=r.gender;
        if (r.photo && r.photo[0]) {
          var ph=r.photo[0];
          p.photo=ph.url||(ph.data?("data:"+(ph.contentType||"image/jpeg")+";base64,"+ph.data):"");
        }
        (r.qualification||[]).forEach(function(q){
          var d=q.code && ((q.code.text)||(q.code.coding&&q.code.coding[0]&&(q.code.coding[0].display||q.code.coding[0].code)));
          if (d && p.diplomes.indexOf(d)<0) p.diplomes.push(d);
        });
        (r.telecom||[]).forEach(function(t){
          if (t.system==="phone" && t.value && !p.tel) p.tel=t.value;
          if (t.system==="email" && t.value && !p.email) p.email=t.value;
        });
      }
      if (r.resourceType==="PractitionerRole") {
        (r.telecom||[]).forEach(function(t){
          if (t.system==="phone" && t.value && !p.tel) p.tel=t.value;
          if (t.system==="email" && t.value && !p.email) p.email=t.value;
        });
      }
    });
    if (p.fhirOk && (p.src||"").indexOf("FHIR")<0) p.src+=" + FHIR v2";
    p.sc=scoreOf(p);
    return p;
  });
}
function qualifBoost(p){
  var text = fold([].concat(p.diplomes||[], p.savoirFaire||[], p.autorisations||[], [p.sous]).join(" | "));
  var pts = 0;
  var reasons = [];
  function add(n, label, cond){ if (cond) { pts += n; reasons.push(label+" +"+n); } }
  add(18, "DES/DESC", text.indexOf("des ")>=0 || text.indexOf("desc")>=0 || text.indexOf("etudes specialisees")>=0);
  add(10, "Capacité", text.indexOf("capacite")>=0);
  add(8, "Diplôme d'État", text.indexOf("diplome d'etat")>=0 || text.indexOf("diplome d etat")>=0 || text.indexOf("d.e.")>=0);
  add(8, "Doctorat", text.indexOf("doctorat")>=0 || text.indexOf("these")>=0);
  add(6, "DU/DIU", text.indexOf("diplome universitaire")>=0 || /\bdu\b/.test(text) || text.indexOf("diu")>=0);
  add(16, "Spécialité ordinale", text.indexOf("specialite ordinale")>=0);
  add(12, "Compétence exclusive", text.indexOf("competence exclusive")>=0);
  add(8, "Qualification", text.indexOf("qualification")>=0);
  var nDip = (p.rawDipl&&p.rawDipl.length) || (p.diplomes&&p.diplomes.length) || 0;
  var nSf = (p.rawSf&&p.rawSf.length) || (p.savoirFaire&&p.savoirFaire.length) || 0;
  if (nDip>1) { pts += Math.min(12, (nDip-1)*3); reasons.push((nDip)+" diplômes"); }
  if (nSf>1) { pts += Math.min(10, (nSf-1)*2); reasons.push((nSf)+" savoir-faire"); }
  var wanted = fold(RPPS_SF[S.spec]||SPEC[S.spec]||"");
  var matchSpec = wanted && text.indexOf(wanted)>=0;
  if (!matchSpec && wanted) matchSpec = wanted.split(" ").some(function(w){ return w.length>4 && text.indexOf(w)>=0; });
  if (matchSpec) { pts += 14; reasons.push("aligné demande"); }
  if (p.autorisations && p.autorisations.length) { pts += 6; reasons.push("autorisation d'exercice"); }
  return {pts:Math.min(46, pts), reasons:reasons, matchSpec:!!matchSpec, nDip:nDip, nSf:nSf};
}
function mapAllQualifs(list){
  var i=0, max=Math.min(list.length, 18);
  function step(){
    if (i>=max) return Promise.resolve(list);
    return enrichQualifs(list[i]).then(function(){ list[i].sc=scoreOf(list[i]); i++; return step(); });
  }
  return step();
}
function enrichFhir(list){
  if (!getFhirKey()) return Promise.resolve(list);
  var i=0;
  function step(){
    if (i>=list.length) return Promise.resolve(list);
    return enrichOne(list[i]).then(function(){ i++; return step(); });
  }
  return step();
}

function scoreOf(p){
  var wanted = fold(RPPS_SF[S.spec]||"");
  var sous = fold(p.sous||"");
  var titre = fold(p.titre||"");
  var mode = fold(p.mode||"");
  var struct = fold(p.structure||"");
  var cat = fold(p.categorie||"");
  var deptOnly = String(p.ville||"").indexOf("Dép.")===0;

  var fit = 12;
  if (sous===wanted) fit = 96;
  else if (wanted && sous.indexOf(wanted)>=0) fit = 78;
  else if (wanted && sous.indexOf(wanted.split(" ")[0])>=0) fit = 52;
  else if (p.spec===S.spec) fit = 40;
  if (p.communeExact) fit = Math.min(100, fit+4);

  var comp = 8;
  if (titre.indexOf("prof")>=0) comp += 28;
  else if (titre.indexOf("dr")>=0 || titre.indexOf("doct")>=0) comp += 10;
  if (p.hasDate) {
    comp += 26;
    var hy = parseInt(String(p.hasDate).slice(0,4),10);
    if (hy>=2023) comp += 10;
    else if (hy>=2018) comp += 6;
  }
  if (p.oa) comp += 4;
  var qb = qualifBoost(p);
  comp += qb.pts;
  if (qb.matchSpec) fit = Math.max(fit, 88);
  if (cat.indexOf("etud")>=0 || cat.indexOf("interne")>=0) comp = Math.min(comp, 22);
  comp = Math.max(0, Math.min(100, comp));

  var years = null;
  if (p.annee && p.annee>1950 && p.annee<2027) years = 2026-p.annee;
  var exp = years==null ? 18 : Math.min(78, 8+years*2.4);
  exp += Math.min(18, Math.max(0, ((p.sites||1)-1)*8));
  if (p.hasDate) exp += 8;
  if (struct.indexOf("chu")>=0 || struct.indexOf("universitaire")>=0) exp += 8;
  else if (struct.indexOf("hopital")>=0 || struct.indexOf("hôpital")>=0) exp += 5;
  else if (struct.indexOf("clinique")>=0) exp += 3;
  if (cat.indexOf("etud")>=0 || cat.indexOf("interne")>=0) exp = Math.min(exp, 16);
  exp = Math.max(0, Math.min(100, Math.round(exp)));

  var signaux = 10;
  if (mode.indexOf("liberal")>=0) signaux += 18;
  if (mode.indexOf("salarie")>=0 || mode.indexOf("salarié")>=0) signaux += 8;
  if (p.tel) signaux += 14;
  if (p.email) signaux += 8;
  if ((p.sites||1)>=2) signaux += 12;
  if (p.fhirOk) signaux += 8;
  signaux = Math.min(100, signaux);

  var prox = 40;
  if (p.communeExact) prox = 100;
  else if (!deptOnly && p.ville && fold(p.ville).indexOf(fold(S.ville))>=0) prox = 86;
  else if (deptOnly) prox = 28;
  if (S.lat!=null && p.realLat!=null) {
    var R=6371,dLat=(p.realLat-S.lat)*Math.PI/180,dLon=(p.realLon-S.lon)*Math.PI/180;
    var x=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(S.lat*Math.PI/180)*Math.cos(p.realLat*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    var distKm=2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
    prox = Math.max(0, Math.round(100*(1-distKm/Math.max(S.rayon,1))));
    p._dist = Math.round(distKm*10)/10;
  }

  var fields = ["rpps","tel","email","adresse","structure","finess","sous","mode","hasDate","ville"];
  var filled = 0;
  fields.forEach(function(k){ if (p[k] && String(p[k]).indexOf("Dép.")!==0) filled++; });
  var data = Math.round(100*filled/fields.length);
  if (p.fhirOk) data = Math.min(100, data+10);
  if (p.rawHas) data = Math.min(100, data+6);
  if (p.qualifsLoaded) data = Math.min(100, data+8);

  var w=S.poids, sum=(w.F+w.E+w.P+w.A)||1;
  var qualite = Math.round((w.F/sum)*comp + (w.E/sum)*exp + (w.A/sum)*signaux + (w.P/sum)*prox);
  var besoin = Math.round(0.62*fit + 0.38*qualite);

  var why = {
    besoin: "Pertinence "+besoin+"/100 = 62 % adéquation à la demande ("+fit+"/100, « "+(p.sous||"—")+" » vs « "+(SPEC[S.spec]||"")+" ») + 38 % qualité.",
    fiab: "Qualité "+qualite+"/100 = compétences "+comp+" (titre "+(p.titre||"—")+(p.hasDate?" · HAS "+p.hasDate:" · sans HAS")+(qb.reasons.length?" · "+qb.reasons.join(", "):"")+") + expérience "+exp+(years!=null?" (~"+years+" ans)":" · année diplôme non publiée")+" + signaux "+signaux+" ("+(p.sites||1)+" lieu(x)) + proximité "+prox+". Poids exp "+w.E+"% · compétences "+w.F+"% · signaux "+w.A+"% · proximité "+w.P+"%.",
    data: "Fiabilité des données "+data+"/100 : "+filled+"/"+fields.length+" champs publics. Ce score ne juge pas le chirurgien, seulement la richesse des sources."
  };
  return {besoin:besoin, fiab:qualite, data:data, qualite:qualite, fit:fit, comp:comp, exp:exp, signaux:signaux, prox:prox, dist:p._dist!=null?p._dist:(deptOnly?null:(p.communeExact?2:null)), why:why, years:years};
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
function ranked(){
  var f=S.filtres||{};
  var list=(S.results||[]).filter(function(p){
    if (f.has && !p.hasDate) return false;
    if (f.tel && !p.tel) return false;
    if (f.liberal && fold(p.mode||"").indexOf("liberal")<0) return false;
    if (f.hopital) {
      var st=fold(p.structure||"");
      if (st.indexOf("chu")<0 && st.indexOf("hopital")<0 && st.indexOf("hôpital")<0 && st.indexOf("universitaire")<0) return false;
    }
    return true;
  });
  list.forEach(function(p){ p.sc=scoreOf(p); });
  var key=S.sort||"qualite";
  list.sort(function(a,b){
    var sa=a.sc, sb=b.sc;
    if (key==="exp") return (sb.exp||0)-(sa.exp||0);
    if (key==="besoin") return (sb.besoin||0)-(sa.besoin||0);
    if (key==="data") return (sb.data||0)-(sa.data||0);
    if (key==="prox") return (sb.prox||0)-(sa.prox||0);
    return (sb.qualite||sb.fiab||0)-(sa.qualite||sa.fiab||0);
  });
  return list;
}
function resultsV(){
  if (S.busy) return '<h1>Recherche…</h1><p class="muted">Connexion aux sources officielles.</p>';
  if (!S.results.length) return '<button type="button" class="back" data-act="searchform">Modifier</button><div class="card"><h2>Aucun résultat</h2><p>Élargissez le rayon, changez de ville ou de spécialité.</p></div>';
  var list=ranked();
  var sorts=[["qualite","Qualité"],["exp","Expérience"],["besoin","Pertinence"],["prox","Proximité"],["data","Données"]];
  var filts=[["has","HAS seulement"],["tel","Téléphone public"],["liberal","Libéral"],["hopital","CHU / hôpital"]];
  return '<button type="button" class="back" data-act="searchform">Modifier</button><h1>'+esc(S.ville)+'</h1><p class="muted">'+list.length+' / '+S.results.length+' profils · '+esc(SPEC[S.spec]||"")+(S.srcNote?" · "+S.srcNote:"")+'</p>'+
    '<div class="chips">'+sorts.map(function(x){return '<button type="button" class="chip '+(S.sort===x[0]?"on":"")+'" data-act="sort" data-id="'+x[0]+'">'+x[1]+'</button>';}).join("")+'</div>'+
    '<div class="chips">'+filts.map(function(x){return '<button type="button" class="chip '+(S.filtres[x[0]]?"on":"")+'" data-act="filtre" data-id="'+x[0]+'">'+x[1]+'</button>';}).join("")+'</div>'+
    list.map(cardMini).join("")+'<p class="disclaimer">Classement d’aide à la lecture des sources ouvertes. Ce n’est pas un palmarès clinique ni un avis médical.</p>';
}
function whyBox(s){
  if (!s||!s.why) return "";
  return '<details class="why"><summary>Pourquoi cette note</summary>'+
    '<p><b>Pertinence '+s.besoin+'/100</b> — '+esc(s.why.besoin)+'</p>'+
    '<p><b>Qualité '+s.fiab+'/100</b> — '+esc(s.why.fiab)+'</p>'+
    '<p><b>Données '+s.data+'/100</b> — '+esc(s.why.data)+'</p></details>';
}
function cardMini(p){
  var s=p.sc||scoreOf(p); p.sc=s;
  return '<div class="item"><div class="row"><h3 style="margin:0">'+esc(p.titre+" "+p.prenom+" "+p.nom)+'</h3><span class="muted">'+(s.dist!=null?s.dist+" km":esc(p.ville||""))+'</span></div>'+
    '<div class="muted">'+esc(p.sous||SPEC[p.spec]||"")+' · '+esc(p.ville||"")+'</div>'+
    '<div class="scores" style="margin-top:8px"><div class="score '+cls(s.besoin)+'"><b>'+s.besoin+'/100</b><span>Pertinence</span></div><div class="score '+cls(s.fiab)+'"><b>'+s.fiab+'/100</b><span>Qualité</span></div><div class="score '+cls(s.data)+'"><b>'+s.data+'/100</b><span>Données</span></div></div>'+
    whyBox(s)+
    '<button type="button" class="btn soft" data-act="fiche" data-id="'+p.id+'">Voir la fiche</button></div>';
}
function ficheV(){
  var p=S.current; if(!p) return '<button type="button" class="back" data-act="home">Retour</button>';
  var s=p.sc||scoreOf(p);
  var tabs=[["synthese","Synthèse"],["fiab","Fiabilité"],["acces","Accès"],["info","Sources"]];
  var body="";
  var ageLine = p.age ? ('Âge publié : environ '+p.age+' ans (naissance '+esc(p.birthDate)+')') : 'Âge : non publié. La date de naissance est une donnée restreinte ANS, absente de l’open data et en général de FHIR public.';
  var photoBlock = p.photo ? '<img class="photo" src="'+esc(p.photo)+'" alt="photo"/>' : '<p class="muted">Photo : aucune image n’est publiée dans l’Annuaire public. L’API FHIR le permet en théorie (Practitioner.photo), l’ANS ne la verse presque jamais.</p>';
  if (S.detailTab==="synthese") {
    body = photoBlock+'<p class="muted">'+ageLine+'</p>'+
      '<div class="scores"><div class="score '+cls(s.besoin)+'"><b>'+s.besoin+'/100 ✓</b><span>Pertinence besoin · '+lecture(s.besoin)+'</span></div>'+
      '<div class="score '+cls(s.fiab)+'"><b>'+s.fiab+'/100 ✓</b><span>Qualité (compétence + expérience) · '+lecture(s.fiab)+'</span></div>'+
      '<div class="score '+cls(s.data)+'"><b>'+s.data+'/100</b><span>Fiabilité des données seules</span></div></div>'+
      whyBox(s)+
      '<div class="card"><b>Formation et compétences publiées</b>'+
        (p.diplomes&&p.diplomes.length?'<p>'+p.diplomes.map(esc).join("<br>")+'</p>':'<p class="muted">Diplômes : chargement ou non encore publiés pour ce RPPS.</p>')+
        (p.savoirFaire&&p.savoirFaire.length?'<p>'+p.savoirFaire.map(esc).join("<br>")+'</p>':'')+
        (p.hasDate?'<p>Certification HAS : '+esc(p.hasDate)+(p.oa?" · "+p.oa:"")+'</p>':'<p class="muted">Pas d’accréditation HAS listée.</p>')+
        '<p class="muted">'+(p.qualifsNote||"Les dates d’obtention de diplôme ne sont pas dans l’extraction publique.")+'</p></div>'+
      '<div class="row"><div class="metric"><b>'+esc(p.sous||SPEC[p.spec]||"—")+'</b><span class="muted">Savoir-faire</span></div><div class="metric"><b>'+esc(p.mode||"—")+'</b><span class="muted">Mode d’exercice</span></div></div>'+
      '<div class="row" style="margin-top:8px"><div class="card"><b class="fav">Points favorables</b>'+
        (p.hasDate?'<div class="fav">✓ Accréditation HAS '+esc(p.hasDate)+'</div>':'')+
        (p.rpps?'<div class="fav">✓ RPPS '+esc(p.rpps)+'</div>':'')+
        (p.tel?'<div class="fav">✓ Téléphone public</div>':'')+
        (p.fhirOk?'<div class="fav">✓ Fiche enrichie FHIR v2</div>':'')+
        '<div class="fav">✓ Source administrative ouverte</div></div>'+
      '<div class="card"><b class="vig">Points de vigilance</b>'+
        (!p.hasDate?'<div class="vig">⚠ Accréditation HAS non listée</div>':'')+
        (!p.tel?'<div class="vig">⚠ Téléphone non publié</div>':'')+
        (!p.age?'<div class="vig">⚠ Âge non publié (donnée restreinte)</div>':'')+
        '<div class="vig">⚠ Pas un taux de réussite clinique</div></div></div>';
  } else if (S.detailTab==="fiab") {
    var rows=[["Diplômes / formation",p.noteDip],["Certification HAS",p.noteCert],["Avis patients (signal faible)",p.noteAvis],["Rôle / exercice",p.noteReco],["Complétude des sources",Math.round(s.data/10)]];
    body = rows.map(function(r){return '<div class="card"><div class="row"><b>'+r[0]+'</b><span>'+r[1]+'/10</span></div><div class="bar"><i style="width:'+(r[1]*10)+'%"></i></div></div>';}).join("");
    if (p.diplomes && p.diplomes.length) body += '<div class="card"><b>Qualifications / diplômes officiels</b><p>'+p.diplomes.map(esc).join("<br>")+'</p><p class="muted">'+(p.qualifsNote||"")+'</p></div>';
    if (p.savoirFaire && p.savoirFaire.length) body += '<div class="card"><b>Savoir-faire RPPS</b><p>'+p.savoirFaire.map(esc).join("<br>")+'</p></div>';
    if (p.autorisations && p.autorisations.length) body += '<div class="card"><b>Autorisations d’exercice</b><p>'+p.autorisations.map(esc).join("<br>")+'</p></div>';
  } else if (S.detailTab==="acces") {
    body = '<div class="card"><p><b>Téléphone</b> '+esc(p.tel||"non publié")+'</p><p><b>E-mail</b> '+esc(p.email||"non publié")+'</p><p><b>Adresse</b> '+esc(p.adresse||p.ville||"—")+'</p><p><b>Structure</b> '+esc(p.structure||"—")+'</p></div>';
  } else {
    body = sourceBox("Géo — geo.api.gouv.fr", [["Ville",S.ville],["Code commune",S.code],["Département",S.dept],["Latitude",S.lat],["Longitude",S.lon]])+
      sourceBox("RPPS — tabular-api.data.gouv.fr", flattenObj(p.rawRpps), p.rawRpps?"":"Pas de ligne RPPS pour ce praticien.")+
      sourceBox("Diplômes RPPS — PS_LibreAcces_Dipl_AutExerc", p.rawDipl && p.rawDipl.length ? flattenObj(p.rawDipl) : [], p.qualifsNote||"Pas encore chargé.")+
      sourceBox("Savoir-faire RPPS — PS_LibreAcces_SavoirFaire", p.rawSf && p.rawSf.length ? flattenObj(p.rawSf) : [], "")+
      sourceBox("FHIR v2 — gateway.api.esante.gouv.fr", p.fhirRaw, p.fhirNote||(getFhirKey()?"":"Collez la clé ANS pour interroger Practitioner + PractitionerRole."));
  }
  return '<button type="button" class="back" data-act="results">Retour</button><h1>'+esc(p.titre+" "+p.prenom+" "+p.nom)+'</h1><p class="muted">'+esc(p.sous||"")+' · '+esc(p.ville||"")+' · v'+VERSION+'</p>'+
    '<div class="tabs">'+tabs.map(function(t){return '<a href="#" class="'+(S.detailTab===t[0]?"on":"")+'" data-act="dtab" data-id="'+t[0]+'">'+t[1]+'</a>';}).join("")+'</div>'+body+
    '<div class="actions"><button type="button" class="btn ghost" data-act="call">Appeler</button><button type="button" class="btn ghost" data-act="mail">E-mail</button><button type="button" class="btn primary" data-act="maps">Itinéraire</button><button type="button" class="btn ghost" data-act="share">Partager</button></div>'+
    '<p class="disclaimer">Cette application aide à s’orienter. Elle ne pose aucun diagnostic. Urgence : 15 · 18 · 17 · 112 · SMS 114.</p>';
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
    ["dipl","Diplômes RPPS (Dipl_AutExerc)","Type et libellé des diplômes / autorisations. Pas de date d’obtention dans le fichier public.","https://tabular-api.data.gouv.fr/api/resources/"+RID_DIPL+"/data/?page_size=1"],
    ["savoir","Savoir-faire RPPS","Spécialités ordinales et compétences reconnues.","https://tabular-api.data.gouv.fr/api/resources/"+RID_SF+"/data/?page_size=1"],
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
    mode:mode, rpps:rpps, src:"RPPS open data", sites:1, secteur:r["Libellé secteur d'activité"]||"",
    rawRpps:r, rawHas:null, fhirRaw:[], birthDate:"", age:null, photo:"", gender:""
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
    mode:r.Statut||"", rpps:rpps, src:"HAS open data", sites:1, communeExact:false,
    rawRpps:null, rawHas:r, fhirRaw:[], birthDate:"", age:null, photo:"", gender:""
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
        if (p.rawRpps) by[k].rawRpps = p.rawRpps;
        if (p.rawHas) by[k].rawHas = p.rawHas;
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
    list=list.slice(0,40);
    S.srcNote=(parts||[]).map(function(p){return p.kind.toUpperCase()+" "+((parseBody(p.res)||{}).meta||{}).total;}).join(" · ");
    if (!list.length) S.srcNote="aucune ligne pour cette commune / spécialité";
    S.results=list;
    S.lastSearch={label:(SPEC[S.spec]||"")+" · "+S.ville+" · "+S.rayon+" km", spec:S.spec, ville:S.ville, code:S.code, dept:S.dept, lat:S.lat, lon:S.lon, rayon:S.rayon, at:Date.now()};
    S.history.unshift({type:"RECHERCHE", label:S.lastSearch.label, spec:S.spec, ville:S.ville, code:S.code, dept:S.dept, lat:S.lat, lon:S.lon, rayon:S.rayon, at:Date.now()});
    persist();
    render();
    S.srcNote=(S.srcNote?S.srcNote+" · ":"")+"chargement diplômes…";
    render();
    return mapAllQualifs(list).then(function(withQ){
      S.results=withQ;
      S.srcNote=(S.srcNote||"").replace("chargement diplômes…","diplômes "+withQ.filter(function(p){return p.qualifsLoaded;}).length+"/"+withQ.length);
      render();
      return enrichFhir(withQ);
    }).then(function(done){
      S.results=done;
      if (getFhirKey()) S.srcNote=(S.srcNote?S.srcNote+" · ":"")+"FHIR "+done.filter(function(p){return p.fhirOk;}).length+"/"+done.length;
      S.busy=false; persist(); render();
    });
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
  var cur=S.current;
  enrichQualifs(cur).then(function(){
    if (S.current===cur) { S.current.sc=scoreOf(S.current); render(); }
  });
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
  var k=document.getElementById("fhirKey");
  if (k) {
    var save=function(){ localStorage.setItem("fhirKey", k.value.trim()); };
    k.addEventListener("change", save);
    k.addEventListener("blur", save);
    k.addEventListener("input", save);
  }
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
  else if (act==="sort") { S.sort=el.getAttribute("data-id"); render(); }
  else if (act==="filtre") {
    var fid=el.getAttribute("data-id");
    S.filtres[fid]=!S.filtres[fid];
    render();
  }
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
