# MARV

Marv est un chatbot qui répond aux questions à contrecœur. Il est écrit en Node.js et utilise le traitement du langage naturel pour comprendre les entrées de l'utilisateur et générer des réponses appropriées. Marv est conçu pour être un compagnon de conversation, fournissant des réponses pleines d'esprit aux questions et s'engageant dans un badinage léger.

## INTRODUCTION

Marv est un bot Discord couplé à OpenAI qui vous permet d'avoir des conversations amusantes et informatives. Il intègre également des fonctionnalités de synthèse vocale et de reconnaissance vocale pour une expérience utilisateur enrichie dans le salon vocal où Marv est connecté.

- **Synthèse vocale :** Marv peut convertir du texte en parole, ce qui permet à l'utilisateur d'entendre les réponses du bot.

- **Reconnaissance vocale :** Marv est capable de comprendre les commandes vocales de l'utilisateur, ce qui améliore l'interaction et la convivialité.

## CONSTRUIT AVEC

* [Node.js](https://nodejs.org/en/) - Moteur d'exécution JavaScript.
* [Discord.js](https://discord.js.org/#/) - Bibliothèque API Discord pour Node.js.
* [OpenAI](https://openai.com/) - API OpenAI pour le traitement du langage naturel.

## PREREQUIS

Avant d'installer et d'utiliser Marv, assurez-vous d'avoir les éléments suivants :

- Un compte Google Cloud Platform (GCP).
- Un projet GCP créé pour votre instance de Projet Marv.
- Un fichier JSON de clé de service généré pour votre projet GCP.

### Installation de Google Text-to-Speech

1. Téléchargez le fichier JSON de clé de service de votre projet GCP depuis le [tableau de bord GCP](https://console.cloud.google.com/iam-admin/serviceaccounts).

2. Placez le fichier JSON dans un répertoire accessible par votre application.

3. Dans le fichier de configuration de votre application, ajoutez le chemin du fichier JSON dans la variable d'environnement `GOOGLE_APPLICATION_CREDENTIALS` (voir ci-dessous).

## DEMARRAGE  

Ces instructions vous permettront d'obtenir une copie du projet sur votre machine locale à des fins de développement et de test.

### Conditions préalables  

Les prérequis pour exécuter Marv, ce bot Discord sont Node.js version 8.0 ou supérieure et npm version 5.0 ou supérieure.

## INSTALLATION

```bash 
git clone https://github.com/Bit-Scripts/Marv 
cd Marv 
npm install # Pour Node.js. 
node index.js # N'oubliez pas de renseigner le fichier config.json, sinon Marv ne se lancera pas correctement.
cp config-example.json config.json
```

### Configuration  
   
Pour utiliser Marv sur votre serveur Discord, vous devez compléter le fichier config.json en suivant les instructions ci-dessous :

```json
{
    "token": "Token du bot Discord",
    "clientId": "ID de Marv",
    "guildId": "ID de votre serveur Discord",
    "BOT_TOKEN": "Token du bot Discord",
    "OPENAI_API_KEY": "Clé API OpenAI",
    "organization": "ID de votre organisation sur OpenAI",
    "GITHUB_TOKEN": "Token venant de GitHub",
    "GOOGLE_APPLICATION_CREDENTIALS": " ./chemin/vers/votre/fichier-de-cle.json",
    "idMarv": "ID de Marv sous forme de mention pingable",
    "TalkToMarvVoiceChannel": "ID du salon vocal pour Marv",
    "TalkToMarvTXTChannel": "ID du salon texte pour Marv",
    "MarvAdminChannel": "ID du salon texte administratif de Marv",
    "AboutMarvChannel": "ID du salon texte dédié à Marv"
}
```  
  
### Utilisation dans Discord

Pour contacter Marv, il suffit de le pinguer : @Marv suivi de votre message.

Pour arrêter la synthèse vocale en cours, utilisez la commande vocale "Arrêtes-toi".
  
## LIENS UTILES  
  
[Documentation complète](https://bit-scripts.github.io/) (à venir)  
[Signaler un problème](https://github.com/Bit-Scripts/Marv/issues)  
[Licence](./LICENSE.md)  
Ce projet est sous licence GPL-2.0. Consultez le fichier LICENSE.md pour plus de détails.  
  
Remarque : Veuillez vous référer à la documentation complète pour des instructions détaillées sur la configuration et l'utilisation de Marv.  