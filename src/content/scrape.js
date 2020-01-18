'use strict';

/**
 * Filter invalid urls such as javascript: or blob: URLs.
 */
function isValidUrl (url) {
  /* jshint scripturl:true */
  return (url && (url !== "null") && !url.startsWith('javascript:') && !url.startsWith('blob:'));
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
 * Strip the fragment from a URL.
 */
function stripFragment (url) {
  let hash = url.indexOf('#');
  return (~hash) ? url.slice(0, hash) : url;
}

/**
 * Extract the URls for other media in various tags.
 */
function getMediaAndLinks () {
  // Select elements that link to other documents.
  let linkElements = [].concat(
    Array.from(document.getElementsByTagName('a')),
    Array.from(document.getElementsByTagName('area')),
    Array.from(document.getElementsByTagName('frame')),
    Array.from(document.getElementsByTagName('iframe'))
  );

  return [].concat(
    // Collect the target of links.
    Array.from(linkElements, link => {
      return {
        source: 'link',
        // SRC for frame elements.
        url: stripFragment(link.href || link.src),
        mime: null,
        tag: link.tagName,
        id: link.id,
        name: link.name,
        alt: link.alt || null,
        title: link.title || null,
        text: getNearbyText(link),
        download: link.download || null
      };
    }),
    // Collect the source of images.
    Array.from(document.getElementsByTagName('img'), img => {
      return {
        source: 'embed',
        url: stripFragment(img.src),
        mime: 'image/unknown',
        tag: img.tagName,
        id: img.id,
        name: img.name,
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
  return [].concat(
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
      url: stripFragment(source.src),
      mime: source.type,
      tag: element.tagName,
      id: element.id,
      name: element.name,
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
        url: stripFragment(currentSrc),
        mime: null,
        tag: element.tagName,
        id: element.id,
        name: element.name,
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
  let treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: () => NodeFilter.FILTER_ACCEPT
  }, false);

  // Matches between protocol and first whitespace character.
  const URL_REGEX = /(https?|ftp):\/\/(\S+)/ig;

  // Extract all plain-text links from the document text.
  // Go to the sibling since once the node's innerText is inspected. Since innerText contains all child nodes' text,
  // there is no reason to descend into the node.
  let media = [], match;
  while (treeWalker.nextSibling() || treeWalker.nextNode()) {
    while ((match = URL_REGEX.exec(treeWalker.currentNode.wholeText)) !== null) {
      media.push({
        source: 'text',
        url: stripFragment(match[0])
      });
    }
  }

  return media;
}

// Collect the media from this tab.
var duplicates = new Set();
var media = {
  meta: {
    frameUrl: String(window.location),
    topFrame: (window.top === window),
    title: String(document.title)
  },
  items: [].concat(
    getMediaAndLinks(), 
    getAudioVideoMedia(), 
    getLinksFromText()
  ).filter(item => {
    // Eliminate invalid URLs.
    // Eliminate duplicate URLs on first encountered basis.
    if (!isValidUrl(item.url) || duplicates.has(item.url)) {
      return false;
    }

    duplicates.add(item.url);
    return true;
  })
};

// Return value for executeScript().
media; // jshint ignore:line
