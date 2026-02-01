# Budget à Deux 💰

Application de gestion de budget pour couple, construite avec Next.js 15, Tailwind CSS, Prisma et NextAuth.

## Fonctionnalités

- 📊 **Dashboard** — Vue d'ensemble des dépenses et budgets du mois
- 💸 **Dépenses** — Ajout, filtrage et suivi des dépenses par catégorie
- 🔄 **Récurrents** — Gestion des abonnements et prélèvements réguliers
- 🎯 **Budgets** — Limites mensuelles par catégorie avec barres de progression
- ⭐ **Liste de souhaits** — Envies partagées entre les deux comptes

## Prérequis

- Node.js 22+
- PostgreSQL
- npm

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd budget-app

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Générer le client Prisma et pousser le schéma
npx prisma generate
npx prisma db push

# Remplir la base avec les données de test
npx prisma db seed

# Lancer en développement
npm run dev
```

L'app sera accessible sur [http://localhost:3000](http://localhost:3000).

## Comptes de test

| Nom     | Email              | Mot de passe  |
| ------- | ------------------ | ------------- |
| Renaud  | renaud@budget.app  | Budget2026!   |
| Copine  | copine@budget.app  | Budget2026!   |

## Docker

```bash
# Construire l'image
docker build -t budget-app .

# Lancer le conteneur
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/budget_app" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="votre-secret-ici" \
  budget-app
```

## Stack technique

- **Framework** — Next.js 15 (App Router, standalone)
- **UI** — Tailwind CSS 4, Radix UI, Lucide Icons
- **Auth** — NextAuth.js (JWT, Credentials)
- **ORM** — Prisma (PostgreSQL)
- **Charts** — Recharts
- **Dates** — date-fns

## Structure

```
src/
├── app/
│   ├── (app)/          # Pages protégées (dashboard, expenses, recurring, budgets, wishlist)
│   ├── api/            # Routes API (auth, expenses, recurring, budgets, wishlist, stats)
│   └── login/          # Page de connexion
├── components/         # Composants réutilisables
│   └── ui/             # Composants UI (shadcn)
└── lib/                # Utilitaires (prisma, auth, utils, categories)
```

## Licence

Projet privé.
