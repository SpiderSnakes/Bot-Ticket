# Projet – Bot Discord de tickets

> **But de ce fichier**\
> Servir de référence unique pour le développement du bot de tickets Discord dans Cursor.\
> Il décrit : objectifs, stack, architecture, commandes, comportements attendus et points de configuration.

---

## 1. Objectifs du projet

### 1.1. Vision

Créer un bot Discord **moderne, propre et extensible** pour la gestion de tickets, qui :

- Utilise **TypeScript + Node.js + discord.js** (dernières versions stables).
- N’utilise **jamais** les embeds classiques Discord pour les messages riches.\
  → Tous les messages de type embed doivent être réalisés via **Components V2** (cf. `Components V2.md`).
- Offre une expérience fluide et claire pour :
  - Les membres (création et suivi de tickets).
  - Le staff (gestion rapide, raccourcis, transcripts, fermeture…).
- Prévoit dès le départ une **architecture modulaire**, pour pouvoir ajouter plus tard :
  - Auto-roles à l’arrivée.
  - Logs.
  - Fonctions communautaires diverses.

### 1.2. Fonctionnalités V1 obligatoires

1. **Système de tickets via message épinglé** dans un salon configuré :
   - Message d’introduction + menu déroulant (Components V2) pour ouvrir un ticket.
   - Tickets basés sur une liste de sujets prédéfinis.
2. **Création de tickets via commande slash** `/ticket` :
   - Avec sujet obligatoire.
   - Avec possibilité de créer un ticket pour un autre utilisateur.
3. **Gestion du ticket dans son salon dédié** :
   - Message initial épinglé (Components V2) avec boutons d’action.
   - Template automatique spécifique au type de ticket, envoyé après un léger délai (20 s).
4. **Système de raccourcis/snippets** via commande slash (`/snippet` ou équivalent) :
   - Permettre au staff d’envoyer facilement des messages pré-écrits.
   - Option pour envoyer le message **directement par le bot** ou **en réponse cachée** (ephemeral) pour que le staff puisse le copier-coller.
5. **Commandes de gestion** :
   - `/setup` : configuration initiale (salon de base, catégorie de tickets, rôles staff, salon de transcripts).
   - `/delete` : suppression du ticket (salon) – utilisable uniquement dans un salon de ticket.
   - `/rename` : renommage du salon via modal.
   - `/transcript` : export du ticket en `.txt` ou `.md`, avec option d’envoi en MP à un utilisateur.

---

## 2. Stack technique & conventions

### 2.1. Stack principale

- **Node.js** : dernière LTS.
- **TypeScript** : dernière version stable.
- **discord.js** : dernière version stable compatible avec les interactions et slash commands.
- **Gestion des commandes** : slash commands (Application Commands) uniquement.
- **Components V2** :
  - Tous les messages « riches » (équivalent embed) doivent être créés via les composants décrits dans `Components V2.md`.
  - Tous les messages full Components V2 doivent être envoyés avec le flag `MessageFlags.IsComponentsV2` et passer les builders dans la propriété `components` (aucun `embed` classique ne doit être utilisé).
  - Les exemples de la doc sont en CommonJS (`require`), mais dans ce projet tout est écrit en TypeScript avec des `import` ESM.
  - Le projet doit fournir des helpers TypeScript pour générer ces Components V2 de manière typée.

### 2.2. Qualité & outillage

- **ESLint** + **Prettier** pour un code propre.
- **ts-node / tsx** ou équivalent pour le dev.
- Scripts NPM/PNPM standard :
  - `dev` : démarrer le bot en mode développement.
  - `build` : compilation TypeScript.
  - `start` : exécuter la version build.

### 2.3. Variables d’environnement

Au minimum :

- `DISCORD_TOKEN` : token du bot.
- `DISCORD_CLIENT_ID` : ID de l’application.
- `DISCORD_GUILD_ID` (optionnel) : pour registre local des commandes lors du dev.

Le fichier `env.example` (ou `example.env`) doit lister clairement les variables nécessaires.

---

## 3. Architecture & structure des fichiers

### 3.1. Organisation globale

Proposition de structure de base :

```text
/src
  index.ts              # Entrée principale (login, démarrage du client)
  client.ts             # Création et configuration du client Discord

  config/
    env.ts              # Lecture/validation des variables d’environnement
    guildConfig.ts      # Gestion de la configuration par serveur (tickets, staff, etc.)

  core/
    commandHandler.ts   # Enregistrement et routage des slash commands
    interactionHandler.ts # Gestion globale des interactions (buttons, selects, modals)

  componentsV2/
    builder.ts          # Helpers génériques pour construire les Components V2
    tickets.ts          # Components V2 spécifiques aux tickets (panneau, message de ticket…)
    snippets.ts         # Components V2 pour les snippets/raccourcis

  features/
    tickets/
      ticketTypes.ts    # Description des différents types de tickets
      ticketManager.ts  # Logique principale de création/gestion de tickets
      channelNaming.ts  # Règles de nommage des salons
      templates/
        eclipse.ts      # Template auto pour « Activer Eclipse »
        etudiant.ts     # Template auto pour « Réduction étudiante »
        technique.ts    # Template auto pour « Problèmes techniques »
        questions.ts    # Template auto pour « Questions »
        postul er.ts    # Template auto pour « Postuler »
        autres.ts       # Template auto pour « Autres »

    snippets/
      snippetManager.ts # Logique des commandes de snippets
      definitions/
        eclipse_base.ts
        eclipse_relance.ts
        technique_base.ts
        ...             # etc. (raccourcis supplémentaires)

  commands/
    admin/
      setup.ts          # /setup
    tickets/
      ticket.ts         # /ticket
      delete.ts         # /delete
      rename.ts         # /rename
      transcript.ts     # /transcript
    snippets/
      snippet.ts        # /snippet ou /raccourci

  utils/
    logging.ts          # Fonctions de log
    permissions.ts      # Helpers de vérification des droits
    transcripts.ts      # Génération de transcripts (txt/md)

/Components V2.md       # Documentation fournie (référence, pas à modifier)
/projet.md              # Ce fichier
```

> **Objectif** : chaque fonctionnalité (tickets, snippets, etc.) possède son propre dossier dans `features/`, avec une séparation claire entre la logique, la config et les templates.

### 3.2. Configuration par serveur (guild)

La configuration pour chaque serveur doit être centralisée dans un module dédié (`config/guildConfig.ts`).

**Exemple de modèle (conceptuel) :**

```ts
type GuildConfig = {
  guildId: string;
  ticketBaseChannelId: string;    // Salon où le message de base est envoyé
  ticketCategoryId: string;       // Catégorie où les salons de tickets sont créés
  transcriptChannelId: string;    // Salon où déposer les transcripts
  staffRoleIds: string[];         // Rôles qui ont accès à tous les tickets
};
```

Pour la V1, le stockage peut être simple (fichier JSON local) avec une interface claire, pour pouvoir évoluer plus tard vers une base de données sans casser l’architecture.

---

## 4. Système de tickets

### 4.1. Types de tickets

Liste des sujets affichés dans le menu déroulant (dans cet ordre) :

1. **Activer Eclipse**
2. **Réduction étudiante**
3. **Problèmes techniques**
4. **Questions**
5. **Postuler**
6. **Autres**

Ces types sont définis dans `features/tickets/ticketTypes.ts`.

**Structure suggérée :**

```ts
export type TicketTypeId =
  | "eclipse"
  | "etudiant"
  | "technique"
  | "questions"
  | "postuler"
  | "autres";

export interface TicketType {
  id: TicketTypeId;
  label: string;           // Texte affiché dans la liste déroulante
  description: string;     // Sous-texte éventuel dans le menu
  channelPrefix: string;   // Préfixe du nom de salon (ex: "eclipse", "tech", "quest")
  autoTemplateId?: string; // Id du template automatique associé
}

export const TICKET_TYPES: TicketType[] = [
  {
    id: "eclipse",
    label: "Activer Eclipse",
    description: "Activation / vérification Eclipse",
    channelPrefix: "eclipse",
    autoTemplateId: "eclipse_auto",
  },
  // ... autres types
];
```

**Objectif** : ajouter/modifier un type de ticket doit se faire en modifiant **une seule source de vérité**.

### 4.2. Message de base (salon de création de tickets)

- Ce salon est défini via `/setup`.
- Le bot y envoie un **unique message**, épinglé automatiquement, contenant :
  - Un texte d’explication simple.
  - Un bloc Components V2 avec :
    - Titre / header : « Ouvrir un ticket ».
    - Texte : explication courte du fonctionnement.
    - Une **liste déroulante (select)** avec les types de tickets ci-dessus.
    - Ce bloc est construit typiquement avec un `ContainerBuilder` pour le texte et un `StringSelectMenuBuilder` placé dans un `ActionRowBuilder`, conformément aux exemples de `Components V2.md`.

**Comportement :**

- Lorsqu’un membre sélectionne un type :
  1. Le bot vérifie la configuration de la guilde.
  2. Le bot crée un nouveau salon dans la catégorie configurée.
  3. Le bot configure les permissions du salon (voir 4.3).
  4. Le bot envoie un message initial (Components V2) dans le salon, épinglé.
  5. Le bot programme l’envoi du template automatique correspondant (délai 20 s).

### 4.3. Permissions des salons de tickets

Pour chaque salon de ticket :

- **@everyone** :
  - `ViewChannel` : interdit.
- **Membre concerné (opener du ticket ou user cible)** :
  - `ViewChannel` + `SendMessages` : autorisés.
- **Rôles staff configurés** :
  - `ViewChannel` + `SendMessages` + gestion basique : autorisés.
- Le bot a les permissions suffisantes pour gérer salon, messages et fichiers.

### 4.4. Nommage des salons

Objectif : avoir un nom clair, identifiant le sujet, le membre et un index en cas de doublons.

**Format général :**

```text
<prefix>-<pseudo_simplifie>-<index?>
```

- `prefix` : provient du `channelPrefix` du type de ticket (`eclipse`, `tech`, `quest`, etc.).
- `pseudo_simplifie` : version simplifiée du pseudo (minuscules, espaces remplacés par `-`, caractères spéciaux nettoyés).
- `index` : nombre **optionnel**, ajouté seulement s’il existe déjà un ticket ouvert du même type pour cette personne.
  - 1er ticket : `eclipse-cyprien`
  - 2ème ticket du même type et même user : `eclipse-cyprien-2`

La logique d’index peut être implémentée en :

- Scannant les salons existants dans la catégorie.
- Comptant ceux qui matchent le pattern `<prefix>-<pseudo>*` pour ce membre.

### 4.5. Message initial dans un ticket

Le message initial est :

- Envoyé par le bot **juste après** la création du salon.
- Sous forme de **Components V2** (pas d’embed classique).
- Épinglé automatiquement dans le salon.

**Contenu attendu :**

- Titre : « Ticket – {Label du type} ».
- Mention du membre : `@user`.
- Texte expliquant :
  - qu’il s’agit de son ticket,
  - qu’il doit décrire clairement sa demande,
  - que le staff répondra dès que possible.
- Structure recommandée : un `ContainerBuilder` avec une ou plusieurs sections (titre + texte), puis une ou plusieurs rows de boutons (`ActionRowBuilder<ButtonBuilder>`) pour les actions.
- Bloc de boutons (Components V2) :
  1. **Fermer le ticket**

     - Action : lancer la procédure de fermeture (cf. `/delete`)
     - Optionnel : demander une confirmation via Components V2.

  2. **Changer le type de ticket**

     - Action : ouvrir une interface (select ou modal) pour choisir un nouveau type parmi la liste.
     - Effets :
       - Mettre à jour les métadonnées internes du ticket (type).
       - Optionnel : renommer le salon avec le nouveau `prefix`.
       - Ajouter un message de log dans le salon (« Type de ticket changé en … »).

### 4.6. Templates automatiques par type de ticket

Pour chaque type de ticket, un **template automatique** est envoyé après un délai (\~20–30 secondes) :

- Composant V2 dédié.
- Contenu ajusté au type.

**Exemples de logique :**

- **Activer Eclipse** :
  - Demander à l’utilisateur :
    - une capture d’écran de son reçu/facture Eclipse,
    - éventuellement son identifiant ou email associé.
- **Réduction étudiante** :
  - Demander justificatif étudiant, etc.
- **Problèmes techniques** :
  - Demander capture d’écran du bug,
  - version, OS, etc.

Chaque template est implémenté dans un fichier dédié :

- `features/tickets/templates/eclipse.ts`, etc.

L’objectif est de pouvoir modifier facilement le texte d’un template en éditant un seul fichier. Chaque template expose une fonction qui renvoie un payload Components V2 complet (flags + components) réutilisable par le `ticketManager`.

---

## 5. Système de snippets / raccourcis

### 5.1. Principe

Le bot doit proposer une commande (nom à choisir, ex. `/snippet` ou `/raccourci`) qui permet au staff :

- De sélectionner un **raccourci** parmi une liste prédéfinie.
- D’envoyer le message associé, soit :
  - directement dans le salon (comme message du bot),
  - soit en réponse **ephemeral** (visible uniquement par le staff) pour qu’il puisse copier-coller/modifier avant d’envoyer.

### 5.2. Commande slash

**Commande proposée :** `/snippet`

- Contexte : utilisable dans n’importe quel salon où le staff peut écrire.
- Accès : limité aux rôles staff configurés.

**Arguments :**

- `id` (obligatoire) :
  - type: choice
  - valeurs pré-remplies en fonction des snippets définis (ex: `eclipse_base`, `eclipse_relance`, `technique_base`, etc.).
- `mode` (optionnel, défaut = `bot`) :
  - `bot` : le message est envoyé par le bot dans le salon.
  - `ephemere` : le message est envoyé en réponse ephemeral au staff, pour copier/coller.

### 5.3. Organisation des snippets

Les snippets sont stockés dans `features/snippets/definitions/` sous forme de fichiers TypeScript.

**Exemple de modèle :**

```ts
export interface V2MessagePayload {
  flags: MessageFlags;      // MessageFlags.IsComponentsV2 pour les messages full Components V2
  components: any[];        // Builders Components V2 (à typer précisément dans le code)
}

export interface SnippetDefinition {
  id: string;                     // Utilisé comme choix dans la commande
  label: string;                  // Nom lisible pour le menu
  description?: string;           // Optionnel, description dans l’UI
  buildComponent: () => V2MessagePayload; // Renvoie un payload Components V2 complet (flags + components)
}
```

Un gestionnaire central (`snippetManager.ts`) :

- Expose `getSnippetById(id)`.
- Est utilisé par la commande `/snippet`.

---

## 6. Commandes détaillées

### 6.1. Vue d’ensemble

| Commande      | Accès          | Contexte                      | Rôle principal                                   |
| ------------- | -------------- | ----------------------------- | ------------------------------------------------ |
| `/setup`      | Admin / Owner  | Salon quelconque              | Configurer le système de tickets pour la guilde  |
| `/ticket`     | Tous (+ staff) | N’importe quel salon          | Créer un ticket via commande                     |
| `/delete`     | Staff          | **Uniquement** dans un ticket | Fermer/supprimer le salon de ticket              |
| `/rename`     | Staff          | **Uniquement** dans un ticket | Renommer le salon via modal                      |
| `/transcript` | Staff          | **Uniquement** dans un ticket | Exporter l’historique du ticket en fichier       |
| `/snippet`    | Staff          | N’importe quel salon          | Envoyer ou récupérer un message type (raccourci) |

---

### 6.2. `/setup`

- **Accès** : réservé aux administrateurs (ou rôle spécifique si nécessaire).
- **Objectif** : configurer tous les éléments nécessaires pour le système de tickets.

**Arguments suggérés :**

- `ticket_base_channel` (obligatoire) : salon texte où le message de base sera envoyé.
- `ticket_category` (obligatoire) : catégorie où seront créés les salons de tickets.
- `staff_roles` (obligatoire, liste) : rôles considérés comme staff.
- `transcript_channel` (obligatoire) : salon texte où seront envoyés les fichiers de transcripts.

**Comportement :**

1. Sauvegarder la config dans le système de `GuildConfig`.
2. Envoyer (ou mettre à jour) le message de base dans `ticket_base_channel` :
   - Message + Components V2 + menu déroulant.
3. Épingler ce message dans le salon.

---

### 6.3. `/ticket`

- **Accès** : tous les membres.
- **Contexte** : utilisable dans n’importe quel salon.

**Arguments :**

- `sujet` (obligatoire) : type de ticket (choix parmi les `TicketTypeId`).
- `membre` (optionnel) : user pour qui créer le ticket.
  - Si omis : le ticket est créé pour l’utilisateur qui exécute la commande.

**Comportement :**

1. Vérifier la config (`GuildConfig`).
2. Créer le salon de ticket dans la catégorie configurée.
3. Configurer les permissions (cf. 4.3).
4. Envoyer le message initial Components V2 (cf. 4.5) + l’épingler.
5. Programmer l’envoi du template automatique (cf. 4.6).

---

### 6.4. `/delete`

- **Accès** : staff uniquement.
- **Contexte** : commande valide **uniquement** dans un salon identifié comme ticket.

**Comportement :**

1. Vérifier que le salon courant est un ticket (par nom, ID ou métadonnées internes).
2. Optionnel :
   - proposer un rappel de transcript si aucun transcript n’a été fait.
3. Supprimer le salon (après éventuel message de confirmation).

En dehors d’un salon de ticket, la commande doit répondre en **ephemeral** avec un message d’erreur clair.

---

### 6.5. `/rename`

- **Accès** : staff uniquement.
- **Contexte** : **uniquement** dans un salon de ticket.

**Comportement :**

1. Ouvrir un **modal** avec un champ texte :
   - Label : « Nouveau nom de salon ».
   - Contrôle sur la longueur (1–100 caractères).
2. À la validation : renommer le salon.
3. Optionnel : ajouter un petit message dans le ticket pour garder une trace du renommage.

---

### 6.6. `/transcript`

- **Accès** : staff uniquement.
- **Contexte** : **uniquement** dans un salon de ticket.

**Arguments :**

- `format` (optionnel, défaut = `txt`) : `txt` ou `markdown`.
- `envoyer_a` (optionnel) : utilisateur à qui envoyer le transcript en MP.

**Comportement :**

1. Récupérer l’historique complet du salon (messages, auteur, date, contenu).
2. Construire un fichier dans le format choisi :
   - `.txt` : lignes simples type `YYYY-MM-DD HH:MM - Auteur: message`.
   - `.md` : version plus lisible avec Markdown.
3. Envoyer le fichier dans le `transcript_channel` configuré.
4. Si `envoyer_a` est renseigné :
   - Envoyer le même fichier en MP à l’utilisateur choisi.

---

### 6.7. `/snippet`

- **Accès** : staff uniquement.
- **Contexte** : n’importe quel salon où le staff peut écrire.

**Arguments :**

- `id` (obligatoire) : choix parmi les snippets définis.
- `mode` (optionnel, `bot` ou `ephemere`, défaut = `bot`).

**Comportement :**

1. Récupérer la définition du snippet.
2. `mode = bot` :
   - Envoyer le Component V2 correspondant directement dans le salon.
3. `mode = ephemere` :
   - Répondre à l’utilisateur en ephemeral avec le contenu (facile à copier/coller).

---

## 7. Composants V2 – Contraintes globales

1. **Interdiction d’utiliser les embeds classiques.**
2. Tous les messages « riches » (panneaux d’info, templates, snippets) doivent :
   - être construits via des helpers Components V2,
   - suivre les conventions définies dans `Components V2.md`.
3. Il est recommandé d’avoir :
   - un module `componentsV2/builder.ts` pour les briques génériques (titres, champs, boutons…),
   - des modules spécialisés par fonctionnalité (tickets, snippets).

---

## 8. Aspects non fonctionnels

### 8.1. Robustesse & erreurs

- Gérer les cas suivants :
  - `/setup` non configuré → empêcher la création de tickets et expliquer la marche à suivre.
  - Catégorie ou salon supprimés manuellement → avertir les admins lors des tentatives de création.
  - Permissions insuffisantes → log clair (console + salon de log si prévu plus tard).

### 8.2. Extensibilité

L’architecture doit permettre d’ajouter facilement de nouvelles fonctionnalités, par exemple :

- Logs d’actions (ouverture/fermeture, rename, changement de type).
- Auto-role à l’arrivée.
- Commandes communautaires.

Cela signifie :

- ne pas mélanger la logique « cœur bot » et la logique « tickets »,
- centraliser `GuildConfig`,
- séparer les fonctionnalités en `features/*`.

---

## 9. Roadmap

### V1 – Version tickets de base (prioritaire)

-

### V1.x – Améliorations

-

---

Ce fichier `projet.md` doit rester la **référence principale** pour l’évolution du bot.\
Toute nouvelle fonctionnalité devra être ajoutée ici (objectifs, comportement, fichiers concernés) avant d’être codée dans Cursor.

