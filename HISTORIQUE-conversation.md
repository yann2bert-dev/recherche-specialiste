# Historique — Recherche spécialiste (BY Innovation)

Document de transfert pour reprendre le projet dans un autre chat.
Date de gel : 25 septembre 2026.

Ce fichier résume les demandes de l’utilisateur et les réponses livrées. Ce n’est pas une transcription mot à mot de tout le raisonnement interne. Les décisions produit et les limites connues y sont.

---

## 1. Demande initiale

Objectif : rédiger les **spécifications d’origine (cahier des charges V1)** de l’application Android « Recherche spécialiste », assez précises pour construire un APK sans interprétation.

Besoin utilisateur (texte collé) :

- Trouver un spécialiste à partir d’un symptôme ou en choisissant directement la spécialité.
- Recherche géographique (ville + rayon).
- Score à partir de diplômes, avis, certifications, proximité, ancienneté.
- Historique, partage, mode hors-ligne, navigation basse.
- Simplicité, pas de diagnostic médical.

Livrable : [SPEC-ORIGINE-Recherche-specialiste-V1.docx](docs/SPEC-ORIGINE-Recherche-specialiste-V1.docx)

Contenu de la spec :

- 12 sections obligatoires.
- Priorisation MoSCoW (RF-01 à RF-32).
- Écrans : Accueil, Recherche, Synthèse, Historique, Profil.
- États : vide, erreur, chargement, hors-ligne, succès.
- Table d’orientation symptôme → spécialité (lookup, pas un diagnostic).
- Moteur de score composite avec poids utilisateur.
- Clé RPPS, sources ouvertes (Annuaire Santé, HAS, Ameli, FINESS).
- Disclaimer : l’app n’est pas un outil de diagnostic. Urgence : 15.

Pièces associées :

- `docs/catalogue_specialistes.json` — catalogue démo (~42 fiches).
- `docs/table_orientation.json` — 18 puces + ~30 règles d’orientation.
- `docs/generate_specs.js` — script de génération du DOCX.
- `docs/besoin-initial.txt` — texte collé d’origine.

---

## 2. Demandes d’explication

L’utilisateur a demandé, en français oral :

1. Ce que sont les exigences MoSCoW.
2. Ce qu’est le backlog ticket par écran.
3. Un JSON de catalogue démo.
4. Comment qualifier un spécialiste (diplômes, avis, certifications, fiabilité, classement).
5. Comment obtenir ces informations gratuitement.
6. Quels filtres sont utiles pour un utilisateur.

Réponse donnée (résumé) :

- **MoSCoW** : Must / Should / Could / Won’t pour cette version.
- **Backlog par écran** : une carte par écran avec états et critères d’acceptation.
- Catalogue JSON livré.
- Critères de qualification : diplômes, spécialité ordinale, accréditation HAS, mode d’exercice, secteur / OPTAM, ancienneté, rôle, publications, avis (signal faible, pas un taux de réussite).
- Sources gratuites : RPPS / Annuaire Santé (data.gouv), HAS (liste des médecins accrédités), geo.api.gouv.fr, FHIR ANS **uniquement avec clé gratuite** créée sur le portail ANS.
- Filtres : spécialité, ville, rayon, secteur, carte Vitale, OPTAM, HAS, langue, téléconsultation, délai, genre, accessibilité.

---

## 3. Exemple concret

Demande : « Je cherche un chirurgien qui m’enlève un abcès dans le dos, autour d’Aix-en-Provence. »

Orientation retenue :

- abcès / boule dans le dos → chirurgie générale (drainage) + dermatologie (lésion cutanée) + médecine générale (premier recours).
- Ce n’est pas un diagnostic. Fièvre, rougeur qui s’étend, douleur violente → 15.

Médecins publics cités à titre d’illustration (sources ouvertes, pas un classement officiel) : Sebbag, Miltgen, Linzberger, Khalil, Angot, Daunois, et d’autres selon la spécialité exacte.

L’utilisateur a ensuite dit que le score était **incomplet**. Réponse : pipeline d’enrichissement multi-sources clé RPPS, valeurs neutres quand une source manque, score « adéquation au problème » + pourcentage de complétude. Sans clé FHIR, le score HAS + RPPS reste partiel et doit l’afficher clairement.

---

## 4. Demande d’APK

Demande : application propre, professionnelle, toutes les fonctions, dialogue symptômes **ou** choix direct du spécialiste, questions par listes, résultat visuel coloré proche de l’app « Artisans & Pros » (capture jointe), et **générer l’APK**.

Référence visuelle : pastilles de scores (vert / orange), onglets Synthèse / Fiabilité / Accès / Informations, points favorables / vigilance, boutons Appeler, E-mail, Itinéraire, Site / Partager.

Livrable technique :

- Projet Android WebView, package `app.recherche.specialiste`, minSdk 26, target 34.
- Logo BY Innovation (capture fournie par l’utilisateur).
- APK debug signé : `apk/Recherche-specialiste-V1.apk`.

---

## 5. Écran blanc au premier lancement

Capture : écran gris/blanc vide.

Cause : une expression régulière Unicode (`\p{Diacritic}`) faisait planter tout le JavaScript du WebView. Plus de rendu.

Correctif : plus de regex Unicode, logo visible dès le HTML statique, erreurs JS affichées au lieu d’une page vide.

---

## 6. Critique : boutons morts et API non branchées

Captures utilisateur :

- data.gouv.fr Annuaire Santé : **OK 200** (métadonnées seulement).
- API FHIR Annuaire Santé (ANS) : **Échec HTTP 403** — « You're not allowed to access this resource ».
- Ville, recherche et parcours symptômes ne répondaient pas aux clics.

Causes réelles, reconnues :

1. Les boutons écrivaient dans une variable `S` **non exposée** au HTML. Les tests API marchaient ; ville / symptômes / recherche non.
2. Le test data.gouv ne faisait que lire les métadonnées du jeu, **pas** chercher des médecins.
3. Le FHIR ANS **exige une clé** (`ESANTE-API-KEY`) créée sur https://portal.api.esante.gouv.fr . Le 403 sans clé est normal. On ne peut pas le « réparer » sans compte ANS.

Correctif livré dans la dernière version (celle du zip sources) :

- Tous les clics passent par `data-act` + un écouteur unique.
- Ville : pastilles + saisie + suggestion geo.api.gouv.fr (code INSEE, département, GPS).
- Symptômes : 3 étapes (zone, type exact, durée + alertes) + texte libre, puis spécialités proposées.
- Recherche réelle :
  - **RPPS tabulaire** `https://tabular-api.data.gouv.fr` ressource `fffda7e9-0ea2-4c35-bba0-4496f3af935d`
    filtre commune INSEE + savoir-faire.
  - **HAS tabulaire** ressource `53974cda-7ea5-4716-b82b-56a9138a0a8c`
    filtre département + spécialité, fusion par numéro RPPS.
- Fiche : pertinence / fiabilité / confiance données, points favorables et vigilance, Appeler, E-mail, Itinéraire, Partager.
- Menu Sources & API : test réel de geo, RPPS, HAS, métadonnées data.gouv, FHIR (optionnel, reste en échec sans clé).

Vérification serveur faite le 25/09/2026 :

- Aix-en-Provence, code commune `13001`, savoir-faire « Chirurgie générale » : Daunois, Angot, Khalil, Linzberger, Granier, Rinaudo, Benmiloud, etc.
- HAS département 13, « Chirurgie viscérale » : dizaines de médecins accrédités (Berdah, Bettini, etc.). Le libellé HAS n’est pas « Chirurgie générale ».

---

## 7. État du code au moment du zip

Arborescence : `sources/recherche-specialiste/`

| Fichier | Rôle |
|---|---|
| `app/src/main/assets/www/index.html` | Coquille UI |
| `app/src/main/assets/www/app.js` | Parcours, recherche, scores, API |
| `app/src/main/assets/www/logo.png` | Logo BY Innovation |
| `app/src/main/java/.../MainActivity.java` | WebView + pont HTTP (pas de CORS) |
| `app/src/main/AndroidManifest.xml` | Internet, icône |
| `README.md` | Build |

Build :

```bash
export ANDROID_HOME=/chemin/sdk
# local.properties : sdk.dir=...
./gradlew :app:assembleDebug
```

APK : `app/build/outputs/apk/debug/app-debug.apk`  
L’APK déjà compilé est dans `apk/Recherche-specialiste-V1.apk` (debug, Android 8+). Désinstaller l’ancienne version avant d’installer.

---

## 8. Limites à ne pas masquer dans le prochain chat

- Pas un dispositif médical. Pas de diagnostic. Urgence : 15.
- FHIR ANS non utilisable tant qu’il n’y a pas de clé. Ne pas prétendre que le 403 est « réparé ».
- Les avis patients ne sont pas scrapés (sites commerciaux). La note avis reste un signal faible ou neutre.
- Le score n’est pas un taux de réussite opératoire.
- HAS est au niveau **département**, pas commune. Les fiches « Dép. 13 » ne sont pas forcément à Aix.
- Téléphone parfois absent de l’open data : le bouton Appeler le dit.
- `has_subset.json` dans les assets est un reliquat ; la recherche courante passe par l’API tabulaire en ligne.
- Catalogue démo JSON de la spec n’est plus la source de la recherche live.

---

## 9. Pour continuer dans un nouveau chat

Coller ce paragraphe :

> Projet Android « Recherche de Spécialistes » BY Innovation, package `app.recherche.specialiste`. WebView + `app.js`. Recherche live : geo.api.gouv.fr + API tabulaire data.gouv (RPPS `fffda7e9-0ea2-4c35-bba0-4496f3af935d`, HAS `53974cda-7ea5-4716-b82b-56a9138a0a8c`). FHIR ANS en 403 sans clé, ne pas le forcer. UI type fiche score (pertinence, fiabilité, données, points favorables/vigilance). Parcours symptôme en 3 questions ou choix direct de spécialité. Dernier APK : debug minSdk 26. Lire `HISTORIQUE-conversation.md` et `sources/`.

Captures de référence dans `captures/` :

- `20322.jpg` et `20506.jpg` — modèle visuel Artisans & Pros.
- `20387.png` — logo BY Innovation.
- `20385.jpg` — écran blanc du premier APK.
- `20504.jpg` — écran API (data.gouv OK, FHIR 403).
