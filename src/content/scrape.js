'use strict';

function isValidUrl (url) {
  if (!url) {
    return false;
  }
  if (url.startsWith('javascript')) {
    return false;
  }
  return true;
}

function getOriginAndPath (url) {
  let index;
  if ((index = url.indexOf('?')) > -1) {
    return url.substring(0, index);
  }
  if ((index = url.indexOf('#')) > -1) {
    return url.substring(0, index);
  }
  return url;
}

function getFileType (item, element) {
  let type;
  if ((type = element.getAttribute('type')) != null) {
    item.type = type.split('/').pop();
    return;
  }

  item.type = 'html';
}

function getFileMeta (item, element) {
  let url = getOriginAndPath(item.url), match;

  // Match: filename.ext
  if ((match = /\b([^\/]+)\.([a-z0-9]+)(\?|#|$)/i.exec(url)) !== null) {
    if (match[1] && match[2]) {
      item.filename = match[1] + '.' + match[2];
      item.type = match[2];
      return;
    }
  }

  // Match /filename/
  if ((match = /\/([^\/]+)\/?(\?|#|$)/i.exec(url)) !== null) {
    if (match[1]) {
      item.filename = match[1];
      getFileType(item, element);
      return;
    }
  }
}

function getPropsFromTags (tagName, property) {
  let hash = {};
  document.querySelectorAll(tagName).forEach(element => {
    let url = element[property];
    if (!!url && !hash[url] && isValidUrl(url)) {
      let item = { url: url };
      hash[url] = item;
      getFileMeta(item, element);
    }
  });

  return Object.keys(hash).map(key => hash[key]);
}

function sortByUrl (a, b) {
  return a.url.localeCompare(b.url);
}

function getLinksFromText (parentNode = 'body', exclude = []) {
  // https://stackoverflow.com/a/8218223
  const URL_REGEX = new RegExp(/(?:https?|ftp):\/\/[\w-]+(?:\.[\w-]+)+\/([\w.,@?^=%&amp;:/~+#-]*)\.([\w]+)/g);
  const excludeList = exclude.map(tag => `:not(${tag})`).join('');
  const haystack = document.querySelectorAll(`${parentNode}, ${parentNode} *${excludeList}`);
  let hash = {};
  let needle;
  haystack.forEach(node => {
    while ((needle = URL_REGEX.exec(node.innerText)) !== null) {
      const [ url, filename, type ] = needle;
      if (!!url && !hash[url] && isValidUrl(url)) {
        hash[url] = {
          url,
          filename,
          type
        };
      }
    }
  });

  return Object.keys(hash).map(key => hash[key]);
}

var urls = {
  links: [].concat(
    getPropsFromTags('a', 'href')
  ),
  embeds: [].concat(
    getPropsFromTags('img', 'src'),
    getPropsFromTags(['video', 'video > source'], 'src'),
    getPropsFromTags(['audio', 'audio > source'], 'src'),
    getPropsFromTags('object', 'src')
  ),
  text: [].concat(
    getLinksFromText('div', ['p', 'span']),
    getLinksFromText('p'),
    getLinksFromText('span')
  )
};

urls.links.sort(sortByUrl);
urls.embeds.sort(sortByUrl);
urls.text.sort(sortByUrl);

// Return value for executeScript().
urls; // jshint ignore:line
