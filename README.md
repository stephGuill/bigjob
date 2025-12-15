# La Plateforme_ - Système de Gestion de Présence

Application web front-end pour la gestion des présences des étudiants à La Plateforme_.

##  Fonctionnalités

### Authentification
-  Inscription avec validation d'email (@laplateforme.io uniquement)
-  Connexion sécurisée
-  Gestion de session avec SessionStorage

### Utilisateurs
-  Calendrier interactif pour planifier les présences
-  Demande d'autorisation de présence
-  Visualisation de l'état des demandes (en attente, approuvée, refusée)
-  Annulation des demandes en attente (avant la date)
-  Blocage des modifications pour les dates passées

### Modérateurs
-  Accès au backoffice
-  Visualisation des demandes de présence
-  Approbation/Refus des demandes
-  Annulation d'approbation (avant la date)
-  Restauration des demandes refusées

### Administrateurs
-  Toutes les fonctionnalités des modérateurs
-  Gestion des rôles utilisateurs
-  Ajout/Suppression de modérateurs et administrateurs

##  Technologies Utilisées

- **HTML5** - Structure des pages
- **CSS3** - Styles personnalisés
- **Bootstrap 5.3** - Framework CSS responsive
- **JavaScript ES6** - Logique applicative
- **jQuery 3.7** - Manipulation DOM et AJAX
- **Bootstrap Icons** - Icônes

##  Structure du Projet

```
bigjob/
├── index.html              # Page d'accueil
├── login.html              # Page de connexion
├── register.html           # Page d'inscription
├── calendar.html           # Calendrier utilisateur
├── backoffice.html         # Interface modérateur/admin
├── styles/
│   └── main.css           # Styles personnalisés
├── js/
│   ├── main.js            # Gestion des données et authentification
│   ├── auth.js            # Logique inscription/connexion
│   ├── calendar.js        # Gestion du calendrier
│   └── backoffice.js      # Gestion du backoffice
├── data/
│   └── data.json          # Structure de données de référence
└── assets/                 # Images, polices, etc.
```

##  Installation et Utilisation

### Prérequis
- Serveur web local (WAMP, XAMPP, MAMP, ou serveur Node.js)

### Installation
1. Clonez ou téléchargez le projet dans votre répertoire web
2. Accédez à l'application via votre navigateur : `http://localhost/bigjob/`

### Comptes de Test

#### Administrateur
- Email : `admin@laplateforme.io`
- Mot de passe : `admin123`

#### Modérateur
- Email : `moderator@laplateforme.io`
- Mot de passe : `modo123`

#### Utilisateur
- Email : `jean.dupont@laplateforme.io`
- Mot de passe : `user123`

##  Gestion des Données

L'application utilise **LocalStorage** et **SessionStorage** pour simuler une base de données JSON :

- **LocalStorage** : Stockage persistant des utilisateurs et réservations
- **SessionStorage** : Gestion de la session utilisateur connecté

### Structure des Données

#### Utilisateur
```json
{
  "id": 1,
  "name": "Nom Complet",
  "email": "email@laplateforme.io",
  "password": "mot_de_passe",
  "role": "user|moderator|admin"
}
```

#### Réservation
```json
{
  "id": 1,
  "userId": 3,
  "date": "2025-12-15",
  "status": "pending|approved|rejected",
  "createdAt": "2025-12-10T10:30:00",
  "updatedAt": "2025-12-10T10:30:00"
}
```

##  Design Responsive

L'application est entièrement responsive et s'adapte à tous les types d'écrans :

-  **Smartphone** (< 576px)
-  **Tablette** (576px - 992px)
-  **Desktop** (> 992px)

##  Sécurité

### Validation Email
- Seuls les emails avec le domaine `@laplateforme.io` sont acceptés lors de l'inscription

### Gestion des Permissions
- Les routes sont protégées par authentification
- Contrôle des rôles avant l'accès aux fonctionnalités
- Redirection automatique si non autorisé

### Règles de Gestion
- Les dates passées ne peuvent pas être modifiées
- Les demandes ne peuvent être annulées qu'avant la date
- Un utilisateur ne peut faire qu'une demande par date

##  Fonctionnalités Détaillées

### Calendrier
- Navigation mois par mois
- Affichage visuel des réservations (couleurs selon le statut)
- Clic sur une date future pour créer une demande
- Liste de toutes les demandes de l'utilisateur
- Légende des couleurs

### Backoffice
- Onglets pour filtrer par statut (en attente, approuvé, refusé)
- Compteur de demandes en attente
- Historique des décisions
- Interface d'administration des utilisateurs (admin uniquement)

### Gestion des Rôles (Admin)
- Modification des rôles utilisateurs
- 3 niveaux : Utilisateur, Modérateur, Administrateur
- Interface modale pour confirmation

##  Points d'Amélioration Possibles

- Ajout d'un système de notifications
- Export des données en CSV/PDF
- Statistiques et graphiques de fréquentation
- Système de commentaires sur les demandes
- Limitation du nombre de présences par jour
- Intégration avec un vrai backend (API REST)
- Envoi d'emails de confirmation
- Authentification OAuth

##  License

Projet éducatif - La Plateforme_

##  Auteur

Développé pour le projet La Plateforme_
