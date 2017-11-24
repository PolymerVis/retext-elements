'use strict';
var visit = require('unist-util-visit');
var toString = require('nlcst-to-string');
var syllable = require('syllable');
var daleChall = require('dale-chall');
var spache = require('spache');
var daleChallFormula = require('dale-chall-formula');
var ari = require('automated-readability');
var colemanLiau = require('coleman-liau');
var flesch = require('flesch');
var smog = require('smog-formula');
var gunningFog = require('gunning-fog');
var spacheFormula = require('spache-formula');

var SOURCE = 'retext-readability';
var WORDYNESS_THRESHOLD = 5;

var own = {}.hasOwnProperty;
var floor = Math.floor;
var round = Math.round;
var ceil = Math.ceil;
var sqrt = Math.sqrt;

// TextNode, SentenceNode, ParagraphNode
function readability(options) {
  var settings = Object.assign(
    {minWords: WORDYNESS_THRESHOLD, unit: 'RootNode'},
    options
  );
  var minWords = settings.minWords;

  return transformer;

  function transformer(tree, file) {
    visit(tree, settings.unit, gather);

    function gather(node) {
      var familiarWords = {};
      var easyWord = {};
      var complexPolysillabicWord = 0;
      var familiarWordCount = 0;
      var polysillabicWord = 0;
      var totalSyllables = 0;
      var easyWordCount = 0;
      var wordCount = 0;
      var sentenceCount = 0;
      var letters = 0;
      var counts;
      var caseless;

      visit(node, 'SentenceNode', () => {
        sentenceCount += 1;
      });
      visit(node, 'WordNode', visitor);

      if (wordCount < minWords) {
        return;
      }

      counts = {
        complexPolysillabicWord: complexPolysillabicWord,
        polysillabicWord: polysillabicWord,
        unfamiliarWord: wordCount - familiarWordCount,
        difficultWord: wordCount - easyWordCount,
        syllable: totalSyllables,
        sentence: sentenceCount,
        word: wordCount,
        character: letters,
        letter: letters
      };

      var _fn_ = [
        d => gradeToAge(daleChallFormula.gradeLevel(d)[1]),
        gradeToAge,
        gradeToAge,
        fleschToAge,
        smogToAge,
        gradeToAge,
        gradeToAge
      ];

      var scores = [
        daleChallFormula(counts),
        ari(counts),
        colemanLiau(counts),
        flesch(counts),
        smog(counts),
        gunningFog(counts),
        spacheFormula(counts)
      ];

      var ages = scores.map((d, i) => _fn_[i](d));

      report(file, node, scores, ages, counts);

      function visitor(node) {
        var value = toString(node);
        var syllables = syllable(value);
        wordCount++;
        totalSyllables += syllables;
        letters += value.length;
        caseless = value.toLowerCase();

        /* Count complex words for gunning-fog based on
         * whether they have three or more syllables
         * and whether they aren’t proper nouns.  The
         * last is checked a little simple, so this
         * index might be over-eager. */
        if (syllables >= 3) {
          polysillabicWord++;

          if (value.charCodeAt(0) === caseless.charCodeAt(0)) {
            complexPolysillabicWord++;
          }
        }

        /* Find unique unfamiliar words for spache. */
        if (
          spache.indexOf(caseless) !== -1 &&
          !own.call(familiarWords, caseless)
        ) {
          familiarWords[caseless] = true;
          familiarWordCount++;
        }

        /* Find unique difficult words for dale-chall. */
        if (
          daleChall.indexOf(caseless) !== -1 &&
          !own.call(easyWord, caseless)
        ) {
          easyWord[caseless] = true;
          easyWordCount++;
        }
      }
    }
  }
}

/* Calculate the typical starting age (on the higher-end) when
 * someone joins `grade` grade, in the US.
 * See https://en.wikipedia.org/wiki/Educational_stage#United_States. */
function gradeToAge(grade) {
  return round(grade + 5);
}

/* Calculate the age relating to a Flesch result. */
function fleschToAge(value) {
  return 20 - floor(value / 10);
}

/* Calculate the age relating to a SMOG result.
 * See http://www.readabilityformulas.com/smog-readability-formula.php. */
function smogToAge(value) {
  return ceil(sqrt(value) + 2.5);
}

/* eslint-disable max-params */

/* Report the `results` if they’re reliably too hard for
 * the `target` age. */
function report(file, node, scores, ages, counts) {
  var message;
  var summary = [
    'daleChall',
    'ari',
    'colemanLiau',
    'flesch',
    'smog',
    'gunningFog',
    'spache'
  ].map((index, i) => {
    return {index, age: ages[i], score: scores[i]};
  });

  message = file.message(summary, node, SOURCE);

  message.source = SOURCE;
  message.actual = toString(node);
  message.counts = Object.keys(counts).map((index, i) => {
    return {index, count: counts[index]};
  });
}

module.exports = readability;
