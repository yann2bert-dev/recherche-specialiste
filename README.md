# Recherche de Spécialistes — BY Innovation

Application Android d’orientation vers un type de spécialiste et de comparaison de profils.

Ce n’est pas un dispositif médical. Aucun diagnostic. Urgence : 15.

## Fonctions

- Accueil avec logo BY Innovation
- Parcours symptôme en 3 listes déroulantes / choix
- Recherche directe par spécialité, ville, rayon
- Pondération Fiabilité / Avis / Proximité / Ancienneté
- Fiche à onglets Synthèse, Fiabilité, Accès, Informations
- Scores colorés (pertinence, fiabilité, confiance données)
- Synthèse, historique, profil
- Menu **Sources & API** : activer, coller une clé FHIR, tester chaque source
- Catalogue local hors-ligne (filet de sécurité)
- Partage, appel, itinéraire

## Sources testables dans l’app

| Source | Gratuit | Clé |
|---|---|---|
| Catalogue local | oui | non |
| Nominatim (géocodage) | oui | non |
| HAS médecins accrédités | oui | non |
| data.gouv.fr Annuaire Santé | oui | non |
| API FHIR Annuaire Santé ANS | oui (données publiques) | clé portail ANS optionnelle |

Sans clé FHIR, l’app continue avec le catalogue local.

## Build

```bash
export ANDROID_HOME=/chemin/vers/sdk
./gradlew :app:assembleDebug
```

APK : `app/build/outputs/apk/debug/app-debug.apk`

Package : `app.recherche.specialiste`  
minSdk 26 · targetSdk 34

## Installation

Autoriser les sources inconnues, installer l’APK debug.
