# Marv

Marv est un chatbot qui répond aux questions à contrecœur. Il est écrit en Python et utilise le traitement du langage naturel pour comprendre les entrées de l'utilisateur et générer des réponses appropriées. Marv est conçu pour être un compagnon de conversation, fournissant des réponses pleines d'esprit aux questions et s'engageant dans un badinage léger. 

Ce dépôt Github est écrit en nodejs et est utilisable directement sur votre serveur discord grâce à Discordjs et openai (l'API officiel de OpenAI en nodejs), il s'agit d'un bot Discord couplé à OpenAI.

## Construit avec

* [Node.js](https://nodejs.org/en/) - Moteur d'exécution JavaScript.
* [Discord.js](https://discord.js.org/#/) - Bibliothèque API Discord pour Node.js.
* [OpenAI](https://openai.com/) - API OpenAI pour le traitement du langage naturel.

## Démarrage 

Ces instructions vous permettront d'obtenir une copie du projet sur votre machine locale à des fins de développement et de test. 

### Conditions préalables  

Les prérequis pour exécuter Marv avec ce bot Discord sont Node.js version 8.0 ou supérieure et npm version 5.0 ou supérieure.

## Installation

```bash 
git clone https://github.com/Bit-Scripts/Marv 
cd Marv 
npm install # For Node.js. 
node index.js # n'oublier pas de renseigner le fichier config.json, sinon Marv ne se lancera pas correctement.
```

### Pour utiliser le bot en l'état

Vous devez compléter le fichier config-example.json et le renommer en config.json

### Utilisation dans Discord

Pour contacter Marv il faut le pinguer : `@Marv suivi de votre message en anglais`.  
Pour l'utiliser en Français, une API de traduction automatique a été ajouté à Marv, ainsi  
tout message en français contenant fr_FR sera traduit en anglais pour Marv et sa réponse  
sera retraduite en Français pour l'utilisateur.
