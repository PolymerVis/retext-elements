const vfile = require('to-vfile');
const unified = require('unified');
const english = require('retext-english');
const stringify = require('retext-stringify');
const keywords = require('retext-keywords');

self.onmessage = function(e) {
  var {text, n} = e.data;
  analyze(text, n)
    .then(file => self.postMessage(file))
    .then(() => {
      self.close();
    })
    .catch(error => {
      console.error(error);
      self.close();
    });
};

function analyze(text, maximum = 5) {
  return new Promise((resolve, reject) => {
    let file = vfile({contents: text});
    unified()
      .use(english)
      .use(keywords, {maximum})
      .use(stringify)
      .process(file, function(err, file) {
        if (err) reject(err);
        else {
          resolve(file.data);
        }
      });
  });
}
