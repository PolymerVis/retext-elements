const vfile = require('to-vfile');
const unified = require('unified');
const english = require('retext-english');
const stringify = require('retext-stringify');

const readability = require('./retext-readability-index.js');

self.onmessage = function(e) {
  var {file, url, text, minWords, unit} = e.data;
  var opts = {minWords, unit};
  var job;
  if (file) job = readFile(file).then(text => analyze({text, opts}));
  else if (url) job = fetchUrl(url).then(text => analyze({text, opts}));
  else job = analyze({text, opts});

  job
    .then(data => self.postMessage(data))
    .then(() => {
      self.close();
    })
    .catch(error => {
      console.error(error);
      self.close();
    });
};

function readFile(file) {
  return new Promise((resolve, reject) => {
    var fs = new FileReader();
    fs.onload = () => {
      resolve(fs.result);
    };
    fs.onerror = reject;
    fs.readAsText(file);
  });
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    let httpRequest = new XMLHttpRequest();
    if (!httpRequest) reject('cannot create XMLHttpRequest object!');
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        httpRequest.status === 200
          ? resolve(httpRequest.responseText)
          : reject(httpRequest.statusText);
      }
    };
    httpRequest.open('GET', url);
    httpRequest.send();
  });
}

function analyze({text, opts}) {
  return new Promise((resolve, reject) => {
    let file = vfile({contents: text});
    unified()
      .use(english)
      .use(readability, opts)
      .use(stringify)
      .process(file, function(err, file) {
        if (err) reject(err);
        else {
          let result = file.messages.map(d => {
            return {
              text: d.actual,
              location: d.location,
              readability: d.message,
              counts: d.counts
            };
          });
          resolve(result);
        }
      });
  });
}
