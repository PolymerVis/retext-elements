const vfile = require('to-vfile');
const unified = require('unified');
const english = require('retext-english');
const sentiment = require('retext-sentiment');

self.onmessage = function(e) {
  var {text} = e.data;
  if (text) postMessage(analyze(text));
};

function analyze(text) {
  var file = vfile({contents: text});
  var processor = unified()
    .use(english)
    .use(sentiment);
  var tree = processor.parse(file);
  processor.run(tree, file);

  return getData(tree, {});
}

function getData(node, map) {
  var {data, position, type, value, children} = node;
  if (data) {
    map[type] = map[type] || [];
    map[type].push({data, position, type, value});
  }
  if (children && children.length > 0) {
    children.forEach(d => getData(d, map));
  }
  return map;
}
