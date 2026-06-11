# 🚀 Déployer DramaClip sur Vercel (5 minutes)

## Étape 1 — Créer un compte GitHub
1. Va sur **github.com**
2. Clique **Sign up** → crée un compte gratuit

## Étape 2 — Créer un repo GitHub
1. Sur GitHub, clique le **+** en haut à droite → **New repository**
2. Nom : `dramaclip`
3. Laisse tout par défaut → **Create repository**
4. Clique **uploading an existing file**
5. **Glisse-dépose TOUS les fichiers** de ce dossier (respecte la structure)
6. Clique **Commit changes**

## Étape 3 — Créer un compte Vercel
1. Va sur **vercel.com**
2. Clique **Sign Up** → **Continue with GitHub**
3. Autorise Vercel

## Étape 4 — Déployer
1. Sur Vercel, clique **Add New Project**
2. Sélectionne ton repo `dramaclip`
3. Clique **Deploy** (tout est déjà configuré)
4. Attends 1 minute ⏳
5. Vercel te donne une URL : `https://dramaclip-xxx.vercel.app`

## C'est tout ! 🎉
Ton app est en ligne, accessible depuis n'importe quel téléphone.

## Structure des fichiers
```
dramaclip/
├── api/
│   └── transcript.js     ← Backend (résout le problème CORS)
├── src/
│   ├── main.jsx
│   └── App.jsx           ← L'app
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```
