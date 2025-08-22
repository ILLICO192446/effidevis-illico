# EFFIDevis (PDF) — prêt pour Vercel + OneDrive

## Fonctionnalités
- **Comparer deux devis PDF** (côté navigateur) : extraction texte avec `pdfjs-dist`, écarts en %.
- **Comparer un devis** avec la **base OneDrive** (un dossier de PDF) :
  - Liste les PDF du dossier via **Microsoft Graph** (`/api/list-base`).
  - Télécharge le PDF choisi via son `downloadUrl` sécurisé puis comparaison côté navigateur.

## Déploiement
1. **GitHub** : uploadez le contenu du ZIP (décompressé) dans un dépôt (ex. `effidevis`).
2. **Vercel** : Add New Project → choisissez le repo → Preset: **Vite** → Build: `npm run build` → Output: `dist`.
3. Le dossier `/api` est activé grâce à `vercel.json` (runtime Node 18).

## Variables d’environnement (Vercel → Project → Settings → Environment Variables)
- `GRAPH_TENANT_ID` — ID de votre tenant Azure AD
- `GRAPH_CLIENT_ID` — App (client) ID
- `GRAPH_CLIENT_SECRET` — Secret de l’app
- `GRAPH_DRIVE_ID` — ID du Drive (OneDrive/SharePoint) contenant *DEVIS BASE DE DONNEES*
- `GRAPH_FOLDER_ID` — ID du dossier *DEVIS BASE DE DONNEES*

### Comment obtenir DRIVE_ID et FOLDER_ID
- **SharePoint (recommandé)** :
  1) Trouvez le Site ID : `GET https://graph.microsoft.com/v1.0/sites?search=illicotravauxbrive.sharepoint.com`
  2) Drives du site : `GET /v1.0/sites/{siteId}/drives` → récupérez `id` (DRIVE_ID)
  3) Dossier par chemin : `GET /v1.0/drives/{driveId}/root:/DEVIS BASE DE DONNEES` → récupérez `id` (FOLDER_ID)

- **OneDrive utilisateur** :
  1) Drive de l’utilisateur : `GET /v1.0/users/{userPrincipalName}/drive` → `id` = DRIVE_ID
  2) Dossier par chemin : `GET /v1.0/drives/{driveId}/root:/DEVIS BASE DE DONNEES` → `id` = FOLDER_ID

> Permissions Azure AD : `Files.Read.All` (Application) + *Admin consent* requis.

## Intégration dans EFFITRAVAUX
- Ajoutez un bouton/menu "EFFIDevis" qui pointe vers l’URL Vercel de ce module.
- Ou importez les composants dans votre app si vous utilisez un mono-repo.

## Limites & améliorations
- L’extraction depuis PDF est **heuristique**. Pour des gabarits fournisseurs, on peut ajouter des **parsers dédiés** (regex par lot, colonnes PU/Qté/Total).
- On peut générer un **rapport PDF** récapitulatif (ajout futur).