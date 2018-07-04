/* global angular */
'use strict';

var app = angular.module('dsPopupApp', [
  'i18n'
]);

// ---------------------------------------------------------------------------------------------------------------------
// Model for filters to match media types by mime or extension.
app.factory('MediaFilters', [
  function () {

    let service = [];

    // Map of known mime-types to extensions.
    // Useful to assign an extension to data: URLs and video/audio sources.
    service.mimeToExtMap = {
      // Images
      'image/jpg': 'jpg',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/svg': 'svg',
      'image/bmp': 'bmp',
      'image/unknown': 'jpg', // Total guess but still most likely.
      // Video
      'video/webm': 'webm',
      'video/mkv': 'mkv',
      'video/mp4': 'mp4',
      'video/mpg': 'mpg',
      'video/mpeg': 'mpeg',
      // Audio
      'audio/mp3': 'mp3',
      'audio/mp4': 'mp4',
      'audio/aac': 'aac',
      'audio/flac': 'flac',
      'audio/wav': 'wav',
      // Documents
      'text/plain': 'txt',
      'text/csv': 'csv',
      'text/json': 'json',
      'text/html': 'html',
      'application/json': 'json'
    };

    // Image filter
    service.push({
      type: 'image',
      enabled: true,
      extensions: [
        /(jpe?g|png|gif|bmp|jp2|tga|tiff?|svg|wmf)\b/i
      ],
      mimeTypes: [
        // Popular
        'image/jpg', 'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg',
        // Other
        'image/bmp',
        'image/jp2',
        'image/tga',
        'image/tif', 'image/tiff',
        'image/wmf',
        // Could not determine type but its a HTMLImageElement.
        'image/unknown'
      ]
    });

    // Video filter
    service.push({
      type: 'video',
      enabled: false,
      extensions: [
        /(webm|mp4|m[124ko]v|avi|mpe?g|flv|wmv|3gp|og[mv]|asf|rm(vb)?)\b/i
      ],
      mimeTypes: [
        // Popular
        'video/webm',
        'video/mkv',
        'video/mp4',
        'video/mpg', 'video/mpeg',
        // Other
        'video/avi',
        'video/m1v',
        'video/m2v',
        'video/m3v',
        'video/mov',
        'video/wmv',
        'video/3gp',
        'video/ogm',
        'video/ogv',
        'video/asf',
        'video/rm',
        'video/rmvb'
      ]
    });

    // Audio filter
    service.push({
      type: 'audio',
      enabled: false,
      extensions: [
        /(mp3|[af]lac|mp?4a|aac|ape|og[ag]|wma|wa?v|ac3|dts|opus|ra)\b/i
      ],
      mimeTypes: [
        // Popular
        'audio/mp3',
        'audio/mp4',
        'audio/aac',
        'audio/flac',
        'audio/wav',
        // Other
        'audio/alac',
        'audio/mp4a',
        'audio/ape',
        'audio/ogg',
        'audio/oga',
        'audio/wma',
        'audio/ac3',
        'audio/dts',
        'audio/opus',
        'audio/ra'
      ]
    });

    // Archive filter
    service.push({
      type: 'archive',
      enabled: false,
      extensions: [
        /(g?zip|[tr]ar|[7gnx]z|arj|ace|lha|paq|rk|iso)\b/i
      ],
      mimeTypes: [
        'application/zip',
        'application/x-zip-compressed',
        'application/rar',
        'application/x-rar-compressed',
        'application/7z',
        'application/x-7z-compressed',
        'application/tar',
        'application/tar+gzip',
        'application/gzip',
        'application/x-gzip',
        'application/x-gtar',
        'application/x-tgz'
      ]
    });

    // Executable filter
    service.push({
      type: 'executable',
      enabled: false,
      extensions: [
        /(exe|dmg|apk|xpi|msi)\b/i
      ],
      mimeTypes: [
        'application/x-apple-diskimage',
        'application/vnd.android.package-archive',
        'application/x-msi',
        'application/x-ms-installer'
      ]
    });

    // Document filter
    service.push({
      type: 'document',
      enabled: false,
      extensions: [
        /(doc[xm]?|xls[xm]?|ppt[xm]?|pdf|[xe]ps|cb[rz]|epub|mobi|azw|txt|rtf|nfo)\b/i
      ],
      mimeTypes: [
        // Popular
        'application/pdf',
        // Office
        'application/msword',
        'application/vnd.ms-powerpoint',
        'application/vnd.ms-excel',
        'application/vnd.ms-xpsdocument',
        'application/oxps',
        'application/postscript',
        'application/z-eps',
        // Books
        'application/epub',
        'application/epub+zip',
        'application/x-mobipocket-ebook',
        'application/vnd.amazon.ebook',
        // Comics
        'application/x-cbr',
        'application/x-cbz',
        // Other
        'text/plain',
        'text/rtf',
        'text/richtext',
        "application/x-rtf",
        'text/csv',
        'text/json'
      ]
    });

    // Decorate the service with properties for each filter by type.
    service.forEach(filter => service[filter.type] = filter);

    /**
     * Determine if a predicate matches a media item.
     * @param {RegExp|Function} predicate
     */
    service.matchPredicate = (predicate, mediaItem, testValue) => {
      if (angular.isFunction(predicate)) {
        // Invoke the predicate function on the media item.
        return !!predicate(mediaItem);
      } else
      if (predicate instanceof RegExp) {
        // Test the value with the regular expression.
        return predicate.test(testValue);
      } else {
        // Test the value for equality with the predicate.
        return predicate === testValue;
      }
    };

    /**
     * Determine if a filter matches an item.
     */
    service.matchFilter = (filter, mediaItem) => {
      // Match on mimeType if available.
      if (filter.mimeTypes.some(predicate => {
        return service.matchPredicate(predicate, mediaItem, mediaItem.mime);
      })) {
        return true;
      }

      // Match on extension if available.
      if (filter.extensions.some(predicate => {
        return service.matchPredicate(predicate, mediaItem, mediaItem.extension);
      })) {
        return true;
      }

      return false;
    };

    /**
     * Find all built-in filters that match an item.
     */
    service.findMatches = (mediaItem) => {
      // Only match on enabled filters.
      return service.filter(filter => filter.enabled ? service.matchFilter(filter, mediaItem) : false);
    };

    /**
     * Get a predicate to evaluate the fast filter.
     */
    service.getFilterPredicate = (pattern, isRegex) => {
      let predicate = () => false;
      if (pattern) {
          if (isRegex) {
          // Pattern is a regular expression.
          try {
            let regexp = new RegExp(pattern, 'i');
            predicate = (input) => regexp.test(input);
          } catch (error) {
            predicate.error = 'invalid-regex';
          }
        } else {
          // Patterns is a glob expression.
          let tokens = pattern.split('*').filter(token => !!token);
          predicate = (input) => {
            let index = 0;
            for (let i = 0; i < tokens.length; i++) {
              index = input.indexOf(tokens[i], index);
              if (index == -1) {
                return false;
              }
            }
            return true;
          };
        }
      }

      return predicate;
    };

    return service;

  }]);

// ---------------------------------------------------------------------------------------------------------------------
// Model for media items scraped from the document.
app.factory('MediaItem', [
  'MediaFilters',
  function (MediaFilters) {

    function MediaItem (data) {
      this.source = data.source;
      this.url = data.url;
      this.mime = data.mime;
      this.tag = data.tag;

      this.alt = data.alt;
      this.title = data.title;
      this.text = data.text;

      this.download = data.download;

      this.width = data.width;
      this.height = data.height;

      this.extractFilenameMeta();

      // Media state
      this.matches = [];
      this.checked = false;
      this.maskName = null;
    }

    /**
     * Remove illegal characters for a Windows path.
     */
    MediaItem.cleanPath = function (input) {
      return input.replace(/[\\/:"*?<>|]+/gi, '');
    };

    /**
     * Extract the path from the URL.
     * @return {Object} An object with properties:
     *   value: The path extracted from the URL.
     *   start: Index where the path begins in the URL.
     */
    MediaItem.prototype.getPath = function () {
      let noPath = {
        value: '/',
        start: -1
      };

      if (!this.isDataUrl) {
        // Locate start of path.
        let pathStart = this.url.indexOf('://');
        if (!~pathStart) {
          return noPath;
        }
        pathStart = this.url.indexOf('/', pathStart + 3);
        if (!~pathStart) {
          return noPath;
        }

        // Locate end of path.
        let pathEnd = this.url.indexOf('?');
        if (!~pathEnd) {
          pathEnd = this.url.indexOf('#');
        }
        if (!~pathEnd) {
          pathEnd = this.url.length;
        }

        return {
          value: this.url.substring(pathStart, pathEnd),
          start: pathStart
        };
      }

      return noPath;
    };

    /**
     * Extract the filename, extension, and mime type from the MediaItem.
     * @return {Boolean} True if anything was extracted, otherwise false.
     */
    MediaItem.prototype.extractFilenameMeta = function () {
      // Try to extract a file named using /filename.ext.
      function tryGetNameAndExt (mediaItem, input) {
        let match;
        if ((match = /\b([^\/]+)\.([a-z0-9]+)(\?|#|$)/i.exec(input)) !== null) {
          if (match[1] && match[2]) {
            mediaItem.filename = MediaItem.cleanPath(match[1]);
            mediaItem.extension = MediaItem.cleanPath(match[2]);
            mediaItem.isFilenameInUrl = true;
            mediaItem.isExtensionInUrl = true;
            return true;
          }
        }
        return false;
      }

      // Try to extract the last segment of the path.
      function tryGetBasename (mediaItem, input) {
        let match;
        if ((match = /\/([^\/]+)\/?(\?|#|$)/i.exec(input)) !== null) {
          if (match[1]) {
            mediaItem.filename = MediaItem.cleanPath(match[1]);
            mediaItem.extension = MediaFilters.mimeToExtMap[mediaItem.mime] || 'html';
            mediaItem.isFilenameInUrl = true;
            return true;
          }
        }
        return false;
      }

      // Handle data: URLs with custom logic.
      this.isDataUrl = this.url.startsWith('data:');
      if (this.isDataUrl) {
        this.isFilenameInUrl = false;
        this.isExtensionInUrl = false;

        // Get the mime type from the data: URL if available.
        let mimeStart = this.url.indexOf(':');
        let mimeEnd = this.url.indexOf(';');
        if (!!~mimeEnd) {
          this.mime = this.url.substring(mimeStart + 1, mimeEnd);
        } else {
          // Spec says data: URL defaults to this when mime isnt provided.
          this.mime = 'text/plain';
        }

        // The download property can explicitly name a data: URL's file.
        if (this.download) {
          tryGetNameAndExt(this, this.download);
        } else {
          // Filename is unknown; it may be possible to determine extension.
          this.filename = "data";
          this.extension = MediaFilters.mimeToExtMap[this.mime] || 'txt';
        }

        return true;
      }

      // Try to extract the filename from the URL's path.
      this.path = this.getPath();
      if (this.path.value === '/') {
        // No path means this it is an index page.
        this.filename = 'index';
        this.extension = 'html';
        return true;
      } else
      if (this.path.start >= 0) {
        if (tryGetNameAndExt(this, this.path.value)) {
          return true;
        }
        if (tryGetBasename(this, this.path.value)) {
          return true;
        }
      }

      // Select default values since nothing could be determined.
      this.filename = 'unnamed';
      this.extension = 'html';

      // Look for filenames in the query or fragment.
      // TODO Not implemented yet.
      return false;
    };

    /**
     * Get the filename with extension if available.
     */
    MediaItem.prototype.getFilename = function () {
      return this.extension ?
        this.filename + '.' + this.extension :
        this.filename;
    };

    /**
     * True if this media item is an image, otherwise false.
     */
    MediaItem.prototype.isImage = function () {
      if (!angular.isDefined(this._isImage)) {
        this._isImage = MediaFilters.matchFilter(MediaFilters.image, this);
      }
      return this._isImage;
    };

    /**
     * True if this media item is a video, otherwise false.
     */
    MediaItem.prototype.isVideo = function () {
      if (!angular.isDefined(this._isVideo)) {
        this._isVideo = MediaFilters.matchFilter(MediaFilters.video, this);
      }
      return this._isVideo;
    };

    return MediaItem;

  }]);

// ---------------------------------------------------------------------------------------------------------------------
// Engine for generating filenames from naming mask expressions.
// See: https://github.com/marklieberman/downloadstar/wiki/Naming-Mask-Expression-Guide
app.factory('NamingMask', [
  'MediaItem',
  function (MediaItem) {

    // Define the supported variables.
    const VARIABLES = {
      // Properties of MediaItem.
      file: (mediaItem) => mediaItem.filename || '',
      ext: (mediaItem) => mediaItem.extension || '',
      fileext: (mediaItem) => mediaItem.getFilename() || '',
      alt: (mediaItem) => mediaItem.alt || '',
      title: (mediaItem) => mediaItem.title || '',
      text: (mediaItem) => mediaItem.text || '',
      width: (mediaItem) => mediaItem.width || '',
      height: (mediaItem) => mediaItem.height || '',
      // Dynamic variables
      // An auto-incrementing number.
      inum: (mediaItem, namingMask) => {
        return mediaItem.checked ? namingMask.inum++ : 0;
      },
      // The current date.
      date: () => {
        return new Date();
      }
    };

    // Define the supported filters.
    const FILTERS = {
      // Provides a default value if input is empty.
      def: function (input = '', defaultValue = '') {
        return input ? input : defaultValue;
      },
      // Provides a different variable if input is empty.
      defVar: function (input, variableName) {
        let variableFunc = VARIABLES[variableName];
        if (!variableFunc) {
          return 'BADARG';
        }
        return input ? input : variableFunc(this.mediaItem);
      },
      // Limit the input to the given length.
      limit: function (input = '', length = Number.NaN) {
        length = Number(length);
        return Number.isFinite(length) ? input.substring(0, length) : input;
      },
      // Trim whitespace from the input.
      trim: function (input = '') {
        return input.trim();
      },
      // Lowercase the input.
      lower: function (input = '') {
        return input.toLocaleLowerCase();
      },
      // Uppercase the input.
      upper: function (input = '') {
        return input.toLocaleUpperCase();
      },
      // Format a date using moment.js.
      dateFormat: function (input, format = 'YYYY-MM-DDD') {
        let value = moment(input);
        return value.isValid() ? value.format(format) : input;
      }
    };

    /**
     * Compile a naming mask for an expresion.
     */
    function NamingMask (expression) {
      this.tokens = [];
      this.compile(expression);
      this.reset();
    }

    /**
     * Reset the internal variables such as the auto-incrementing number.
     */
    NamingMask.prototype.reset = function () {
      this.inum = 1;
    };

    /**
     * Split the input by a separater and remove empty tokens.
     */
    NamingMask.prototype.cleanSplit = function (input, separator) {
      return input.split(separator)
        .map(token => token ? token.trim() : null)
        .filter(token => !!token);
    };

    /**
     * Split the expression into static and variable tokens.
     */
    NamingMask.prototype.compile = function (expression) {
      // Tokenize the expression by splitting on ${} variables.
      const tokenRegex = /\$\{([^}]+)\}/ig;
      let match, index = 0;
      while ((match = tokenRegex.exec(expression)) !== null) {
        // Extract any static content before the variable.
        if (index != match.index) {
          this.tokens.push(expression.substring(index, match.index));
        }

        // Extracted the variable.
        this.tokens.push(this.compileVariable(match[1]));

        // Begin next extraction from the end of the variable.
        index = tokenRegex.lastIndex;
      }

      // Extract any remaining static content from the expression.
      if (index < expression.length) {
        this.tokens.push(expression.substring(index));
      }
    };

    /**
     * Compile a variable expression.
     */
    NamingMask.prototype.compileVariable = function (variableDef) {
      let self = this;
      try {
        let tokens = this.cleanSplit(variableDef, '|');

        // First token must be a variable.
        let variableName = tokens.shift();
        let variableFunc = VARIABLES[variableName];
        if (!variableFunc) {
          throw variableName + ' is not a valid variable';
        }

        // Remaining tokens are filters.
        // Generate a pipe of filters to evaluate.
        let pipe = tokens.map(this.compileFilter, this);

        // Return a function that evaluates the pipe on the variable.
        return (mediaItem) => pipe.reduce((output, filterFunc) => {
          return filterFunc(output, mediaItem);
        }, variableFunc(mediaItem, self));
      } catch (error) {
        this.error = this.error || error;
        return () => 'BADVAR';
      }
    };

    /**
     * Compile a filter expression.
     */
    NamingMask.prototype.compileFilter = function (filterDef) {
      let self = this;
      try {
        let tokens = this.cleanSplit(filterDef, ':');

        // First token is the function name.
        let filterName = tokens.shift();
        let filterFunc = FILTERS[filterName];
        if (!filterFunc) {
          throw filterName + ' is not a valid filter';
        }

        // Remaining tokens are arguments.
        // Return a function that evaluates the filter.
        return (input, mediaItem) => {
          // Create a context object for the filter.
          let context = {
            namingMask: self,
            mediaItem
          };

          return filterFunc.bind(context)(input, ...tokens);
        };
      } catch (error) {
        this.error = this.error || error;
        return () => 'BADFILTER';
      }
    };

    /**
     * Evaluate the naming mask for a MediaItem.
     */
    NamingMask.prototype.evaluate = function (mediaItem) {
      return MediaItem.cleanPath(this.tokens.reduce((output, token) => {
        return output + (angular.isString(token) ? token : token(mediaItem));
      }, ''));
    };

    return NamingMask;

  }]);

// ---------------------------------------------------------------------------------------------------------------------
// Main controller for the addon popup.
app.controller('PopupCtrl', [
  '$scope',
  '$q',
  'MediaItem',
  'MediaFilters',
  'NamingMask',
  function ($scope, $q, MediaItem, MediaFilters, NamingMask) {

    var vm = this;

    // ----- Controller init -----
    vm.media = [];
    vm.mediaFilters = MediaFilters;
    vm.scraping = true;
    vm.progress = [0, 0];
    vm.controls = {
      downloadPath: 'DownloadStar',
      showOptions: true,
      showMetadata: true,
      tab: 'filters',
      sources: {
        link: false,
        embed: true,
        text: false
      },
      fastFilter: '',
      fastFilterRegex: false,
      namingMask: '',
      conflictAction: 'skip',
      eraseHistory: false,
      checkedOnly: false
    };

    // Use a bit of defineProperty magic to bind a simple hash of { filterType: enabled } to the enabled property of
    // each filter in the MediaFilters service.
    vm.filters = {};
    MediaFilters.forEach(filter => {
      Object.defineProperty(vm.filters, filter.type, {
        enumerable: true,
        get: () => filter.enabled,
        set: value => filter.enabled = value
      });
    });

    // Initialize the controls.
    loadControls().then(() => {
      // Begin scraping the active tab.
      vm.scrapeTab({}, true);
    });

    // Functions -------------------------------------------------------------------------------------------------------

    /**
     * Load the interface controls from local settings.
     */
    function loadControls () {
      return browser.storage.local.get({
        controls: vm.controls,
        filters: vm.filters
      }).then(results => $scope.$apply(() => {
        // Restore filters by assignment to preserve the defineProperty magic.
        for (let key in results.filters) {
          vm.filters[key] = results.filters[key];
        }

        // Restore values for other controls.
        angular.extend(vm.controls, results.controls);
      }));
    }

    /**
     * Save the interface controls to local settings.
     */
    function saveControls () {
      return browser.storage.local.set({
        controls: vm.controls,
        filters: vm.filters
      });
    }

    /**
     * Scrape the active tab to find downloadable content.
     */
    vm.scrapeTab = (tab = {}, assign = false) => {
      if (assign) {
        vm.media = [];
        vm.scraping = true;
      }

      // This defaults to activeTab if the tab ID is undefined.
      let promise = $q.when(browser.tabs.executeScript(tab.id, {
        file: '/content/scrape.js',
        runAt: 'document_end',
        allFrames: true
      }).then(frames => {
        // Flatten the per-frame results, construct MediaItem instances, and evaluate filters.
        let mediaItems = frames.reduce((media, frame) => {
          for (let i = 0; i < frame.length; i++) {
            media.push(new MediaItem(frame[i]));
          }
          return media;
        }, []);
        vm.evaluateFilters(mediaItems);
        vm.evaluateNamingMask(mediaItems);
        return mediaItems;
      }).catch(error => {
        // Something went wrong and the tab could not be scraped.
        console.log('scrape tab failed', tab.id || 'activeTab', tab.index || 'activeTab', error);
        return [];
      }));

      // Put the scraped media on the controller if requested.
      return !assign ? promise : promise
        .then(media => vm.media = media)
        .finally(() => vm.scraping = false);
    };

    /**
     * Scrape all tabs in the window to find downloadable content.
     */
    vm.scrapeAllTabs = (assign) => {
      if (assign) {
        vm.media = [];
        vm.scraping = true;
      }
      let promise = $q.when(browser.tabs.query({ currentWindow: true }).then(tabs => {
        return $q.all(tabs
          // Do not scrape hidden or discarded tabs.
          .filter(tab => !tab.hidden && !tab.discarded)
          // Scrape each tab for media.
          .map(tab => vm.scrapeTab(tab, false))
        ).then(results => {
          // Flatten the resulting array of results for each tab.
          return results.reduce((media, tabResult) => {
            for (let i = 0; i < tabResult.length; i++) {
              media.push(tabResult[i]);
            }
            return media;
          }, []);
        });
      }));

      // Put the scraped media on the controller if requested.
      return !assign ? promise : promise
        .then(media => vm.media = media)
        .finally(() => vm.scraping = false);
    };

    /**
     * Evaluate matching filters for MediaItems.
     */
    vm.evaluateFilters = (mediaItems) => {
      mediaItems = mediaItems || vm.media;

      // Get an instance of the fast-filter predicate.
      let fastFilterPredicate = MediaFilters.getFilterPredicate(
        vm.controls.fastFilter,
        vm.controls.fastFilterRegex);

      // Expose the error if the fast filter is not valid.
      vm.fastFilterError = fastFilterPredicate.error;

      // Evaluate the filter on all given MediaItems.
      mediaItems.forEach(mediaItem => {
        // Evaluate the built-in filtes.
        mediaItem.matches = MediaFilters.findMatches(mediaItem)
          .map(filter => filter.type);

        // Evaluate the fast filter.
        if (fastFilterPredicate(mediaItem.url)) {
          mediaItem.matches.push('fast');
        }

        // Select items that matched a filter.
        mediaItem.checked = !!mediaItem.matches.length;
      });
    };

    /**
     * Clear the fast filter and re-evaluate filters.
     */
    vm.clearFastFilter = function () {
      vm.controls.fastFilter = '';
      vm.evaluateFilters();
    };

    /**
     * Evaluate naming masks for MediaItems.
     */
    vm.evaluateNamingMask = (mediaItems) => {
      mediaItems = mediaItems || vm.media;

      // Get an instance of NamingMask for this mask expression.
      let namingMask = new NamingMask(vm.controls.namingMask);

      // Expose the error if the mask expression is not valid.
      vm.namingMaskError = namingMask.error;

      // Evaluate the mask expression on each MediaItem.
      mediaItems.forEach(mediaItem => {
        mediaItem.maskName = namingMask.evaluate(mediaItem);
      });
    };

    /**
     * Clear the naming mask and re-evaluate naming masks.
     */
    vm.clearNamingMask = function () {
      vm.controls.namingMask = '';
      vm.evaluateNamingMask();
    };

    /**
     * Filter media displayed in the list by enabled sources.
     */
    vm.filterMediaSource = (mediaItem) => {
      return vm.controls.sources[mediaItem.source];
    };

    /**
     * Filter media displayed in the list by quick search options.
     */
    vm.filterQuickSearch = () => {
      let needle = vm.search ? vm.search.toLocaleLowerCase() : null;
      return (mediaItem) => {
        if (vm.controls.checkedOnly && !mediaItem.checked) {
          return false;
        } else
        if (needle) {
          let haystack = mediaItem.url.toLocaleLowerCase();
          return !!~haystack.indexOf(needle);
        } else {
          return true;
        }
      };
    };

    /**
     * Toggle the fast filter regex setting and evaluate filters.
     */
    vm.toggleFastFilterRegex = () => {
      vm.controls.fastFilterRegex = !vm.controls.fastFilterRegex;
      vm.evaluateFilters();
    };

    /**
     * True if any source is enabled, otherwise false.
     */
    vm.isAnySourceEnabled = () => {
      for (let key in vm.controls.sources) {
        if (vm.controls.sources[key]) {
          return true;
        }
      }
      return false;
    };

    /**
     * Get all checked MediaItems from enabled sources.
     */
    vm.getCheckedMediaItems = () => {
      return vm.media.filter(mediaItem => mediaItem.checked && vm.controls.sources[mediaItem.source]);
    };

    /**
     * Get the count of checked MediaItems.
     */
    vm.countCheckedMediaItems = () => {
      let count = 0;
      for (var i = 0; i < vm.media.length; i++) {
        // Item must be checked and the source must be enabled.
        if (vm.media[i].checked && vm.controls.sources[vm.media[i].source]) {
          count++;
        }
      }
      return count;
    };

    /**
     * Toggle the checked status of a MediaItem.
     */
    vm.toggleMediaItemChecked = (mediaItem) => {
      mediaItem.checked = !mediaItem.checked;

      // Update the naming mask for checked items.
      // This should refresh variables like ${inum}.
      vm.evaluateNamingMask(vm.getCheckedMediaItems());
    };

    /**
     * True if the download path is absolute, otherwise false.
     */
    vm.isDownloadPathAbsolute = () => {
      return /^(\\{1,2}|\/|[a-zA-Z]:)/.test(vm.controls.downloadPath);
    };

    /**
     * True if we can proceed to download, otherwise false.
     */
    vm.canProceedToDownload = () => {
      // Download location must be a relative path.
      if (vm.isDownloadPathAbsolute()) {
        return false;
      }

      // At least one item must be checked and the source must be enabled.
      if (!vm.media.some(mediaItem => mediaItem.checked && vm.controls.sources[mediaItem.source])) {
        return false;
      }

      return true;
    };

    /**
     * Download the checked MediaItems.
     */
    vm.downloadMediaItems = () => {
      // Save the interface controls before proceeding.
      saveControls().then(() => {
        browser.runtime.sendMessage({
          topic: 'ds-downloadMediaItems',
          data: {
            options: {
              downloadPath: vm.controls.downloadPath,
              conflictAction: vm.controls.conflictAction,
              eraseHistory: vm.controls.eraseHistory,
            },
            mediaItems: vm.getCheckedMediaItems().map(mediaItem => ({
              url: mediaItem.url,
              filename: mediaItem.maskName || mediaItem.getFilename()
            }))
          }
        });

        // Close the popup when downloading begins.
        window.close();
      });
    };

  }]);

// ---------------------------------------------------------------------------------------------------------------------
// Truncate the input with an ellipsis if it exceeds the maximum length.
app.filter('ellipsis', [() => {
  return (input, maxLength) => {
    if (input) {
      return (input.length > maxLength) ? (input.substring(0, maxLength - 1) + '…') : input;
    }
    return null;
  };
}]);

// ---------------------------------------------------------------------------------------------------------------------
// Remove an element (such as <img>) if it emits an error.
app.directive('removeOnError', [() => {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.on('error', () => element.remove());
    }
  };
}]);

// ---------------------------------------------------------------------------------------------------------------------
// Render a truncated URL string centered on the filename in the URL.
app.directive('urlWithFilename', ['$timeout', ($timeout) => {
  return {
    restrict: 'E',
    template: `
      {{before}}<span>{{filename}}</span>{{after}}
    `,
    link: function (scope, element, attrs) {
      var pendingLayout = false;

      // Assumed width of the monospace font.
      const fontWidth = 7.5;

      // Get the value of the bound MediaItem.
      let mediaItem = scope.$eval(attrs.mediaItem);

      // Install listeners for window resize events.
      window.addEventListener('resize', throttleLayout);
      scope.$on('$destroy', () => {
        window.removeEventListener('resize', throttleLayout);
      });

      // Perform the initial layout.
      layoutFilename();

      // Functions -----------------------------------------------------------------------------------------------------

      /**
       * Throttle calls to layoutFilename() to limit layouts due to resize events.
       */
      function throttleLayout () {
        if (!pendingLayout) {
          pendingLayout = true;
          $timeout(layoutFilename, 1000).finally(() => pendingLayout = false);
        }
      }

      /**
       * Shorten and render the filename according to the available space.
       */
      function layoutFilename () {
        // Choose a max length based on the element width.
        let maxLength = Math.floor(((window.innerWidth - 80) / fontWidth) - 2);
        if (mediaItem.isDataUrl) {
          // Data URL has no filename on the URL.
          shortenNoFilename(mediaItem, maxLength);
        } else
        if (mediaItem.filename) {
          // Highlight the extension if it was present in the URL.
          let filename = (mediaItem.isExtensionInUrl) ?
            mediaItem.getFilename() : // Filename with extension if known.
            mediaItem.filename;       // Filename without extension.

          let pathStart = mediaItem.path ? mediaItem.path.start : 0;
          let index = mediaItem.url.indexOf(filename, pathStart);
          if (!!~index) {
            // Filename is present in the URL.
            shortenHasFilename(mediaItem, filename, index, maxLength);
          } else {
            // Filename was not derived from the URL.
            shortenNoFilename(mediaItem, maxLength);
          }
        }
      }

      /**
       * Shorten the URL while highlighting the filename that appears in the URL.
       */
      function shortenHasFilename (mediaItem, filename, index, remain) {
        // Extract the filename component.
        if (filename.length < remain) {
          // Filename is shorter than max length.
          scope.filename = filename;
          remain -=  filename.length;
        } else {
          // Filename is longer than max length.
          scope.before = null;
          scope.after = null;
          scope.filename = '…' + filename.substring(0, remain - 2) + '…';
          return;
        }

        // Extract the before filename component.
        scope.before = '…';
        if (remain > 0) {
          scope.before = mediaItem.url.substring(0, index);
          let maxUse = Math.ceil(remain * 0.9) - 1;
          if (maxUse < scope.before.length) {
            scope.before = '…' + scope.before.substring(scope.before.length - maxUse);
            remain -= maxUse + 1;
          } else {
            remain -= scope.before.length;
          }
        }

        // Extract  the after filename component.
        scope.after = '…';
        if (remain > 0) {
          scope.after = mediaItem.url.substring(index + filename.length);
          if (remain < scope.after.length) {
            scope.after = scope.after.substring(0, remain - 1) + '…';
          }
        }
      }

      /**
       * Display a normal URl without highlighting anything.
       */
      function shortenNoFilename (mediaItem, maxLength) {
        scope.after = null;
        scope.filename = null;
        if (mediaItem.url.length >= maxLength) {
          scope.before = mediaItem.url.substring(0, maxLength - 1) + '…';
        } else {
          scope.before = mediaItem.url;
        }
      }

    }
  };
}]);
