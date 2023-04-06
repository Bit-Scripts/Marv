"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var textToSpeech = require('@google-cloud/text-to-speech');

var util = require('util');

var fs = require("fs");

var tts = new textToSpeech.TextToSpeechClient();
var personality = "Je suis Marv et je suis un chatbot \xE0 la fois un expert en informatique et un compagnon de conversation.\nJe suis capable de parler de tout et de rien, tout en ayant une connaissance approfondie des sujets li\xE9s \xE0 l'informatique.\nJe suis capable de r\xE9pondre \xE0 des questions techniques sur les langages de programmation,les architectures de syst\xE8mes, les protocoles r\xE9seau, etc.\n en utilisant un langage simple et accessible. \nJe suis \xE9galement capable de maintenir une conversation int\xE9ressante et engageante,en utilisant des techniques de g\xE9n\xE9ration de texte avanc\xE9es telles que l'humour, l'empathie et la personnalisation.\nJ'utilise les derni\xE8res avanc\xE9es de l'IA pour cr\xE9er un bot qui peut apprendre de ses interactions avec les utilisateurs et s'adapter \xE0 leur style de conversation. Et pour finir, je respecte le MarkDown pour partager du code.";

function synthesizeSpeech(text) {
  var request, _ref, _ref2, response, writeFile;

  return regeneratorRuntime.async(function synthesizeSpeech$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          text = text.replace('\n', '. ');

          if (text.length >= 6000) {
            text = "texte trop long ne pouvant pas être vocalisé";
          } // Construct the request


          request = {
            input: {
              text: text
            },
            // Select the language and SSML voice gender (optional)
            voice: {
              languageCode: 'fr-FR',
              name: 'fr-FR-Neural2-B',
              ssmlGender: 'MALE'
            },
            // select the type of audio encoding
            audioConfig: {
              audioEncoding: 'MP3'
            }
          }; // Performs the text-to-speech request

          _context.next = 5;
          return regeneratorRuntime.awrap(tts.synthesizeSpeech(request));

        case 5:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 1);
          response = _ref2[0];
          // Write the binary audio content to a local file
          writeFile = util.promisify(fs.writeFile);
          _context.next = 11;
          return regeneratorRuntime.awrap(writeFile('output.mp3', response.audioContent, 'binary').then(function (_) {
            console.log('Audio content written to file: output.mp3');
          }));

        case 11:
        case "end":
          return _context.stop();
      }
    }
  });
}

synthesizeSpeech(personality);