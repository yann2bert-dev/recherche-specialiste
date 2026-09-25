const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat } = require('docx');
const fs = require('fs');

const NAVY = "1B3A4B";
const TEAL = "1F6F8B";
const ACCENT = "0E7C7B";
const LIGHT = "E8F1F2";
const LIGHT2 = "F4F7F8";
const MUST = "1B5E20";
const SHOULD = "E65100";
const COULD = "1565C0";
const WONT = "B71C1C";
const GRAY = "5A6A73";
const BLACK = "222222";
const WHITE = "FFFFFF";
const LINE = "C5D0D4";

const PAGE_W = 11906;
const MARGIN = 851; // ~1.5 cm
const CONTENT_W = PAGE_W - MARGIN * 2; // 10204

const thin = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: thin, bottom: thin, left: thin, right: thin };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function p(text, opts = {}) {
  const { bold = false, size = 22, color = BLACK, italics = false, align = AlignmentType.LEFT, spaceAfter = 120, spaceBefore = 0, font = "Calibri" } = opts;
  return new Paragraph({
    alignment: align,
    spacing: { after: spaceAfter, before: spaceBefore, line: 276 },
    children: [new TextRun({ text, bold, size, color, italics, font })],
  });
}

function runs(parts, opts = {}) {
  const { align = AlignmentType.LEFT, spaceAfter = 120, spaceBefore = 0 } = opts;
  return new Paragraph({
    alignment: align,
    spacing: { after: spaceAfter, before: spaceBefore, line: 276 },
    children: parts.map(x => new TextRun({ font: "Calibri", size: 22, color: BLACK, ...x })),
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 32, color: NAVY, font: "Calibri" })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, bold: true, size: 26, color: TEAL, font: "Calibri" })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, color: NAVY, font: "Calibri" })],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 80, line: 276 },
    children: [new TextRun({ text, size: 22, font: "Calibri", color: BLACK })],
  });
}

function bulletRich(parts, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 80, line: 276 },
    children: parts.map(x => new TextRun({ font: "Calibri", size: 22, color: BLACK, ...x })),
  });
}

function numItem(text, ref = "numbers") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80, line: 276 },
    children: [new TextRun({ text, size: 22, font: "Calibri", color: BLACK })],
  });
}

function cell(text, width, opts = {}) {
  const { fill = WHITE, bold = false, color = BLACK, align = AlignmentType.LEFT, size = 20, span } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: span,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, bold, size, color, font: "Calibri" })],
    })],
  });
}

function cellMulti(paragraphs, width, opts = {}) {
  const { fill = WHITE, span } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    verticalAlign: VerticalAlign.TOP,
    columnSpan: span,
    children: paragraphs,
  });
}

function headerRow(labels, widths) {
  return new TableRow({
    tableHeader: true,
    children: labels.map((l, i) => cell(l, widths[i], { fill: NAVY, bold: true, color: WHITE, size: 18 })),
  });
}

function table(rows, widths) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows,
  });
}

function note(text) {
  return new Paragraph({
    spacing: { after: 160, before: 40, line: 276 },
    shading: { type: ShadingType.CLEAR, fill: LIGHT },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: TEAL, space: 8 } },
    indent: { left: 120, right: 120 },
    children: [new TextRun({ text, size: 20, italics: true, color: NAVY, font: "Calibri" })],
  });
}

function labelValue(label, value) {
  return runs([{ text: label + " ", bold: true, color: NAVY }, { text: value }]);
}

const W4 = [1600, 2200, 2800, 3604];
const W3 = [2200, 4000, 4004];
const W2 = [2800, 7404];
const W5 = [1400, 2200, 1800, 2404, 2400];
const W_ID = [1400, 2800, 6004];
const W_MOS = [1400, 1400, 7404];
const W_SCR = [2551, 2551, 2551, 2551];
const W_ECR = [1800, 8404];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Calibri", color: NAVY },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Calibri", color: TEAL },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Calibri", color: NAVY },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 420, hanging: 240 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 240 } } } },
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 420, hanging: 240 } } } },
      ]},
      { reference: "p1", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 240 } } } }] },
      { reference: "p2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 240 } } } }] },
      { reference: "p3", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 240 } } } }] },
      { reference: "p4", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 240 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: 16838 },
        margin: { top: 851, right: MARGIN, bottom: 851, left: MARGIN },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: TEAL, space: 6 } },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Recherche spécialiste  ·  Spécifications d’origine V1", size: 16, color: GRAY, font: "Calibri" }),
          ],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 6 } },
          spacing: { before: 80 },
          children: [
            new TextRun({ text: "Confidentiel — usage projet  ·  Page ", size: 16, color: GRAY, font: "Calibri" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAY, font: "Calibri" }),
            new TextRun({ text: " / ", size: 16, color: GRAY, font: "Calibri" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: GRAY, font: "Calibri" }),
          ],
        })],
      }),
    },
    children: [
      // COVER
      p("CAHIER DES CHARGES", { size: 22, color: TEAL, bold: true, spaceAfter: 80, spaceBefore: 400 }),
      p("Spécifications d’origine — Version 1", { size: 28, color: NAVY, bold: true, spaceAfter: 80 }),
      p("Recherche spécialiste", { size: 48, color: NAVY, bold: true, spaceAfter: 200 }),
      p("Application Android — aide à l’orientation et à la comparaison de spécialistes médicaux", { size: 22, color: GRAY, italics: true, spaceAfter: 360 }),

      table([
        new TableRow({ children: [
          cell("Document", 2551, { fill: LIGHT, bold: true, color: NAVY }),
          cell("SPEC-ORIGINE-RS-V1", 2551),
          cell("Statut", 2551, { fill: LIGHT, bold: true, color: NAVY }),
          cell("Validé pour construction V1", 2551),
        ]}),
        new TableRow({ children: [
          cell("Date", 2551, { fill: LIGHT, bold: true, color: NAVY }),
          cell("25 septembre 2026", 2551),
          cell("Plateforme", 2551, { fill: LIGHT, bold: true, color: NAVY }),
          cell("Android (téléphone)", 2551),
        ]}),
        new TableRow({ children: [
          cell("Auteur", 2551, { fill: LIGHT, bold: true, color: NAVY }),
          cell("Analyste fonctionnel senior", 2551),
          cell("Public", 2551, { fill: LIGHT, bold: true, color: NAVY }),
          cell("Équipe produit / développement", 2551),
        ]}),
      ], W_SCR),

      p("", { spaceAfter: 200 }),
      note("Règle de rédaction : aucune fonction non demandée n’est ajoutée. Tout ce qui n’est pas Must ou Should V1 est soit Could optionnel, soit Won’t. L’application n’est pas un dispositif médical : elle oriente vers un type de spécialiste et compare des profils, elle ne diagnostique pas et ne prescrit pas."),

      h1("1. Contexte et périmètre V1"),
      h2("1.1 Problème métier"),
      p("Une personne qui a un symptôme ou un problème de santé ne sait pas toujours vers quel spécialiste se tourner. Ensuite, même lorsqu’elle connaît le type de spécialiste, elle a peur de « tomber sur le mauvais » (manque de rigueur, d’expérience, de résultats). Elle a besoin :"),
      bullet("d’être orientée du symptôme (ou du besoin) vers un type de spécialiste ;"),
      bullet("de trouver des spécialistes dans une zone géographique choisie ;"),
      bullet("de les comparer selon des critères de fiabilité, de formation, d’avis et de proximité ;"),
      bullet("de garder une trace de ses recherches et de pouvoir partager une fiche."),

      h2("1.2 Produit V1"),
      p("Application Android locale, en français, qui propose un moteur d’orientation + un moteur de recherche / notation de spécialistes. En V1, le catalogue repose sur un jeu de données embarqué (démo + structure réelle) et, si le réseau est disponible, sur des API publiques gratuites uniquement. Aucune API payante n’est autorisée."),

      h2("1.3 IN — inclus en V1"),
      table([
        headerRow(["ID", "Élément inclus", "Précision"], W_ID),
        new TableRow({ children: [cell("IN-01", 1400, { bold: true }), cell("Orientation symptôme → spécialité", 2800), cell("Table de correspondance locale, pas d’IA médicale.", 6004)] }),
        new TableRow({ children: [cell("IN-02", 1400, { bold: true }), cell("Recherche par spécialité", 2800), cell("Liste fermée de spécialités + champ libre limité.", 6004)] }),
        new TableRow({ children: [cell("IN-03", 1400, { bold: true }), cell("Filtre géographique", 2800), cell("Ville saisie et/ou « autour de moi » + rayon.", 6004)] }),
        new TableRow({ children: [cell("IN-04", 1400, { bold: true }), cell("Notation multicritère", 2800), cell("Score calculé + pondération utilisateur.", 6004)] }),
        new TableRow({ children: [cell("IN-05", 1400, { bold: true }), cell("Liste classée + fiche détail", 2800), cell("Résultats triés par score puis distance.", 6004)] }),
        new TableRow({ children: [cell("IN-06", 1400, { bold: true }), cell("Synthèse comparative", 2800), cell("Récapitulatif de la recherche et des profils retenus.", 6004)] }),
        new TableRow({ children: [cell("IN-07", 1400, { bold: true }), cell("Historique chronologique", 2800), cell("Recherches et fiches consultées.", 6004)] }),
        new TableRow({ children: [cell("IN-08", 1400, { bold: true }), cell("Profil utilisateur minimal", 2800), cell("Prénom, ville favorite, pondérations enregistrées.", 6004)] }),
        new TableRow({ children: [cell("IN-09", 1400, { bold: true }), cell("Mode hors-ligne", 2800), cell("Catalogue local + derniers résultats en cache.", 6004)] }),
        new TableRow({ children: [cell("IN-10", 1400, { bold: true }), cell("Partage d’une fiche", 2800), cell("Feuille de partage Android (texte).", 6004)] }),
        new TableRow({ children: [cell("IN-11", 1400, { bold: true }), cell("États d’interface", 2800), cell("Vide, chargement, erreur, hors-ligne, succès.", 6004)] }),
        new TableRow({ children: [cell("IN-12", 1400, { bold: true }), cell("Navigation 5 onglets", 2800), cell("Accueil, Recherche, Synthèse, Historique, Profil.", 6004)] }),
        new TableRow({ children: [cell("IN-13", 1400, { bold: true }), cell("Connexion locale optionnelle", 2800), cell("Identifiant local, pas de serveur de comptes obligatoire.", 6004)] }),
      ], W_ID),

      h2("1.4 OUT — exclu de la V1"),
      table([
        headerRow(["ID", "Élément exclu", "Raison"], W_ID),
        new TableRow({ children: [cell("OUT-01", 1400, { bold: true }), cell("Diagnostic médical / triage clinique", 2800), cell("Hors rôle produit ; risque réglementaire.", 6004)] }),
        new TableRow({ children: [cell("OUT-02", 1400, { bold: true }), cell("Prise de rendez-vous, paiement, téléconsult", 2800), cell("Non demandé.", 6004)] }),
        new TableRow({ children: [cell("OUT-03", 1400, { bold: true }), cell("Messagerie patient–médecin", 2800), cell("Non demandé.", 6004)] }),
        new TableRow({ children: [cell("OUT-04", 1400, { bold: true }), cell("Notifications push", 2800), cell("Non demandé en V1.", 6004)] }),
        new TableRow({ children: [cell("OUT-05", 1400, { bold: true }), cell("Compte cloud obligatoire / SSO", 2800), cell("Connexion locale suffit.", 6004)] }),
        new TableRow({ children: [cell("OUT-06", 1400, { bold: true }), cell("Espace professionnel pour saisir sa fiche", 2800), cell("Objectif long terme, pas V1.", 6004)] }),
        new TableRow({ children: [cell("OUT-07", 1400, { bold: true }), cell("Dépôt d’avis patients dans l’app", 2800), cell("V1 consomme des notes existantes du catalogue, n’en crée pas.", 6004)] }),
        new TableRow({ children: [cell("OUT-08", 1400, { bold: true }), cell("Carte interactive riche", 2800), cell("Non demandée ; ville + distance suffisent.", 6004)] }),
        new TableRow({ children: [cell("OUT-09", 1400, { bold: true }), cell("API payantes", 2800), cell("Interdit par le besoin.", 6004)] }),
        new TableRow({ children: [cell("OUT-10", 1400, { bold: true }), cell("iOS, tablette dédiée, wear", 2800), cell("Android téléphone uniquement.", 6004)] }),
        new TableRow({ children: [cell("OUT-11", 1400, { bold: true }), cell("Multilingue", 2800), cell("Français uniquement en V1.", 6004)] }),
      ], W_ID),

      h1("2. Objectifs mesurables"),
      h2("2.1 Objectifs fonctionnels V1"),
      table([
        headerRow(["ID", "Objectif", "Mesure d’atteinte"], W_ID),
        new TableRow({ children: [cell("OF-01", 1400, { bold: true }), cell("Orienter en moins de 30 s", 2800), cell("Depuis Accueil, un utilisateur décrit un symptôme et obtient 1 à 3 spécialités suggérées.", 6004)] }),
        new TableRow({ children: [cell("OF-02", 1400, { bold: true }), cell("Produire une liste classée", 2800), cell("Toute recherche valide affiche une liste triée ou un état vide explicite.", 6004)] }),
        new TableRow({ children: [cell("OF-03", 1400, { bold: true }), cell("Expliquer la note", 2800), cell("Chaque fiche affiche le score global et le détail des 6 critères.", 6004)] }),
        new TableRow({ children: [cell("OF-04", 1400, { bold: true }), cell("Respecter la pondération", 2800), cell("Modifier un poids puis relancer change l’ordre de façon déterministe.", 6004)] }),
        new TableRow({ children: [cell("OF-05", 1400, { bold: true }), cell("Fonctionner hors-ligne", 2800), cell("Orientation + recherche sur le catalogue embarqué sans réseau.", 6004)] }),
        new TableRow({ children: [cell("OF-06", 1400, { bold: true }), cell("Conserver l’historique", 2800), cell("Après redémarrage, les 50 dernières actions sont toujours là.", 6004)] }),
        new TableRow({ children: [cell("OF-07", 1400, { bold: true }), cell("Partager une fiche", 2800), cell("Le partage système ouvre au moins une app cible avec un texte lisible.", 6004)] }),
      ], W_ID),

      h2("2.2 Objectifs métier (cadrage, non bloquants pour livrer l’APK)"),
      p("Le commanditaire mesure le succès long terme par le nombre d’utilisateurs et le fait que des spécialistes renseignent un jour leurs informations. Ces indicateurs ne sont pas des exigences d’implémentation V1. En V1, le succès métier se limite à : un prototype utilisable, compréhensible, et qui évite de recommander « au hasard »."),

      h1("3. Utilisateurs et contextes d’usage"),
      h2("3.1 Persona principal — Patient chercheur"),
      table([
        new TableRow({ children: [cell("Nom type", 2800, { fill: LIGHT, bold: true }), cell("Adulte 25–75 ans, non professionnel de santé", 7404)] }),
        new TableRow({ children: [cell("Situation de déclenchement", 2800, { fill: LIGHT, bold: true }), cell("Symptôme persistant, résultat d’examen à faire interpréter, besoin d’un second avis, ou décision d’opérer.", 7404)] }),
        new TableRow({ children: [cell("Peur principale", 2800, { fill: LIGHT, bold: true }), cell("Choisir un spécialiste peu rigoureux et aggraver le problème.", 7404)] }),
        new TableRow({ children: [cell("Objectif immédiat", 2800, { fill: LIGHT, bold: true }), cell("Savoir quel type de spécialiste voir, puis qui voir près de chez soi, avec une note compréhensible.", 7404)] }),
        new TableRow({ children: [cell("Contraintes", 2800, { fill: LIGHT, bold: true }), cell("Peu de temps, parfois hors réseau (salle d’attente, transport), veut partager la fiche à un proche.", 7404)] }),
      ], W2),

      h2("3.2 Persona secondaire — Proche aidant"),
      p("Même parcours. Utilise le partage reçu ou refait la recherche pour un membre de la famille. Pas d’écran dédié : même application."),

      h2("3.3 Non-utilisateur V1"),
      p("Le spécialiste qui voudrait créer / modifier sa propre fiche n’a pas d’espace en V1. Les fiches viennent du catalogue."),

      h2("3.4 Contextes d’ouverture"),
      bullet("Depuis l’icône : besoin neuf (symptôme ou spécialité déjà connue)."),
      bullet("Depuis l’historique : reprendre une recherche précédente."),
      bullet("Depuis un lien / texte partagé : consultation informative (pas de deep link obligatoire en V1)."),

      h1("4. Exigences fonctionnelles priorisées (MoSCoW)"),
      p("Must = livrable V1 obligatoire. Should = fortement attendu si le temps le permet, mais l’APK reste acceptable sans. Could = souhaitable, non planifié. Won’t = interdit en V1."),

      h2("4.1 Must"),
      table([
        headerRow(["ID", "Priorité", "Exigence"], W_MOS),
        new TableRow({ children: [cell("RF-01", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("L’utilisateur décrit un ou plusieurs symptômes en texte libre (max 280 caractères) et/ou choisit des symptômes dans une liste fermée.", 7404)] }),
        new TableRow({ children: [cell("RF-02", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("Le système propose 1 à 3 spécialités correspondantes, chacune avec une phrase d’explication courte (non diagnostique).", 7404)] }),
        new TableRow({ children: [cell("RF-03", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("L’utilisateur peut ignorer l’orientation et choisir directement une spécialité dans une liste fermée.", 7404)] }),
        new TableRow({ children: [cell("RF-04", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("L’utilisateur saisit une ville (texte) obligatoire pour lancer une recherche de spécialistes, sauf s’il active « Autour de moi » avec une position obtenue.", 7404)] }),
        new TableRow({ children: [cell("RF-05", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("L’utilisateur choisit un rayon : 5 / 10 / 25 / 50 / 100 km. Valeur par défaut : 25 km.", 7404)] }),
        new TableRow({ children: [cell("RF-06", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("La recherche retourne les spécialistes du catalogue dont la spécialité matche ET la distance estimée ≤ rayon.", 7404)] }),
        new TableRow({ children: [cell("RF-07", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("Chaque spécialiste a un score /100 calculé selon la formule §8.4. Le score et le détail des critères sont visibles.", 7404)] }),
        new TableRow({ children: [cell("RF-08", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("L’utilisateur peut régler 4 pondérations : Fiabilité professionnelle, Avis, Proximité, Ancienneté d’exercice. Somme normalisée à 100 %.", 7404)] }),
        new TableRow({ children: [cell("RF-09", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("La liste est triée par score pondéré décroissant, ex aequo par distance croissante, puis nom.", 7404)] }),
        new TableRow({ children: [cell("RF-10", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("Fiche détail : identité, spécialité, ville, distance, score, barre par critère, diplômes/certifications connus, formations, conférences, sources d’avis (valeurs catalogue), bouton Partager.", 7404)] }),
        new TableRow({ children: [cell("RF-11", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("Écran Synthèse : récap des critères de la dernière recherche + top 3 + éventuellement 2 fiches épinglées pour comparaison.", 7404)] }),
        new TableRow({ children: [cell("RF-12", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("Historique chronologique (plus récent en haut) : recherches lancées et fiches ouvertes. Toucher une ligne la relance / rouvre.", 7404)] }),
        new TableRow({ children: [cell("RF-13", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("Profil minimal : prénom facultatif, ville favorite, rayon favori, pondérations favorites, bouton réinitialiser.", 7404)] }),
        new TableRow({ children: [cell("RF-14", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("Barre inférieure permanente à 5 onglets : Accueil, Recherche, Synthèse, Historique, Profil.", 7404)] }),
        new TableRow({ children: [cell("RF-15", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("États : chargement, vide, erreur, hors-ligne, succès. Textes imposés au §7.", 7404)] }),
        new TableRow({ children: [cell("RF-16", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("Mode hors-ligne : orientation et recherche sur le JSON embarqué. Bannière « Hors ligne — catalogue local ».", 7404)] }),
        new TableRow({ children: [cell("RF-17", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("Partage fiche : texte préformaté via Intent Android ACTION_SEND text/plain.", 7404)] }),
        new TableRow({ children: [cell("RF-18", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("Disclaimer médical visible sur Accueil et en pied de chaque résultat / fiche.", 7404)] }),
        new TableRow({ children: [cell("RF-19", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("Catalogue embarqué ≥ 40 spécialistes, ≥ 12 spécialités, ≥ 8 villes françaises, données cohérentes avec le modèle §8.", 7404)] }),
        new TableRow({ children: [cell("RF-20", 1400, { bold: true }), cell("Must", 1400, { bold: true, color: MUST }), cell("Toute donnée manquante s’affiche « Non renseigné » et n’invente pas de note : le critère est alors neutre (voir formule).", 7404)] }),
      ], W_MOS),

      h2("4.2 Should"),
      table([
        headerRow(["ID", "Priorité", "Exigence"], W_MOS),
        new TableRow({ children: [cell("RF-21", 1400, { bold: true }), cell("Should", 1400, { bold: true, color: SHOULD }), cell("Géolocalisation optionnelle « Autour de moi » (permission runtime). Refus → retour à la saisie ville.", 7404)] }),
        new TableRow({ children: [cell("RF-22", 1400, { bold: true }), cell("Should", 1400, { bold: true, color: SHOULD }), cell("Enrichissement réseau : si connecté, tentative d’une API publique gratuite (Annuaire Santé data.gouv / RPPS open data) pour compléter le catalogue. Échec silencieux + fallback local.", 7404)] }),
        new TableRow({ children: [cell("RF-23", 1400, { bold: true }), cell("Should", 1400, { bold: true, color: SHOULD }), cell("Épingler 1 ou 2 spécialistes depuis la fiche pour la Synthèse comparative.", 7404)] }),
        new TableRow({ children: [cell("RF-24", 1400, { bold: true }), cell("Should", 1400, { bold: true, color: SHOULD }), cell("Supprimer une ligne d’historique ou vider tout l’historique.", 7404)] }),
        new TableRow({ children: [cell("RF-25", 1400, { bold: true }), cell("Should", 1400, { bold: true, color: SHOULD }), cell("Connexion locale : prénom + code à 4 chiffres stocké sur l’appareil, uniquement pour afficher le prénom et verrouiller le profil. Pas de serveur.", 7404)] }),
      ], W_MOS),

      h2("4.3 Could"),
      table([
        headerRow(["ID", "Priorité", "Exigence"], W_MOS),
        new TableRow({ children: [cell("RF-26", 1400, { bold: true }), cell("Could", 1400, { bold: true, color: COULD }), cell("Mode sombre système (follow Android).", 7404)] }),
        new TableRow({ children: [cell("RF-27", 1400, { bold: true }), cell("Could", 1400, { bold: true, color: COULD }), cell("Filtre supplémentaire « accepte les nouveaux patients » si le champ existe dans le catalogue.", 7404)] }),
        new TableRow({ children: [cell("RF-28", 1400, { bold: true }), cell("Could", 1400, { bold: true, color: COULD }), cell("Appel téléphonique direct si un numéro est présent (Intent ACTION_DIAL, pas ACTION_CALL).", 7404)] }),
      ], W_MOS),

      h2("4.4 Won’t"),
      table([
        headerRow(["ID", "Priorité", "Exigence"], W_MOS),
        new TableRow({ children: [cell("RF-29", 1400, { bold: true }), cell("Won’t", 1400, { bold: true, color: WONT }), cell("Aucun diagnostic, score de gravité, ni conseil thérapeutique.", 7404)] }),
        new TableRow({ children: [cell("RF-30", 1400, { bold: true }), cell("Won’t", 1400, { bold: true, color: WONT }), cell("Pas de création de compte cloud, e-mail, mot de passe serveur, ni réseau social.", 7404)] }),
        new TableRow({ children: [cell("RF-31", 1400, { bold: true }), cell("Won’t", 1400, { bold: true, color: WONT }), cell("Pas de publication d’avis, pas de notation saisie par l’utilisateur sur un spécialiste.", 7404)] }),
        new TableRow({ children: [cell("RF-32", 1400, { bold: true }), cell("Won’t", 1400, { bold: true, color: WONT }), cell("Pas de notifications, pas de backend propriétaire obligatoire.", 7404)] }),
      ], W_MOS),

      h1("5. Parcours utilisateur principaux"),
      h2("5.1 Parcours A — Je ne sais pas quel spécialiste voir"),
      numItem("Ouverture sur Accueil. Lecture du disclaimer.", "p1"),
      numItem("Touche « Décrire mes symptômes ».", "p1"),
      numItem("Saisit un texte et/ou coche 1 à 5 symptômes de la liste. Valide.", "p1"),
      numItem("Écran Orientation : 1 à 3 spécialités + phrase. Choisit une spécialité (ou « aucune ne convient » → liste complète).", "p1"),
      numItem("Écran Recherche prérempli : spécialité + ville favorite si connue, sinon champ ville vide. Ajuste rayon et pondérations si besoin.", "p1"),
      numItem("Lance la recherche. Liste classée.", "p1"),
      numItem("Ouvre une fiche, consulte le détail du score, partage éventuellement.", "p1"),
      numItem("La recherche et la fiche sont écrites dans l’Historique. La Synthèse se met à jour.", "p1"),

      h2("5.2 Parcours B — Je connais déjà le type de spécialiste"),
      numItem("Depuis Accueil ou onglet Recherche, choisit une spécialité.", "p2"),
      numItem("Saisit la ville ou « Autour de moi ».", "p2"),
      numItem("Ajuste éventuellement les pondérations.", "p2"),
      numItem("Lance, parcourt la liste, ouvre, épingle (Should), partage.", "p2"),

      h2("5.3 Parcours C — Reprendre et comparer"),
      numItem("Onglet Historique → touche une recherche passée → relance avec les mêmes paramètres.", "p3"),
      numItem("Onglet Synthèse → voit le top 3 de la dernière recherche et les fiches épinglées.", "p3"),
      numItem("Partage une fiche à un proche via le menu système.", "p3"),

      h2("5.4 Parcours D — Hors-ligne"),
      numItem("Pas de réseau au lancement : bannière hors-ligne, catalogue local utilisé.", "p4"),
      numItem("Géolocalisation indisponible : « Autour de moi » désactivé, ville manuelle obligatoire.", "p4"),
      numItem("Recherche et orientation restent possibles. Enrichissement API ignoré.", "p4"),

      h1("6. Arborescence des écrans et navigation"),
      h2("6.1 Carte des écrans"),
      table([
        headerRow(["Code", "Écran", "Atteignable depuis"], W_ID),
        new TableRow({ children: [cell("E00", 1400, { bold: true }), cell("Splash court (≤ 1,2 s)", 2800), cell("Lancement application", 6004)] }),
        new TableRow({ children: [cell("E10", 1400, { bold: true }), cell("Accueil", 2800), cell("Onglet Accueil ; après splash", 6004)] }),
        new TableRow({ children: [cell("E20", 1400, { bold: true }), cell("Recherche (formulaire)", 2800), cell("Onglet Recherche ; CTA Accueil ; relance Historique", 6004)] }),
        new TableRow({ children: [cell("E21", 1400, { bold: true }), cell("Orientation symptômes", 2800), cell("CTA Accueil / Recherche « Décrire symptômes »", 6004)] }),
        new TableRow({ children: [cell("E22", 1400, { bold: true }), cell("Résultats", 2800), cell("Bouton Rechercher de E20", 6004)] }),
        new TableRow({ children: [cell("E30", 1400, { bold: true }), cell("Fiche spécialiste", 2800), cell("E22, E40, E50", 6004)] }),
        new TableRow({ children: [cell("E40", 1400, { bold: true }), cell("Synthèse", 2800), cell("Onglet Synthèse", 6004)] }),
        new TableRow({ children: [cell("E50", 1400, { bold: true }), cell("Historique", 2800), cell("Onglet Historique", 6004)] }),
        new TableRow({ children: [cell("E60", 1400, { bold: true }), cell("Profil", 2800), cell("Onglet Profil", 6004)] }),
        new TableRow({ children: [cell("E61", 1400, { bold: true }), cell("Connexion locale (Should)", 2800), cell("E60", 6004)] }),
      ], W_ID),

      h2("6.2 Barre inférieure"),
      p("Toujours visible sur E10, E20, E40, E50, E60. Masquée sur E00, E21, E22, E30, E61 (remplacée par une barre supérieure Retour). Cinq items, icône + libellé :"),
      bullet("Accueil"),
      bullet("Recherche"),
      bullet("Synthèse"),
      bullet("Historique"),
      bullet("Profil"),
      p("L’onglet actif est visuellement distinct. Un tap sur l’onglet déjà actif ramène à la racine de cet onglet (pas de pile infinie)."),

      h2("6.3 Règles de navigation"),
      bullet("Retour système : pop de la pile de l’onglet courant ; si pile vide, l’app passe en arrière-plan (ne ferme pas de force)."),
      bullet("Une recherche lancée bascule vers E22 dans la pile Recherche."),
      bullet("Ouvrir une fiche pousse E30 sur la pile courante."),
      bullet("Partager n’ouvre pas un écran interne : feuille système Android."),

      h1("7. Spécification écran par écran"),

      h2("7.1 E00 — Splash"),
      labelValue("But :", "Afficher le nom de l’app le temps du chargement du catalogue local."),
      labelValue("Champs :", "Aucun."),
      labelValue("Éléments :", "Nom « Recherche spécialiste », sous-titre « Trouver le bon spécialiste »."),
      labelValue("Règles :", "Durée max 1,2 s ou dès que le JSON local est lu. En cas d’échec de lecture catalogue → E10 avec état erreur bloquant (CTA Réessayer)."),

      h2("7.2 E10 — Accueil"),
      labelValue("But :", "Entrer dans les deux chemins (symptômes ou spécialité) et poser le lieu."),
      p("Champs / blocs :", { bold: true, spaceAfter: 80 }),
      bullet("Titre : « Quel spécialiste chercher ? »"),
      bullet("Champ Ville (prérempli avec ville favorite du profil si existante). Placeholder : « Ville ou code postal »."),
      bullet("Bouton secondaire « Autour de moi » (Should)."),
      bullet("CTA primaire : « Décrire mes symptômes » → E21."),
      bullet("CTA secondaire : « Choisir une spécialité » → E20 avec focus liste spécialités."),
      bullet("Bloc « Dernière recherche » si historique non vide : résumé d’une ligne + « Reprendre »."),
      bullet("Disclaimer compact (voir texte imposé §7.12)."),
      p("États :", { bold: true, spaceAfter: 80 }),
      bullet("Vide : pas de dernière recherche, bloc masqué."),
      bullet("Hors-ligne : bannière jaune « Hors ligne — catalogue local »."),
      bullet("Erreur catalogue : message + Réessayer."),
      p("Règles :", { bold: true, spaceAfter: 80 }),
      bullet("La ville saisie ici est persistée comme « ville de session » et préremplit E20."),
      bullet("Aucun lancement de recherche depuis E10 sans spécialité ou orientation."),

      h2("7.3 E21 — Orientation symptômes"),
      labelValue("But :", "Transformer un problème décrit en 1 à 3 types de spécialistes."),
      p("Champs :", { bold: true, spaceAfter: 80 }),
      bullet("Texte libre « Décrivez le problème » — 0 à 280 caractères, compteur visible."),
      bullet("Chips multi-sélection (max 5) issus de la liste fermée §8.6."),
      bullet("CTA « Voir les spécialités suggérées » actif si texte ≥ 3 caractères OU ≥ 1 chip."),
      p("Résultat (même écran, zone basse) :", { bold: true, spaceAfter: 80 }),
      bullet("1 à 3 cartes : nom de spécialité, phrase d’orientation (max 140 car.), bouton « Rechercher ces spécialistes »."),
      bullet("Lien « Choisir une autre spécialité » → E20."),
      p("États :", { bold: true, spaceAfter: 80 }),
      bullet("Chargement : 300–800 ms max (calcul local)."),
      bullet("Vide : « Aucune correspondance fiable. Choisissez une spécialité dans la liste. » + CTA E20."),
      bullet("Erreur : ne doit pas arriver (moteur local). Si table absente → message catalogue."),
      p("Règles :", { bold: true, spaceAfter: 80 }),
      bullet("Le moteur est une table mot-clé / chip → spécialité (§8.5). Pas d’appel LLM."),
      bullet("Les phrases sont factuelles : « Un cardiologue prend en charge les troubles du rythme et la douleur thoracique. » Jamais « Vous avez une maladie X »."),
      bullet("Le choix d’une spécialité ouvre E20 prérempli puis l’utilisateur lance lui-même, sauf s’il tape « Rechercher ces spécialistes » : dans ce cas E20 se valide automatiquement si une ville de session existe, sinon E20 avec ville à saisir."),

      h2("7.4 E20 — Recherche (formulaire)"),
      labelValue("But :", "Assembler les paramètres avant lancement."),
      p("Champs :", { bold: true, spaceAfter: 80 }),
      bullet("Spécialité * — liste déroulante (valeurs §8.6)."),
      bullet("Ville ou code postal * — texte. Aide à la saisie : filtrage local sur les villes du catalogue (pas d’obligation d’autocomplétion réseau)."),
      bullet("Rayon — segmented 5 / 10 / 25 / 50 / 100 km."),
      bullet("Pondérations — 4 sliders 0–10, labels : Fiabilité professionnelle, Avis, Proximité, Ancienneté d’exercice. Afficher le % normalisé en direct."),
      bullet("Bouton « Réinitialiser les poids » → 25 % chacun."),
      bullet("CTA « Rechercher »."),
      p("États :", { bold: true, spaceAfter: 80 }),
      bullet("Erreur de validation : « Choisissez une spécialité » / « Indiquez une ville ou activez Autour de moi » sous le champ concerné."),
      bullet("Hors-ligne : bannière, formulaire reste utilisable."),
      p("Règles :", { bold: true, spaceAfter: 80 }),
      bullet("CTA inactif tant que spécialité manquante OU (ville vide ET pas de position)."),
      bullet("Les pondérations à 0 sont autorisées (le critère est alors ignoré). Si les 4 sont à 0, forcer 25 % chacun au tap Rechercher et toast « Pondérations rééquilibrées ». "),

      h2("7.5 E22 — Résultats"),
      labelValue("But :", "Donner une liste actionnable, déjà classée."),
      p("En-tête :", { bold: true, spaceAfter: 80 }),
      bullet("« N spécialistes · {spécialité} · {ville} · {rayon} km »."),
      bullet("Lien « Modifier » → retour E20 avec paramètres conservés."),
      p("Carte liste (une par spécialiste) :", { bold: true, spaceAfter: 80 }),
      bullet("Nom complet, titre (Dr / Pr si connu), spécialité."),
      bullet("Ville · distance arrondie au km."),
      bullet("Score /100 en pastille."),
      bullet("3 pastilles critères les plus hauts (libellé court + note /10)."),
      bullet("Mention « Données incomplètes » si ≥ 2 critères Non renseigné."),
      p("États :", { bold: true, spaceAfter: 80 }),
      bullet("Chargement : skeleton 3 cartes, max 2 s en local."),
      bullet("Vide : « Aucun spécialiste de cette spécialité dans ce rayon. Élargissez le rayon ou changez de ville. » + CTA Modifier."),
      bullet("Erreur : « Recherche impossible. Réessayez. » + Réessayer."),
      bullet("Hors-ligne : bannière + résultats locaux."),
      bullet("Succès : liste + toast discret non bloquant inutile ; le nombre N suffit."),
      p("Règles :", { bold: true, spaceAfter: 80 }),
      bullet("Max 50 résultats affichés. Si plus, tronquer après tri et mention « 50 premiers résultats »."),
      bullet("Tap carte → E30."),
      bullet("Enregistrement automatique d’une entrée Historique de type RECHERCHE."),

      h2("7.6 E30 — Fiche spécialiste"),
      labelValue("But :", "Permettre de juger un profil sans quitter l’app, puis partager."),
      p("Blocs dans l’ordre :", { bold: true, spaceAfter: 80 }),
      bullet("Identité : nom, titre, spécialité, ville, distance."),
      bullet("Score global /100 + phrase : « Score calculé selon vos pondérations »."),
      bullet("Détail critères (6 lignes) : Diplômes & formation, Certifications, Avis patients (catalogue), Recommandations / avis collègues (catalogue), Conférences & travaux, Proximité. Chaque ligne : note /10 ou « Non renseigné », barre."),
      bullet("Textes catalogue : diplômes, certifications, formations, conférences (listes à puces, « Non renseigné » si vide)."),
      bullet("Source : « Données issues du catalogue local » et, si enrichi, « Complété par une source ouverte le {date} »."),
      bullet("Disclaimer."),
      p("Boutons :", { bold: true, spaceAfter: 80 }),
      bullet("Partager (Must)."),
      bullet("Épingler / Désépingler (Should) — max 2 épingles globales."),
      bullet("Appeler (Could) — visible seulement si telephone non vide."),
      p("États :", { bold: true, spaceAfter: 80 }),
      bullet("Erreur id inconnu : « Fiche introuvable » + Retour."),
      bullet("Hors-ligne : fiche cache ou catalogue, pas de différence visuelle hors bannière."),
      p("Règles :", { bold: true, spaceAfter: 80 }),
      bullet("Écriture Historique type FICHE à l’ouverture."),
      bullet("Texte de partage imposé §7.13."),
      bullet("Si 2 épingles déjà présentes et tap Épingler : remplacer la plus ancienne après confirmation courte « Remplacer l’épingle la plus ancienne ? » Oui / Non."),

      h2("7.7 E40 — Synthèse"),
      labelValue("But :", "Récapituler la dernière recherche et comparer jusqu’à 2 profils épinglés."),
      p("Blocs :", { bold: true, spaceAfter: 80 }),
      bullet("« Dernière recherche » : spécialité, ville, rayon, date/heure, pondérations en %."),
      bullet("Top 3 de cette recherche (mini-cartes identiques à E22, tap → E30)."),
      bullet("« Comparaison épinglée » : 0, 1 ou 2 colonnes (nom, score, 6 critères /10, ville, distance)."),
      p("États :", { bold: true, spaceAfter: 80 }),
      bullet("Vide : « Aucune recherche pour l’instant. Partez de l’accueil ou de l’onglet Recherche. » + CTA vers E10."),
      bullet("Top 3 absent (recherche vide) : masquer le bloc top 3, garder les paramètres."),
      p("Règles :", { bold: true, spaceAfter: 80 }),
      bullet("La synthèse lit uniquement la dernière RECHERCHE + les épingles. Pas de troisième source."),
      bullet("Si les pondérations du profil ont changé depuis la recherche, afficher un bandeau « Pondérations modifiées — relancer pour mettre à jour les scores » + CTA Relancer."),

      h2("7.8 E50 — Historique"),
      labelValue("But :", "Retrouver recherches et fiches dans l’ordre chronologique inverse."),
      p("Ligne RECHERCHE : icône loupe · « {spécialité} · {ville} · {rayon} km » · date relative · N résultats."),
      p("Ligne FICHE : icône personne · nom · spécialité · date relative."),
      p("Boutons (Should) : balayage gauche « Supprimer » ; menu « Tout effacer » avec confirmation."),
      p("États :", { bold: true, spaceAfter: 80 }),
      bullet("Vide : « Votre historique apparaîtra ici après une recherche. »"),
      p("Règles :", { bold: true, spaceAfter: 80 }),
      bullet("Capacité 50 entrées, FIFO au-delà."),
      bullet("Tap RECHERCHE → E20 prérempli + lancement auto vers E22."),
      bullet("Tap FICHE → E30."),
      bullet("Pas de synchro cloud."),

      h2("7.9 E60 — Profil"),
      labelValue("But :", "Mémoriser les préférences de recherche. Identité minimale."),
      p("Champs :", { bold: true, spaceAfter: 80 }),
      bullet("Prénom — facultatif, 2–30 caractères."),
      bullet("Ville favorite."),
      bullet("Rayon favori (même contrôle qu’E20)."),
      bullet("Pondérations favorites (mêmes 4 sliders)."),
      bullet("Lien « Connexion locale » (Should) → E61. Si déjà connecté : « Connecté en local — {prénom} » + « Se déconnecter » (efface le code, garde les préférences)."),
      bullet("Bouton « Réinitialiser le profil » — confirmation. Remet poids 25 %, rayon 25, ville vide, prénom vide."),
      p("États :", { bold: true, spaceAfter: 80 }),
      bullet("Succès sauvegarde : les champs se sauvent à la volée, pas de bouton Enregistrer obligatoire. Toast « Préférences enregistrées » au plus une fois par session de modification (debounce 600 ms)."),

      h2("7.10 E61 — Connexion locale (Should)"),
      labelValue("But :", "Écran de connexion demandé dans le besoin, sans serveur."),
      p("Champs : prénom, code à 4 chiffres, confirmation du code à la création."),
      p("Boutons : Créer / Déverrouiller / Annuler."),
      p("Règles : code stocké hashé (SHA-256 + sel local). 5 échecs → délai 30 s. Aucun envoi réseau. Si non implémenté (Should non retenu), E60 n’affiche pas le lien."),

      h2("7.11 Textes d’états imposés (à réutiliser partout)"),
      table([
        headerRow(["État", "Titre", "Message + action"], W_ID),
        new TableRow({ children: [cell("Chargement", 1400), cell("Recherche en cours", 2800), cell("Pas de texte long. Skeleton ou spinner. Jamais plus de 2 s en local.", 6004)] }),
        new TableRow({ children: [cell("Vide liste", 1400), cell("Aucun résultat", 2800), cell("Aucun spécialiste de cette spécialité dans ce rayon. Élargissez le rayon ou changez de ville.", 6004)] }),
        new TableRow({ children: [cell("Vide historique", 1400), cell("Historique vide", 2800), cell("Votre historique apparaîtra ici après une recherche.", 6004)] }),
        new TableRow({ children: [cell("Vide synthèse", 1400), cell("Pas encore de synthèse", 2800), cell("Aucune recherche pour l’instant. Partez de l’accueil ou de l’onglet Recherche.", 6004)] }),
        new TableRow({ children: [cell("Erreur", 1400), cell("Une erreur s’est produite", 2800), cell("Recherche impossible. Réessayez. Bouton Réessayer.", 6004)] }),
        new TableRow({ children: [cell("Hors-ligne", 1400), cell("Hors ligne", 2800), cell("Hors ligne — catalogue local. L’orientation et la recherche restent disponibles.", 6004)] }),
        new TableRow({ children: [cell("Permission refusée", 1400), cell("Position non utilisée", 2800), cell("Saisissez une ville pour continuer. Bouton OK.", 6004)] }),
        new TableRow({ children: [cell("Succès partage", 1400), cell("—", 2800), cell("Pas de toast après retour du share sheet (le système suffit).", 6004)] }),
      ], W_ID),

      h2("7.12 Disclaimer imposé (ne pas reformuler)"),
      note("Cette application aide à s’orienter vers un type de spécialiste et à comparer des profils. Elle ne pose aucun diagnostic, ne remplace pas un avis médical et n’évalue pas un pronostic. En cas d’urgence, appelez le 15."),

      h2("7.13 Texte de partage imposé"),
      p("Modèle exact, champs interpolés :"),
      note("{titre} {nom} — {specialite} — {ville} — score {score}/100 selon l’app Recherche spécialiste. Distance approx. {distance} km. Ceci n’est pas un avis médical."),

      h1("8. Données persistées, stockage, permissions"),
      h2("8.1 Entités"),
      h3("Specialiste"),
      table([
        headerRow(["Champ", "Type", "Obligatoire", "Commentaire"], W4),
        new TableRow({ children: [cell("id", 1600), cell("string", 2200), cell("oui", 2800), cell("UUID stable", 3604)] }),
        new TableRow({ children: [cell("titre", 1600), cell("enum", 2200), cell("non", 2800), cell("Dr, Pr, vide", 3604)] }),
        new TableRow({ children: [cell("nom", 1600), cell("string", 2200), cell("oui", 2800), cell("Nom d’usage", 3604)] }),
        new TableRow({ children: [cell("prenom", 1600), cell("string", 2200), cell("non", 2800), cell("", 3604)] }),
        new TableRow({ children: [cell("specialiteId", 1600), cell("string", 2200), cell("oui", 2800), cell("Réf. liste fermée", 3604)] }),
        new TableRow({ children: [cell("ville", 1600), cell("string", 2200), cell("oui", 2800), cell("", 3604)] }),
        new TableRow({ children: [cell("codePostal", 1600), cell("string", 2200), cell("non", 2800), cell("", 3604)] }),
        new TableRow({ children: [cell("pays", 1600), cell("string", 2200), cell("oui", 2800), cell("Défaut FR", 3604)] }),
        new TableRow({ children: [cell("lat", 1600), cell("double?", 2200), cell("non", 2800), cell("Pour distance", 3604)] }),
        new TableRow({ children: [cell("lon", 1600), cell("double?", 2200), cell("non", 2800), cell("", 3604)] }),
        new TableRow({ children: [cell("telephone", 1600), cell("string?", 2200), cell("non", 2800), cell("Could : appel", 3604)] }),
        new TableRow({ children: [cell("anneeDebutExercice", 1600), cell("int?", 2200), cell("non", 2800), cell("Pour ancienneté", 3604)] }),
        new TableRow({ children: [cell("diplomes", 1600), cell("string[]", 2200), cell("non", 2800), cell("", 3604)] }),
        new TableRow({ children: [cell("certifications", 1600), cell("string[]", 2200), cell("non", 2800), cell("", 3604)] }),
        new TableRow({ children: [cell("formations", 1600), cell("string[]", 2200), cell("non", 2800), cell("", 3604)] }),
        new TableRow({ children: [cell("conferences", 1600), cell("string[]", 2200), cell("non", 2800), cell("", 3604)] }),
        new TableRow({ children: [cell("noteAvisPatients", 1600), cell("int? 0–10", 2200), cell("non", 2800), cell("Catalogue, pas saisi in-app", 3604)] }),
        new TableRow({ children: [cell("noteRecommandations", 1600), cell("int? 0–10", 2200), cell("non", 2800), cell("Collègues / sites, catalogue", 3604)] }),
        new TableRow({ children: [cell("noteDiplomes", 1600), cell("int? 0–10", 2200), cell("non", 2800), cell("Si absent : calcul dérivé §8.4", 3604)] }),
        new TableRow({ children: [cell("noteCertifications", 1600), cell("int? 0–10", 2200), cell("non", 2800), cell("Idem", 3604)] }),
        new TableRow({ children: [cell("noteConferences", 1600), cell("int? 0–10", 2200), cell("non", 2800), cell("Idem", 3604)] }),
        new TableRow({ children: [cell("source", 1600), cell("string", 2200), cell("oui", 2800), cell("local | opendata", 3604)] }),
        new TableRow({ children: [cell("majAt", 1600), cell("ISO date", 2200), cell("oui", 2800), cell("", 3604)] }),
      ], W4),

      h3("RechercheHistorisee / FicheHistorisee / Profil / Epingle"),
      table([
        headerRow(["Entité", "Champs clés", "Persistance"], W3),
        new TableRow({ children: [cell("RechercheHistorisee", 2200), cell("id, specialiteId, ville, rayonKm, poids{}, nbResultats, createdAt", 4000), cell("Room / DataStore local, 50 max", 4004)] }),
        new TableRow({ children: [cell("FicheHistorisee", 2200), cell("id, specialisteId, createdAt", 4000), cell("Idem", 4004)] }),
        new TableRow({ children: [cell("Profil", 2200), cell("prenom?, villeFavorite?, rayonKm, poids{}, codeHash?", 4000), cell("DataStore chiffré EncryptedSharedPreferences pour le hash", 4004)] }),
        new TableRow({ children: [cell("Epingle", 2200), cell("specialisteId, pinnedAt — max 2", 4000), cell("Local", 4004)] }),
      ], W3),

      h2("8.2 Stockage"),
      bullet("Catalogue : assets/catalogue_specialistes.json + table_orientation.json livrés dans l’APK."),
      bullet("Cache enrichissement open data (Should) : base Room, TTL 7 jours, purge au-delà."),
      bullet("Aucune donnée de santé descriptive (texte de symptômes) n’est envoyée hors de l’appareil. Le texte symptômes peut être historisé localement dans la RechercheHistorisee (champ optionnel symptomesTexte, max 280)."),
      bullet("Pas de analytics tierce en V1."),

      h2("8.3 Permissions Android"),
      table([
        headerRow(["Permission", "Niveau", "Usage"], W3),
        new TableRow({ children: [cell("INTERNET", 2200), cell("Normal, Should", 4000), cell("Appel API publique uniquement si réseau.", 4004)] }),
        new TableRow({ children: [cell("ACCESS_NETWORK_STATE", 2200), cell("Normal, Must", 4000), cell("Détecter hors-ligne pour la bannière.", 4004)] }),
        new TableRow({ children: [cell("ACCESS_COARSE_LOCATION", 2200), cell("Runtime, Should", 4000), cell("Autour de moi.", 4004)] }),
        new TableRow({ children: [cell("ACCESS_FINE_LOCATION", 2200), cell("Runtime, Should", 4000), cell("Autour de moi, si l’utilisateur accepte.", 4004)] }),
      ], W3),
      p("Interdit en V1 : CAMERA, CONTACTS, MICROPHONE, READ_SMS, CALL_PHONE (utiliser ACTION_DIAL qui ne requiert pas CALL_PHONE)."),

      h2("8.4 Formule de score (déterministe, obligatoire)"),
      p("Six notes brutes Ni ∈ [0,10] ∪ {null} :"),
      bullet("N_dip : noteDiplomes si présente, sinon min(10, 4 + 2×nb_diplomes + 1×nb_formations) borné à 10. Si listes vides → null."),
      bullet("N_cert : noteCertifications si présente, sinon min(10, 3 + 3×nb_certifications). Listes vides → null."),
      bullet("N_avis : noteAvisPatients ou null."),
      bullet("N_reco : noteRecommandations ou null."),
      bullet("N_conf : noteConferences si présente, sinon min(10, 3 + 2×nb_conferences). Vide → null."),
      bullet("N_prox : 10 × max(0, 1 − distanceKm / rayonKm). Si distance inconnue → null."),
      p("Ancienneté N_anc (utilisée dans le poids « Ancienneté d’exercice ») : si anneeDebutExercice connue, N_anc = min(10, années_exercice / 3). Sinon null. Année courante = année système du device."),
      p("Agrégats pour les 4 sliders utilisateur :"),
      bullet("Fiabilité professionnelle F = moyenne des notes non nulles parmi {N_dip, N_cert, N_conf}. Si toutes nulles → null."),
      bullet("Avis A = moyenne des notes non nulles parmi {N_avis, N_reco}. Si toutes nulles → null."),
      bullet("Proximité P = N_prox."),
      bullet("Ancienneté E = N_anc."),
      p("Poids utilisateur wF, wA, wP, wE ≥ 0. Normalisation : on ignore les axes dont la valeur est null, on renormalise les poids restants pour que leur somme = 1. Si tous null → score affiché « N/D » et le spécialiste est reculé en fin de liste."),
      p("Score /100 = round(10 × (wF'·F + wA'·A + wP'·P + wE'·E))."),
      p("Affichage des 6 lignes de détail : on montre N_dip, N_cert, N_avis, N_reco, N_conf, N_prox (pas N_anc dans les 6 barres ; N_anc apparaît en sous-texte « Exercice depuis {année} »)."),
      note("Cette formule est la seule autorisée en V1. Pas de machine learning. Deux utilisateurs avec les mêmes poids voient le même ordre sur le même catalogue."),

      h2("8.5 Moteur d’orientation (table, pas d’IA)"),
      p("Fichier table_orientation.json : liste d’entrées { id, motsCles[], chipId?, specialiteId, phrase, poids }. Matching :"),
      numItem("Normaliser le texte libre : minuscules, sans accents, tokens ≥ 3 lettres."),
      numItem("Un mot-clé matche s’il est contenu dans le texte ou égal à un chip sélectionné."),
      numItem("Score d’une spécialité = somme des poids des entrées matchées pour cette spécialité."),
      numItem("On garde les 3 spécialités au score > 0, triées par score décroissant."),
      numItem("Aucun match → état vide E21."),
      p("Le catalogue de chips et de mots-clés V1 est fermé (liste §8.6). Ajouter un mot-clé = changement de données, pas de code."),

      h2("8.6 Listes fermées V1"),
      p("Spécialités (id — libellé) :"),
      bullet("cardio — Cardiologie"),
      bullet("chir_cardio — Chirurgie cardiaque"),
      bullet("dermato — Dermatologie"),
      bullet("gastro — Gastro-entérologie"),
      bullet("gyneco — Gynécologie-obstétrique"),
      bullet("neuro — Neurologie"),
      bullet("chir_ortho — Chirurgie orthopédique"),
      bullet("ophtalmo — Ophtalmologie"),
      bullet("orl — ORL"),
      bullet("pneumo — Pneumologie"),
      bullet("psy — Psychiatrie"),
      bullet("rhumato — Rhumatologie"),
      bullet("uro — Urologie"),
      bullet("endocrino — Endocrinologie"),
      bullet("nephro — Néphrologie"),
      bullet("pediatrie — Pédiatrie"),
      bullet("med_gen — Médecine générale"),
      p("Chips symptômes V1 : douleur thoracique, palpitations, essoufflement, douleur articulaire, mal de dos, éruption cutanée, maux de tête, vertiges, troubles digestifs, reflux, troubles visuels, baisse d’audition, troubles urinaires, troubles du cycle, anxiété / moral, toux persistante, prise ou perte de poids, fièvre prolongée."),
      p("Le développeur doit fournir au moins un mot-clé de table pour chaque chip, relié à 1 ou 2 spécialités plausibles. Exemples imposés pour éviter l’interprétation :"),
      bullet("douleur thoracique, palpitations, essoufflement → cardio (poids 3) et pneumo (poids 1)."),
      bullet("douleur articulaire, mal de dos → rhumato (2) et chir_ortho (2)."),
      bullet("éruption cutanée → dermato (3)."),
      bullet("maux de tête, vertiges → neuro (3) et orl (1)."),
      bullet("troubles digestifs, reflux → gastro (3)."),
      bullet("troubles visuels → ophtalmo (3)."),
      bullet("baisse d’audition → orl (3)."),
      bullet("troubles urinaires → uro (3) et nephro (1)."),
      bullet("troubles du cycle → gyneco (3) et endocrino (1)."),
      bullet("anxiété / moral → psy (3) et med_gen (1)."),
      bullet("toux persistante → pneumo (3) et med_gen (1)."),
      bullet("prise ou perte de poids → endocrino (2) et gastro (1) et med_gen (1)."),
      bullet("fièvre prolongée → med_gen (3)."),

      h2("8.7 Distance"),
      p("Si lat/lon du spécialiste et du point de recherche sont connus : distance Haversine en km, arrondie à l’entier."),
      p("Sinon fallback V1 : même ville (ignore casse/accents) → 2 km ; même code postal → 2 km ; sinon le spécialiste est exclu du rayon (il n’apparaît pas)."),
      p("Point de recherche : coordonnées GPS si « Autour de moi », sinon centroïde de la ville saisie. Le catalogue embarqué doit contenir un dictionnaire villes { nom, codePostal, lat, lon } pour au moins : Paris, Lyon, Marseille, Lille, Toulouse, Nantes, Bordeaux, Strasbourg, Montpellier, Nice, Rennes, Grenoble."),

      h1("9. Authentification, notifications, synchronisation"),
      table([
        headerRow(["Sujet", "Décision V1", "Détail"], W3),
        new TableRow({ children: [cell("Compte cloud", 2200), cell("Non", 4000), cell("Won’t.", 4004)] }),
        new TableRow({ children: [cell("Connexion locale", 2200), cell("Should", 4000), cell("Code 4 chiffres sur l’appareil. Voir E61.", 4004)] }),
        new TableRow({ children: [cell("Notifications", 2200), cell("Non", 4000), cell("Won’t.", 4004)] }),
        new TableRow({ children: [cell("Synchro multi-appareils", 2200), cell("Non", 4000), cell("Won’t.", 4004)] }),
        new TableRow({ children: [cell("API publique", 2200), cell("Should", 4000), cell("Uniquement gratuite, timeout 4 s, fallback local. Si l’API exige une clé payante : ne pas l’appeler.", 4004)] }),
      ], W3),
      p("Si l’enrichissement open data est implémenté : lecture seule, mapping vers le modèle Specialiste, jamais d’écriture vers un serveur. En cas de doute sur une licence, rester sur le JSON local."),

      h1("10. Exigences non fonctionnelles"),
      table([
        headerRow(["ID", "Thème", "Exigence"], W_ID),
        new TableRow({ children: [cell("RNF-01", 1400, { bold: true }), cell("Perf perçue", 2800), cell("Splash ≤ 1,2 s. Orientation locale ≤ 800 ms. Recherche locale ≤ 2 s sur 40–200 fiches.", 6004)] }),
        new TableRow({ children: [cell("RNF-02", 1400, { bold: true }), cell("Hors-ligne", 2800), cell("Toutes les Must fonctionnent sans réseau après première installation (catalogue dans l’APK).", 6004)] }),
        new TableRow({ children: [cell("RNF-03", 1400, { bold: true }), cell("Accessibilité", 2800), cell("contentDescription sur tous les CTA et pastilles score. Cible tactile ≥ 48 dp. Texte contrasté ≥ 4,5:1.", 6004)] }),
        new TableRow({ children: [cell("RNF-04", 1400, { bold: true }), cell("Langue", 2800), cell("Français uniquement. Pas de locale anglaise partielle.", 6004)] }),
        new TableRow({ children: [cell("RNF-05", 1400, { bold: true }), cell("Thème", 2800), cell("Thème clair Material 3 par défaut. Mode sombre = Could.", 6004)] }),
        new TableRow({ children: [cell("RNF-06", 1400, { bold: true }), cell("SDK", 2800), cell("minSdk 26, targetSdk 35. Téléphone portrait prioritaire. Tablette : même UI étirée, pas de layout dédié.", 6004)] }),
        new TableRow({ children: [cell("RNF-07", 1400, { bold: true }), cell("Taille APK", 2800), cell("Hors catalogues annexes, viser < 25 Mo. JSON local < 1 Mo.", 6004)] }),
        new TableRow({ children: [cell("RNF-08", 1400, { bold: true }), cell("Confidentialité", 2800), cell("Pas d’envoi des symptômes hors device. Pas de SDK pub. Politique courte dans Profil : « Données conservées uniquement sur cet appareil ».", 6004)] }),
        new TableRow({ children: [cell("RNF-09", 1400, { bold: true }), cell("Stabilité", 2800), cell("Aucun crash sur rotation, retour arrière, coupure réseau en cours de Should-API.", 6004)] }),
        new TableRow({ children: [cell("RNF-10", 1400, { bold: true }), cell("Déterminisme", 2800), cell("Même entrée + mêmes poids + même catalogue = même liste.", 6004)] }),
      ], W_ID),

      h1("11. Critères d’acceptation testables"),
      table([
        headerRow(["ID", "Scénario", "Résultat attendu"], W_ID),
        new TableRow({ children: [cell("CA-01", 1400, { bold: true }), cell("Chip « éruption cutanée » seul", 2800), cell("E21 propose Dermatologie en 1re position.", 6004)] }),
        new TableRow({ children: [cell("CA-02", 1400, { bold: true }), cell("Texte « palpitations »", 2800), cell("E21 propose Cardiologie parmi les 3.", 6004)] }),
        new TableRow({ children: [cell("CA-03", 1400, { bold: true }), cell("Texte « xyzabc » sans chip", 2800), cell("État vide E21 + CTA liste spécialités.", 6004)] }),
        new TableRow({ children: [cell("CA-04", 1400, { bold: true }), cell("Recherche cardio / Paris / 25 km", 2800), cell("Liste non vide (catalogue embarqué). Tri score desc.", 6004)] }),
        new TableRow({ children: [cell("CA-05", 1400, { bold: true }), cell("Rayon 5 km ville sans spécialiste", 2800), cell("État vide + texte imposé.", 6004)] }),
        new TableRow({ children: [cell("CA-06", 1400, { bold: true }), cell("Poids Proximité = 10, autres = 0", 2800), cell("Le plus proche est 1er. Score recalculé.", 6004)] }),
        new TableRow({ children: [cell("CA-07", 1400, { bold: true }), cell("Ouvrir une fiche", 2800), cell("6 critères visibles. Disclaimer présent. Historique +1 FICHE.", 6004)] }),
        new TableRow({ children: [cell("CA-08", 1400, { bold: true }), cell("Partager", 2800), cell("Share sheet avec le modèle §7.13.", 6004)] }),
        new TableRow({ children: [cell("CA-09", 1400, { bold: true }), cell("Tuer l’app, relancer", 2800), cell("Profil, historique, épingles conservés.", 6004)] }),
        new TableRow({ children: [cell("CA-10", 1400, { bold: true }), cell("Mode avion", 2800), cell("Bannière hors-ligne. Orientation + recherche locale OK.", 6004)] }),
        new TableRow({ children: [cell("CA-11", 1400, { bold: true }), cell("Refus permission localisation", 2800), cell("Retour saisie ville, pas de crash.", 6004)] }),
        new TableRow({ children: [cell("CA-12", 1400, { bold: true }), cell("5 onglets", 2800), cell("Tous ouvrent l’écran prévu, onglet actif distinct.", 6004)] }),
        new TableRow({ children: [cell("CA-13", 1400, { bold: true }), cell("Champ fiche vide", 2800), cell("Affiche « Non renseigné », jamais une fausse note.", 6004)] }),
        new TableRow({ children: [cell("CA-14", 1400, { bold: true }), cell("Disclaimer Accueil + fiche", 2800), cell("Texte §7.12 présent à l’identique.", 6004)] }),
        new TableRow({ children: [cell("CA-15", 1400, { bold: true }), cell("Historique 51e recherche", 2800), cell("La plus ancienne disparaît, 50 restantes.", 6004)] }),
      ], W_ID),

      h1("12. Hors périmètre explicite"),
      p("Outre le tableau §1.4, il est interdit en V1 de :"),
      bullet("introduire un chatbot médical ou un LLM pour interpréter les symptômes ;"),
      bullet("afficher un « taux de réussite opératoire » inventé (le besoin le mentionne comme exemple d’idéal métier : pas de donnée fiable en V1, donc pas de champ) ;"),
      bullet("scraper des sites d’avis grand public ;"),
      bullet("géolocaliser en continu en arrière-plan ;"),
      bullet("collecter des documents médicaux (ordonnances, imagerie) ;"),
      bullet("noter un spécialiste depuis l’app ;"),
      bullet("promesse publicitaire du type « le meilleur chirurgien de France »."),

      h1("13. Contraintes de construction APK (pour l’IA de développement)"),
      bullet("Package suggéré : app.recherche.specialiste"),
      bullet("Nom affiché : Recherche spécialiste"),
      bullet("Architecture simple : une Activity + navigation par onglets (fragments ou Navigation Compose). Compose Material 3 recommandé."),
      bullet("Couche domaine isolée : OrientationEngine, ScoreEngine, DistanceEngine, CatalogueRepository. Ces trois moteurs doivent être unit-testables sans Android."),
      bullet("UI state univoque : Loading / Empty / Error / Offline / Content. Pas d’écran « qui clignote »."),
      bullet("Catalogue et table d’orientation versionnés dans assets/. Un changement de données ne change pas les IDs déjà historisés."),
      bullet("Jeux de données : au moins 3 cardiologues à Paris, 2 à Lyon, 2 dermatologues à Paris, 2 orthopédistes à Lyon, 1 pédiatre à Marseille, et le reste réparti pour atteindre ≥ 40 fiches. Certaines fiches volontairement incomplètes pour tester « Non renseigné »."),
      bullet("Couleurs de base : fond #F4F7F8, primaire #1F6F8B, texte #1B3A4B, alerte hors-ligne #F9A825."),
      bullet("Pas de dépendance payante. Pas de Google Maps SDK (non nécessaire). Si carte Could un jour : OSM, hors V1."),

      h1("14. Glossaire"),
      table([
        headerRow(["Terme", "Définition V1"], W2),
        new TableRow({ children: [cell("Orientation", 2800), cell("Passage d’un symptôme à un type de spécialiste via table locale.", 7404)] }),
        new TableRow({ children: [cell("Score", 2800), cell("Note /100 recalculée avec les poids de l’utilisateur.", 7404)] }),
        new TableRow({ children: [cell("Catalogue", 2800), cell("Jeu de fiches spécialistes livré dans l’APK, éventuellement enrichi.", 7404)] }),
        new TableRow({ children: [cell("Pondération", 2800), cell("Importance relative donnée par l’utilisateur à 4 axes.", 7404)] }),
        new TableRow({ children: [cell("Synthèse", 2800), cell("Récapitulatif de la dernière recherche + comparaison épinglée.", 7404)] }),
        new TableRow({ children: [cell("Connexion locale", 2800), cell("Verrouillage optionnel du profil par code, sans serveur.", 7404)] }),
      ], W2),

      h1("15. Décisions figées (ne plus interpréter)"),
      numItem("V1 = Android téléphone, français, catalogue local d’abord."),
      numItem("Pas de diagnostic."),
      numItem("Pas d’avis saisis dans l’app."),
      numItem("Pas de rendez-vous."),
      numItem("Pas de notifications."),
      numItem("Partage = texte système."),
      numItem("5 onglets imposés."),
      numItem("Formule de score unique §8.4."),
      numItem("Table d’orientation unique §8.5–8.6."),
      numItem("Disclaimer unique §7.12."),
      p("Fin des spécifications d’origine V1. Toute fonction nouvelle = spécification de modification, pas un rajout silencieux dans le code.", { spaceBefore: 200, italics: true, color: GRAY }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/workdir/artifacts/SPEC-ORIGINE-Recherche-specialiste-V1.docx", buffer);
  console.log("OK", buffer.length);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
