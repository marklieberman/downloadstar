'use strict';

/**
 * Filter invalid urls such as javascript: or blob: URLs.
 */
function isValidUrl (media) {
  /* jshint scripturl:true */
  return (
    media.url &&
    !media.url.startsWith('javascript:') &&
    !media.url.startsWith('blob:')
  );
}

/**
 * Get innertText of the element or parent node.
 */
function getNearbyText (element) {
  let innerText = element.innerText || element.parentNode.innerText;
  if (innerText) {
    innerText = innerText.replace(/\s+/g, ' ').trim();
  }
  return innerText || null;
}

/**
 * Extract the URls for other media in various tags.
 */
function getMediaAndLinks () {
  return Array.concat(
    // Collect the target of links.
    Array.from(document.getElementsByTagName('a'), a => {
      return {
        source: 'link',
        url: decodeURI(a.href),
        mime: null,
        tag: a.tagName,
        alt: a.alt || null,
        title: a.title || null,
        text: getNearbyText(a),
        download: a.download || null
      };
    }),
    // Collect the source of images.
    Array.from(document.getElementsByTagName('img'), img => {
      return {
        source: 'embed',
        url: decodeURI(img.src),
        mime: 'image/unknown',
        tag: img.tagName,
        alt: img.alt || null,
        title: img.title || null,
        text: getNearbyText(img),
        width: img.naturalWidth,
        height: img.naturalHeight
      };
    })
  );
}

/**
 * Extract the sources from audio/video/object tags.
 */
function getAudioVideoMedia () {
  return Array.concat(
    Array.from(document.getElementsByTagName('audio')),
    Array.from(document.getElementsByTagName('video')),
    Array.from(document.getElementsByTagName('object')),
    Array.from(document.getElementsByTagName('embed')),
    // Picture tags contain <source> and <img> tags but this code path only extracts the <source> tags.
    Array.from(document.getElementsByTagName('picture'))
  ).reduce((media, element) => {
    // Collect the sources defined for this audio/video element.
    let sources = Array.from(element.getElementsByTagName('source'), source => ({
      source: 'embed',
      url: decodeURI(source.src),
      mime: source.type,
      tag: element.tagName,
      alt: element.alt || null,
      title: element.title || null,
      text: getNearbyText(element)
    }));
    if (sources.length) {
      media.push(...sources);
    }

    // Add the current source if not already collected.
    // Prefer the currentSrc property over the src attribute.
    let currentSrc = element.currentSrc || element.getAttribute('src');
    if (!sources.length || !sources.find(source => source.url === currentSrc)) {
      media.push({
        source: 'embed',
        url: decodeURI(currentSrc),
        mime: null,
        tag: element.tagName,
        alt: element.alt || null,
        title: element.title || null,
        text: getNearbyText(element)
      });
    }

    return media;
  }, []);
}

/**
 * Extract plain text links from the document.
 */
function getLinksFromText () {
  // Create a TreeWalker that visits all TEXT nodes in the document.
  let treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT,
    {
      // Accept common text containing nodes.
      acceptNode: (node) => {
        if (node.tagName === 'P' || node.tagName === 'SPAN' || node.tagName === 'DIV') {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      }
    }, false);

  // Matches between protocol and first whitespace character.
  const URL_REGEX = /(https?|ftp):\/\/(\S+)/ig;

  // Extract all plain-text links from the document text.
  // Go to the sibling since once the node's innerText is inspected. Since innerText contains all child nodes' text,
  // there is no reason to descend into the node.
  let media = [], match;
  while (treeWalker.nextSibling() || treeWalker.nextNode()) {
    while ((match = URL_REGEX.exec(treeWalker.currentNode.innerText)) !== null) {
      media.push({
        source: 'text',
        url: decodeURI(match[0])
      });
    }
  }

  return media;
}

// Collect the media from this tab.
var media = Array.concat(
  getMediaAndLinks(),
  getAudioVideoMedia(),
  getLinksFromText()
).filter(isValidUrl);

// Eliminate duplicate URLs on first encountered basis.
var duplicates = new Set();
media = media.filter(item => {
  if (duplicates.has(item.url)) {
    return false;
  } else {
    duplicates.add(item.url);
    return true;
  }
});

// Sort the media by URL.
media.sort((a, b) => a.url.localeCompare(b.url));

// Return value for executeScript().
media; // jshint ignore:line
