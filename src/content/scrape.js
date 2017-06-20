'use strict';

function getPropsFromTags (tagName, property) {
  let set = Array.prototype.slice.call(document.getElementsByTagName(tagName))
    .filter(element => !!element[property])
    .reduce((set, element) => set.add(element[property]), new Set());

  return Array.from(set);
}

var urls = {
  links: [].concat(
    getPropsFromTags('a', 'href')
  ),
  embeds: [].concat(
    getPropsFromTags('img', 'src'),
    getPropsFromTags('video', 'src'),
    getPropsFromTags('audio', 'src'),
    getPropsFromTags('object', 'src')
  )
};

// Return value for executeScript().
urls;
