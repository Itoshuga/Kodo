# Kodo

Application web/PWA pour planifier des trajets de voyage étape par étape, en solo ou à plusieurs.

## Ce que fait le projet

- Gestion de trajets avec dates de départ/retour.
- Itinéraire organisé par jour.
- Étapes détaillées (transport, correspondance, attente, visite, etc.).
- Réorganisation des étapes par drag and drop.
- Invitations de collaborateurs en temps réel.
- Synchronisation Firestore + cache local (offline-friendly).
- Personnalisation profil et thèmes visuels globaux.
- Couvertures de trajets générées via Unsplash (si clé configurée).

## Stack technique

- React + TypeScript + Vite
- Tailwind CSS
- Firebase Auth + Firestore
- Zustand (state management)
- React Router
- vite-plugin-pwa

## Prérequis

- Node.js 18+ (Node.js 20 recommandé)
- npm
- Un projet Firebase configuré
- Une clé Unsplash (optionnelle mais recommandée)

## Cloner et lancer le projet

1. Cloner le repo:

```bash
git clone https://github.com/Itoshuga/Kodo.git
cd Komo
```

2. Installer les dépendances:

```bash
npm install
```

3. Créer votre fichier d'environnement:

```bash
cp .env.example .env
```

Sous Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Renseigner les variables dans `.env`.

5. Lancer le serveur de développement:

```bash
npm run dev
```

6. Ouvrir l'app dans le navigateur:

`http://localhost:5173`

## Variables d'environnement

Voir `.env.example`.

Variables principales:

- `VITE_FIREBASE_API_KEY` (obligatoire)
- `VITE_FIREBASE_AUTH_DOMAIN` (obligatoire)
- `VITE_FIREBASE_PROJECT_ID` (obligatoire)
- `VITE_FIREBASE_STORAGE_BUCKET` (obligatoire)
- `VITE_FIREBASE_MESSAGING_SENDER_ID` (obligatoire)
- `VITE_FIREBASE_APP_ID` (obligatoire)
- `VITE_UNSPLASH_ACCESS_KEY` (recommandé)

## Commandes utiles

- `npm run dev` : démarre le projet en local.
- `npm run build` : build de production.
- `npm run preview` : prévisualise le build localement.
- `npm run lint` : lance ESLint.
- `npm run typecheck` : vérification TypeScript.

## Structure rapide

- `src/pages` : pages principales (Accueil, Trajets, Détail, Profil, Paramètres, Invitations).
- `src/components` : composants UI/layout/trajets.
- `src/store` : stores Zustand.
- `src/services` : services Firebase, collaboration, images de couverture.
- `src/utils` : utilitaires métier.

## Notes Firebase

- L'authentification par email/mot de passe doit être activée.
- Firestore est utilisé avec cache local persistant.
- Collections principales: `users`, `trips`, `invites`.

## PWA

Le projet est installable (Android/iOS) via le navigateur.

- En dev: comportement PWA partiel selon le navigateur.
- En prod (`npm run build` + `npm run preview`): comportement complet.

## Sécurité

- Ne commitez jamais votre `.env`.
- Seul `.env.example` doit être versionné.

