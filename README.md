# Bot Discord de Tickets

Bot Discord moderne de gestion de tickets utilisant **TypeScript**, **discord.js** et les **Components V2** pour des messages riches et interactifs.

## Fonctionnalités

### Système de Tickets
- 🎫 Création de tickets via menu déroulant ou commande slash
- 📋 6 types de tickets prédéfinis (Eclipse, Réduction étudiante, Problèmes techniques, Questions, Postuler, Autres)
- 🔄 Changement de type de ticket à la volée
- 📝 Templates automatiques par type de ticket
- 📄 Génération de transcripts (TXT/Markdown)
- 🔒 Permissions automatiques pour le staff et les utilisateurs

### Système de Snippets
- 💬 Messages prédéfinis pour réponses rapides
- 📤 Mode bot (envoi direct) ou aperçu (ephemeral)
- 🗂️ Organisation par catégories

### Commandes

| Commande | Description | Accès |
|----------|-------------|-------|
| `/setup` | Configure le système de tickets | Admin |
| `/ticket` | Crée un nouveau ticket | Tous |
| `/delete` | Ferme et supprime un ticket | Staff |
| `/rename` | Renomme un salon de ticket | Staff |
| `/transcript` | Génère un transcript du ticket | Staff |
| `/snippet` | Envoie un message prédéfini | Staff |

## Installation

### Prérequis
- Node.js 20+ (LTS)
- Un bot Discord avec les permissions appropriées

### Étapes

1. **Cloner le projet**
```bash
git clone <repo-url>
cd ticket-bot
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp env.example .env
```

Éditez le fichier `.env` avec vos valeurs :
```env
DISCORD_TOKEN=votre_token_ici
DISCORD_CLIENT_ID=votre_client_id_ici
DISCORD_GUILD_ID=id_serveur_dev  # Optionnel, pour le développement
```

4. **Démarrer le bot**

En développement :
```bash
npm run dev
```

En production :
```bash
npm run build
npm start
```

## Configuration du Bot Discord

### Permissions requises
- Manage Channels
- Send Messages
- Manage Messages
- Read Message History
- Embed Links
- Attach Files
- Use External Emojis
- Add Reactions

### Intents requis
- Guilds
- Guild Messages
- Message Content
- Guild Members

## Configuration sur le serveur

1. Invitez le bot sur votre serveur
2. Utilisez la commande `/setup` avec les paramètres :
   - `salon_tickets` : Salon où apparaîtra le panneau de création de tickets
   - `categorie` : Catégorie où seront créés les tickets
   - `salon_transcripts` : Salon pour stocker les transcripts
   - `role_staff_1` : Rôle principal du staff (obligatoire)
   - `role_staff_2`, `role_staff_3` : Rôles staff supplémentaires (optionnels)

## Structure du projet

```
src/
├── index.ts                 # Point d'entrée
├── client.ts                # Configuration du client Discord
├── config/
│   ├── env.ts               # Variables d'environnement
│   └── guildConfig.ts       # Configuration par serveur
├── core/
│   ├── commandHandler.ts    # Gestion des commandes
│   └── interactionHandler.ts # Gestion des interactions
├── componentsV2/
│   ├── builder.ts           # Helpers Components V2
│   ├── tickets.ts           # Components tickets
│   └── snippets.ts          # Components snippets
├── features/
│   ├── tickets/
│   │   ├── ticketTypes.ts   # Types de tickets
│   │   ├── ticketManager.ts # Logique tickets
│   │   ├── channelNaming.ts # Nommage des salons
│   │   └── templates/       # Templates automatiques
│   └── snippets/
│       ├── snippetManager.ts
│       └── definitions/     # Définitions des snippets
├── commands/
│   ├── admin/setup.ts
│   ├── tickets/
│   │   ├── ticket.ts
│   │   ├── delete.ts
│   │   ├── rename.ts
│   │   └── transcript.ts
│   └── snippets/snippet.ts
├── types/
│   └── command.ts
└── utils/
    ├── logging.ts
    └── permissions.ts
```

## Components V2

Ce bot utilise exclusivement les **Components V2** de Discord pour tous les messages riches, ce qui offre :
- Une meilleure personnalisation visuelle
- Des containers avec couleur d'accent
- Des sections avec texte et thumbnails
- Des séparateurs et mise en forme avancée

Voir le fichier `Components V2.md` pour la documentation complète.

## Scripts NPM

```bash
npm run dev      # Démarrage en développement (hot reload)
npm run build    # Compilation TypeScript
npm start        # Démarrage en production
npm run lint     # Vérification ESLint
npm run lint:fix # Correction automatique ESLint
npm run format   # Formatage avec Prettier
```

## Personnalisation

### Ajouter un type de ticket
Éditez `src/features/tickets/ticketTypes.ts` et ajoutez un nouveau type dans le tableau `TICKET_TYPES`.

### Ajouter un snippet
Créez un nouveau fichier dans `src/features/snippets/definitions/` et importez-le dans `snippetManager.ts`.

### Modifier les templates
Éditez les fichiers dans `src/features/tickets/templates/` pour personnaliser les messages automatiques.

## Licence

MIT

