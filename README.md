retext-elements
[![GitHub release](https://img.shields.io/github/release/PolymerVis/retext-elements.svg)](https://github.com/PolymerVis/retext-elements/releases)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/PolymerVis/retext-elements)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
==========

<!---
```
<custom-element-demo>
  <template>
    <link rel="import" href="../polymer/lib/elements/dom-bind.html">
    <link rel="import" href="../polymer/lib/elements/dom-repeat.html">
    <link rel="import" href="../iron-flex-layout/iron-flex-layout-classes.html">
    <link rel="import" href="../paper-input/paper-textarea.html">
    <link rel="import" href="retext-elements.html">
    <custom-style>
      <style is="custom-style" include="iron-flex iron-flex-alignment">
      .cell {
        font-size: 0.8em;
      }
      .head {
        font-weight: bold;
      }
      .row {
        padding: 10px;
      }
      .row:nth-child(odd) {
        background-color: #eaeaea;
      }
      .index {
        font-style: italic;
        color: #888;
      }
      pre {
        color: #888;
        font-size: 0.8em;
        white-space: pre-wrap;       /* css-3 */
        white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
        white-space: -pre-wrap;      /* Opera 4-6 */
        white-space: -o-pre-wrap;    /* Opera 7 */
        word-wrap: break-word;       /* Internet Explorer 5.5+ */
      }
      </style>
    </custom-style>
    <dom-bind>
      <template is="dom-bind">
        <next-code-block></next-code-block>
      </template>
    </dom-bind>
  </template>
</custom-element-demo>
```
-->
```html
<!-- textarea where the text is data-bind -->
<paper-textarea placeholder="Type something here" value="{{text}}">
</paper-textarea>

<!-- calculate readability scores by paragraph -->
<retext-readability
  text="[[text]]"
  unit="RootNode"
  last-result="{{results}}"></retext-readability>

<!-- Template to render a table to show results -->
<template is="dom-repeat" items="[[results]]" as="unit">
  <div class="row">

    <div class="layout horizontal">

      <!-- show readability index -->
      <div class="layout vertical flex">
        <div class="layout horizontal cell head">
          <div class="flex">Index</div>
          <div class="flex">Suitable reading age</div>
        </div>
        <template is="dom-repeat" items="[[unit.readability]]">
          <div class="layout horizontal cell">
            <div class="index flex">[[item.index]]</div>
            <div class="flex">[[item.age]]</div>
          </div>
        </template>
      </div>

      <!-- show underlaying stats -->
      <div class="layout vertical flex">
        <template is="dom-repeat" items="[[unit.counts]]">
          <div class="layout horizontal cell">
            <div class="index flex">[[item.index]]</div>
            <div class="flex">[[item.count]]</div>
          </div>
        </template>
      </div>
    </div>

    <!-- unit of text -->
    <pre>[[unit.text]]</pre>

  </div>
```

## Installation
```
bower install --save PolymerVis/retext-elements
```

## Documentation and demos
More examples and documentation can be found at `retext-elements` [webcomponents page](https://www.webcomponents.org/element/PolymerVis/retext-elements).

## Disclaimers
PolymerVis is a personal project and is NOT in any way affliated with Unified (and retext), Polymer or Google.

## Summary
`retext-elements` is a suite of Polymer 2.0 elements to do some client-side text-processing with [Unified](https://unifiedjs.github.io/) and [retext](https://github.com/wooorm/retext).  

## IMPORTANT deployment information
`retext-elements` make use of [`web-worker`](https://www.webcomponents.org/element/PolymerVis/web-worker) to process text in order to prevent blocking of the UI. Hence, javascript files in `./webworkers` should be included in `polymer.json` as additional sources or dependencies so that they are properly included when you build your Polymer application.

You can also modified the location of the web-worker script through the `web-worker` attribute in any of the retext elements.

## retext-readability
`retext-readability` is available to calculate the readability scores at sentence, paragraph, and document level. The calculation is done inside a web worker to prevent blocking of the UI when the text or file is big.

The available readability indexes are:
- [Dale–Chall readability formula](https://en.wikipedia.org/wiki/Dale%E2%80%93Chall_readability_formula)
- [Automated Readability Index](https://en.wikipedia.org/wiki/Automated_readability_index)
- [Coleman–Liau index](https://en.wikipedia.org/wiki/Coleman%E2%80%93Liau_index)
- [Flesch–Kincaid grade level](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests)
- [SMOG index](https://en.wikipedia.org/wiki/SMOG)
- [Gunning fog index](https://en.wikipedia.org/wiki/Gunning_fog_index)
- [Spache readability formula](https://en.wikipedia.org/wiki/Spache_readability_formula)

*Note that each readability index has its own assumptions and limitations. E.g. SMOG requires at least 30 sentences, while Spache is only suitable up to 4th grade.*

### Quick start
#### Analyzing text contents
Download and analyze a text file from a URL.
```html
<retext-readability
  url="./thelittlematchgirl.txt"
  unit="RootNode"
  last-result="{{results}}"></retext-readability>
```

Read and analyze a text [file](https://developer.mozilla.org/en-US/docs/Web/API/File).
```html
<retext-readability
  file="[[file]]"
  unit="ParagraphNode"
  last-result="{{results}}"></retext-readability>
```

Analyze a text value.
```html
<retext-readability
  text="This is a very readable sentence"
  unit="SentenceNode"
  last-result="{{results}}"></retext-readability>
```

#### Retrieving the readability scores
Data-bind to the most recent analysis result.
```html
<retext-readability
  text="This is a very readable sentence"
  last-result="{{results}}"></retext-readability>
```

Listening to most recent analysis result.
```html
<retext-readability
  text="This is a very readable sentence"
  on-result="_onResult"></retext-readability>
```

#### Configurations and parameters
Calculate readability scores at what granularity with the attribute `unit`:
- `RootNode`: The entire text as a whole
- `ParagraphNode`: Each paragraph
- `SentenceNode`: Each sentence
```html
<retext-readability
  text="This is a very readable sentence"
  unit="SentenceNode"
  last-result="{{results}}"></retext-readability>
```

Do not calculate the readability scores if the sentence has less than the minimum number of words.
```html
<retext-readability
  text="This is a very readable sentence"
  min-words=5
  on-result="_onResult"></retext-readability>
```

## Development
### Building the webworkers scripts
The source code for the web worker scripts are in `./src`. The following command will build the distribution scripts to `./webworkers`.
```
npm run build
```
