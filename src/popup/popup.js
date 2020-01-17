/* global angular */
'use strict';

var app = angular.module('dsPopupApp', [
  'ds-i18n'
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
      this.url = new URL(data.url);
      this.tabUrl = data.tabUrl;
      this.frameUrl = data.frameUrl;
      this.tabTitle = data.tabTitle;
      this.frameTitle = data.frameTitle;
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
     * Remove illegal characters for a Windows path (file).
     */
    MediaItem.sanitizePath = function (path) {
      let pathParts = path.split('/'), basename = pathParts.pop();
      return [
        // Sanitize the path parts.
        ...(pathParts.map(part =>
          part.replace(/[:"*?<>|]/gi, '_')
              .replace(/^\./, '_'))
        ),
        // Sanitize the basename.
        basename.replace(/[\\/:"*?<>|]/gi, '_')
                .replace(/^\./, '_')
      ].join('/');
    };

    /**
     * Extract the filename, extension, and mime type from the MediaItem.
     * @return {Boolean} True if anything was extracted, otherwise false.
     */
    MediaItem.prototype.extractFilenameMeta = function () {
      // Try to extract a file named using /filename.ext.
      function tryGetNameAndExt (mediaItem, input) {
        let match;
        if ((match = /([^\/]+)\.([a-z0-9]+)(\?|#|$)/i.exec(input)) !== null) {
          if (match[1] && match[2]) {
            mediaItem.filename = decodeURIComponent(match[1]);
            mediaItem.extension = decodeURIComponent(match[2]);
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
            mediaItem.filename = decodeURIComponent(match[1]);
            mediaItem.extension = MediaFilters.mimeToExtMap[mediaItem.mime] || 'html';
            mediaItem.isFilenameInUrl = true;
            return true;
          }
        }
        return false;
      }

      // Handle data: URLs with custom logic.
      this.isDataUrl = this.getUrl().startsWith('data:');
      if (this.isDataUrl) {
        this.isFilenameInUrl = false;
        this.isExtensionInUrl = false;

        // Get the mime type from the data: URL if available.
        let mimeStart = this.getUrl().indexOf(':');
        let mimeEnd = this.getUrl().indexOf(';');
        if (!!~mimeEnd) {
          this.mime = this.getUrl().substring(mimeStart + 1, mimeEnd);
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
      if (this.url.pathname === '/') {
        // No path means this it is an index page.
        this.filename = 'index';
        this.extension = 'html';
        return true;
      } else {
        if (tryGetNameAndExt(this, this.url.pathname)) {
          return true;
        }
        if (tryGetBasename(this, this.url.pathname)) {
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
     * Get the URL.
     */
    MediaItem.prototype.getUrl = function () {
      return this.url.href;
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
      // Empty variable for testing expressions.
      empty: (mediaItem) => null,
      // -- Properties of MediaItem.
      file: (mediaItem) => mediaItem.filename,
      ext: (mediaItem) => mediaItem.extension,
      fileext: (mediaItem) => mediaItem.getFilename(),
      alt: (mediaItem) => mediaItem.alt,
      title: (mediaItem) => mediaItem.title,
      text: (mediaItem) => mediaItem.text,
      width: (mediaItem) => mediaItem.width,
      height: (mediaItem) => mediaItem.height,
      // -- Variables that take a parameter.
      // URL of the MediaItem.
      itemUrl: function (mediaItem) {
        return NamingMask.urlAsVariable(mediaItem.url, this.parameter);
      },
      // URL of the frame in which the MediaItem was found.
      frameUrl: function (mediaItem) {
        return NamingMask.urlAsVariable(mediaItem.frameUrl, this.parameter);
      },
      // URL of the tab in which the MediaItem was found.
      tabUrl: function (mediaItem) {
        return NamingMask.urlAsVariable(mediaItem.tabUrl, this.parameter);
      },
      // title of the frame in which the MediaItem was found.
      frameTitle: (mediaItem) => mediaItem.frameTitle,
      // title of the tab in which the MediaItem was found.
      tabTitle: (mediaItem) => mediaItem.tabTitle,
      // -- Dynamic or stateful variables.
      // An auto-incrementing number.
      inum: function (mediaItem) {
        return mediaItem.checked ? this.namingMask.inum++ : 0;
      },
      // The current date.
      date: function (mediaItem) {
        return moment().format(this.parameter || 'YYYY-MM-DD');
      }
    };

    // Define the supported filters.
    const FILTERS = {
      // Provides a default value if input is empty.
      def: (input = '', defaultValue = '') => {
        return NamingMask.isEmptyValue(input) ? defaultValue : input;
      },
      // Provides a different variable if input is empty.
      defVar: function (input = '', variableName = 'empty') {
        if (NamingMask.isEmptyValue(input)) {
          try {
            let variableFunc = NamingMask.getVariableFunc(variableName, this.namingMask);
            return variableFunc(this.mediaItem);
          } catch (error) {
            return 'BADARG';
          }
        }
        return input;
      },
      // Limit the input to the given length.
      limit: (input = '', length = Number.NaN) => {
        length = Number(length);
        return Number.isFinite(length) ? input.substring(0, length) : input;
      },
      // Trim whitespace from the input.
      trim: (input = '') => input.trim(),
      // Lowercase the input.
      lower: (input = '') => input.toLocaleLowerCase(),
      // Uppercase the input.
      upper: (input = '') => input.toLocaleUpperCase(),
      // Split the input and return the Nth element.
      split: (input = '', separator = ',', index = 0) => {
        try {
          separator = NamingMask.asStringOrRegex(separator);
        } catch (error) {
          return 'BADREGEX';
        }
        return input.split(separator)[index];
      },
      // Search and replace in the input.
      replace: (input = '', search = '', replace = '') => {
        try {
          search = NamingMask.asStringOrRegex(search);
        } catch (error) {
          return 'BADREGEX';
        }
        if (search instanceof RegExp) {
          // Global regex replaces all instances.
          return input.replace(search, replace);
        } else {
          // Replace all instances of search.
          return input.split(search).join(replace);
        }
      },
      // Remove forward slashes from the input.
      noFolder: (input = '') => input.replace(/\/+/g, '_')
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
     * True if the input is not a number and not truthy, otherwise false.
     */
    NamingMask.isEmptyValue = function (input) {
      return !(angular.isNumber(input) || input);
    };

    /**
     * Tokenize the input using the separator.
     * Do not split anything enclosed by unescaped forward-slashes.
     */
    NamingMask.tokenize = function (input, separator) {
      let tokens = [], token = '', escaped = false, inRegex = false;
      for (let i = 0; i < input.length; i++) {
        let c = input[i];

        // Set flags when encountering special characters.
        switch (c) {
          case '\\':
            // Ignore the following special character.
            escaped = true;
            token += c;
            continue;
          case '/':
            // Start or end of a regular expression.
            if (!escaped) {
              inRegex = !inRegex;
            }
            break;
        }

        // Start a new token when a separator is encountered, unless inside a regex.
        if ((c === separator) && !inRegex) {
          // Start a new token.
          if (token) {
        	  tokens.push(token);
          }
          token = '';
        } else {
          // Append to the current token.
        	token += c;
        }

        // Reset the escaped flag.
        escaped = false;
      }

      // Append the final token to the array.
      if (token) {
        tokens.push(token);
      }

      return tokens;
    };

    /**
     * Split variables with an argument into an array.
     */
    NamingMask.parseVariable = function (variableName) {
      let start = variableName.indexOf('[');
      if (!!~start) {
        let end = variableName.indexOf(']', start + 1);
        if (!!~end) {
          return [
            variableName.substring(0, start),
            variableName.substring(start + 1, end)
          ];
        }
      }
      return [ variableName, null ];
    };

    /**
     * Get a function which produces the output for a variable.
     */
    NamingMask.getVariableFunc = function (variableDef, namingMask) {
      let [ variableName, variableParam ] = NamingMask.parseVariable(variableDef);
      let variableFunc = VARIABLES[variableName];
      if (!variableFunc) {
        throw browser.i18n.getMessage('errorNamingMaskBadVariable', variableName);
      }

      // Bind a context for the variable function.
      return variableFunc.bind({
        namingMask,
        parameter: variableParam
      });
    };

    /**
     * Convert a string enclosed by forward-slashes to a regular expression.
     */
    NamingMask.asStringOrRegex = function (search) {
      // If the "start of regex" slash is escaped, assume the search term is a string.
      if (search.startsWith('\\/')) {
        // Discard the escaping backlash.
        return search.slice(1);
      } else
      if (search.startsWith('/')) {
        let index = search.lastIndexOf('/');
        if (!!~index && (index !== 0)) {
          let pattern = search.substring(1, index);
          let flags = search.substring(index + 1) || 'gi';
          return new RegExp(pattern, flags);
        }
      }
      return search;
    };

    /**
     * A variable implementation to access a property of a URL instance.
     */
    NamingMask.urlAsVariable = function (url, parameter) {
      if (parameter) {
        if (parameter.startsWith('search')) {
          // Individual query parameters can be accessed using dot notation.
          let [ unused, param ] = parameter.split('.');
          return angular.isString(param) ? url.searchParams.get(param) : url.search;
        } else {
          let property = url[parameter];
          if (angular.isString(property)) {
            // data: URLs seem to have "null" origins.
            return (property !== "null") ? property : null;
          }
        }
      }
      return 'BADPARAM';
    };

    /**
     * Reset the internal variables such as the auto-incrementing number.
     */
    NamingMask.prototype.reset = function () {
      this.inum = 1;
    };

    /**
     * Split the expression into static and variable tokens.
     */
    NamingMask.prototype.compile = function (expression) {
      // Tokenize the expression by splitting on ${} variables.
      this.staticMask = true;
      const tokenRegex = /\$\{([^}]+)\}/ig;
      let match, index = 0;
      while ((match = tokenRegex.exec(expression)) !== null) {
        this.staticMask = false;

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
      try {
        let tokens = NamingMask.tokenize(variableDef, '|');

        // First token must be a variable.
        let variableFunc = NamingMask.getVariableFunc(tokens.shift(), this);

        // Remaining tokens are filters.
        // Generate a pipe of filters to evaluate.
        let pipe = tokens.map(this.compileFilter, this);

        // Return a function that evaluates the pipe on the variable.
        return (mediaItem) => {
          // Generate the initial value for the variable.
          let value = variableFunc(mediaItem);
          value = !NamingMask.isEmptyValue(value) ? value : '';

          // Evaluate each filter in the pipe.
          return pipe.reduce((output, filterFunc) => {
            let result = filterFunc(output, mediaItem);
            return !NamingMask.isEmptyValue(result) ? result : '';
          }, value);
        };
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
        let tokens = NamingMask.tokenize(filterDef, ':');

        // First token is the function name.
        let filterName = tokens.shift();
        let filterFunc = FILTERS[filterName];
        if (!filterFunc) {
          throw browser.i18n.getMessage('errorNamingMaskBadFilter', filterName);
        }

        // Remaining tokens are arguments.
        // Return a function that evaluates the filter.
        return (input, mediaItem) => {
          // Create a context object for the filter.
          return filterFunc.bind({
            namingMask: self,
            mediaItem
          })(input, ...tokens);
        };
      } catch (error) {
        this.error = this.error || error;
        return () => 'BADFILTER';
      }
    };

    /**
     * Evaluate the naming mask.
     */
    NamingMask.prototype.evaluate = function (mediaItem) {
      return this.tokens.reduce((output, token) => {
        return output + (angular.isString(token) ? token : token(mediaItem));
      }, '');
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
    var doCheckControls = null;
    var doCheckFilters = null;

    // ----- Controller init -----
    vm.scraping = true;
    vm.media = [];
    vm.unsortedMedia = [];
    vm.mediaFilters = MediaFilters;
    vm.lastClickedItem = null;
    vm.watchControls = false;
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
      checkedOnly: false,
      sortUrls: false,
      showImagePreview: false
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

    // Configure the popup from any supplied URL parameters.
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('inWindow')) {
      document.body.classList.add('in-window');
    }

    // Initialize the controls.
    loadControls().then(() => {
      // Begin scraping the active tab or requested tab.
      var scrapeTabId = urlParams.get('scrapeTabId');
      var tabId = (scrapeTabId !== null) ? Number(scrapeTabId) : null;
      vm.scrapeTab(tabId, true);
    });

    // Lifecycle and Callbacks -----------------------------------------------------------------------------------------

    /**
     * Invoked on every digest cycle.
     */
    vm.$doCheck = function () {
      // If watching controls, save controls when a changed is detected.
      if (vm.watchControls) {
        let doSave = false;

        // Check if controls changed.
        if (!angular.equals(doCheckControls, vm.controls)) {
          doSave = doSave || !!doCheckControls;
          doCheckControls = angular.copy(vm.controls);
        }

        // Check if filters changed.
        if (!angular.equals(doCheckFilters, vm.filters)) {
          doSave = doSave || !!doCheckFilters;
          doCheckFilters = angular.copy(vm.filters);
        }

        if (doSave) {
          saveControls();
        }
      }
    };

    // Functions -------------------------------------------------------------------------------------------------------

    /**
     * Load the interface controls from local settings.
     */
    function loadControls () {
      return browser.storage.local.get({
        controls: vm.controls,
        filters: vm.filters,
        watchControls: false
      }).then(results => $scope.$apply(() => {
        // Restore filters by assignment to preserve the defineProperty magic.
        for (let key in results.filters) {
          vm.filters[key] = results.filters[key];
        }

        // Restore values for other controls.
        angular.extend(vm.controls, results.controls);

        // Start watching controls for changes.
        vm.watchControls = results.watchControls;
      }));
    }

    /**
     * Save the interface controls to local settings.
     */
    function saveControls () {
      return browser.storage.local.set({
        controls: vm.controls,
        // Undo the defineProperty magic before saving since it seems to be incompatible with the new storage backend.
        // See #71.
        filters: Object.keys(vm.filters).reduce((filters, key) => {
          filters[key] = vm.filters[key];
          return filters;
        }, {})
      });
    }

    /**
     * Scrape the active tab to find downloadable content.
     */
    vm.scrapeTab = (tabId = null, assign = false) => {
      if (assign) {
        vm.media = [];
        vm.scraping = true;
      }

      // This defaults to activeTab if the tab ID is undefined.
      let promise = $q.when(browser.tabs.executeScript(tabId, {
        file: '/content/scrape.js',
        runAt: 'document_end',
        allFrames: true
      }).then(frames => {
        try {
          // Find the top frame to determinate the tab URL.
          let topFrame = frames.find(frame => frame.meta.topFrame);
          let tabUrl = new URL(topFrame.meta.frameUrl);
          let tabTitle = topFrame.meta.title;

          // Construct MediaItem instances from the scraped items in each frame.
          let mediaItems = frames.reduce((media, frame) => {
            let frameUrl = new URL(frame.meta.frameUrl);
            let frameTitle = frame.meta.title;
            for (let i = 0; i < frame.items.length; i++) {
              try {
                media.push(new MediaItem(angular.extend(frame.items[i], {
                  tabUrl,
                  frameUrl,
                  tabTitle,
                  frameTitle,
                })));
              } catch (e) {
                console.log('could not parse URL for scraped item');
              }
            }
            return media;
          }, []);
          vm.evaluateFilters(mediaItems);
          return mediaItems;
        } catch (error) {
          console.log('media item error', error);
          return [];
        }
      }).catch(error => {
        // Something went wrong and the tab could not be scraped.
        console.log('scrape tab failed', tab.id || 'activeTab', tab.index || 'activeTab', error);
        return [];
      }));

      // Put the scraped media on the controller if requested.
      return !assign ? promise : promise
        .then(media => {
          vm.unsortedMedia = media;
          vm.updateMediaList();
        })
        .finally(() => vm.scraping = false);
    };

    /**
     * Scrape all tabs in the window to find downloadable content.
     */
    vm.scrapeAllTabs = (assign) => {
      // Check permission to inject scripts into all of the other tabs.
      // Can't just request because of https://bugzilla.mozilla.org/show_bug.cgi?id=1432083.
      return browser.permissions.contains({ origins: [ '<all_urls>' ] }).then(granted => {
        if (!granted) {
          // Permission not granted.
          window.alert(browser.i18n.getMessage('needAllUrlsPermission'));
          return;
        }

        if (assign) {
          vm.media = [];
          vm.scraping = true;
        }
        let promise = $q.when(browser.tabs.query({ currentWindow: true }).then(tabs => {
          return $q.all(tabs
            // Do not scrape hidden or discarded tabs.
            .filter(tab => !tab.hidden && !tab.discarded)
            // Scrape each tab for media.
            .map(tab => vm.scrapeTab(tab.id, false))
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
          .then(media => {
            vm.unsortedMedia = media;
            vm.updateMediaList();
          })
          .finally(() => vm.scraping = false);
      });
    };

    /**
     * Update listed MediaItems by sorting if desired and re-evaluating masks
     */
    vm.updateMediaList = () => {
      if (vm.controls.sortUrls) {
        vm.media = vm.unsortedMedia.slice().sort((a, b) => a.getUrl().localeCompare(b.getUrl()));
      } else {
        vm.media = vm.unsortedMedia;
      }

      vm.evaluateNamingMask(vm.getVisibleMediaItems());
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
        if (fastFilterPredicate(mediaItem.getUrl())) {
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

      // Compile naming masks for the folder and file expressions.
      vm.namingMask = new NamingMask(vm.controls.namingMask);

      // Evaluate the mask expression on each MediaItem.
      mediaItems.forEach(mediaItem => {
        mediaItem.maskName = MediaItem.sanitizePath(vm.namingMask.evaluate(mediaItem));
      });
    };

    /**
     * Clear the naming mask and re-evaluate naming masks.
     */
    vm.clearNamingMask = function () {
      vm.controls.namingMask = '';
      vm.evaluateNamingMask(vm.getVisibleMediaItems());
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
          let haystack = mediaItem.getUrl().toLocaleLowerCase();
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
     * Get MediaItems from enabled sources.
     * Template logic can use vm.visibleMedia which is updated from the ng-repeat.
     */
    vm.getVisibleMediaItems = () => {
      return vm.media.filter(mediaItem => vm.controls.sources[mediaItem.source]);
    };

    /**
     * Get checked MediaItems from enabled sources.
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
    vm.toggleMediaItemChecked = (mediaItem, index, event) => {
      // Toggle the checked state of the clicked-upon item.
      mediaItem.checked = !mediaItem.checked;

      // Apply the same state to all items in a range when shift is pressed.
      if (event.shiftKey) {
        // Ensure that the last clicked item is still visible.
        let startIndex = vm.visibleMedia.indexOf(vm.lastClickedItem);
        if (!!~startIndex) {
          if (startIndex < index) {
            for (let i = startIndex; i < index; i++) {
              vm.visibleMedia[i].checked = mediaItem.checked;
            }
          } else {
            for (let i = startIndex; i > index; i--) {
              vm.visibleMedia[i].checked = mediaItem.checked;
            }
          }
        }

        // Clear the selection.
        window.getSelection().removeAllRanges();
      }

      // Record the last clicked item in the table.
      vm.lastClickedItem = mediaItem;

      // Evaluate the naming mask again.
      vm.evaluateNamingMask(vm.getVisibleMediaItems());
    };

    /**
     * Toggle the sources for which MediaItems are visible.
     */
    vm.toggleMediaSource = function (source) {
      vm.controls.sources[source] = !vm.controls.sources[source];
      vm.evaluateNamingMask(vm.getVisibleMediaItems());
    };

    /**
     * Toggle sorting MediaItems alphabetically by URL or keeping DOM order.
     */
    vm.toggleSortUrls = function () {
      vm.controls.sortUrls = !vm.controls.sortUrls;
      vm.updateMediaList();
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

      // Naming masks must not have any errors.
      if (vm.namingMask && vm.namingMask.error) {
        return false;
      }

      // At least one item must be checked and the source must be enabled.
      if (!vm.media.some(mediaItem => mediaItem.checked && vm.controls.sources[mediaItem.source])) {
        return false;
      }

      return true;
    };

    /**
     * Sanitize the download path.
     */
    vm.getSanitizedDownloadPath = () => {
      return vm.controls.downloadPath
        .split('/')
        .map(part => part.replace(/[:"*?<>|]/gi, '_').replace(/^\./, '_'))
        .join('/');
    };

    /**
     * Download the checked MediaItems.
     */
    vm.downloadMediaItems = () => {
      // Re-evaluate naming masks before proceeding.
      vm.evaluateNamingMask(vm.getVisibleMediaItems());

      // Save the interface controls before proceeding.
      saveControls().then(() => {
        browser.runtime.sendMessage({
          topic: 'ds-downloadMediaItems',
          data: {
            options: {
              downloadPath: vm.getSanitizedDownloadPath(),
              conflictAction: vm.controls.conflictAction,
              eraseHistory: vm.controls.eraseHistory,
            },
            mediaItems: vm.getCheckedMediaItems().map(mediaItem => ({
              url: mediaItem.getUrl(),
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
      const fontWidth = 7.8;

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
        let maxLength = Math.floor(((window.innerWidth - 90) / fontWidth) - 2);
        if (mediaItem.isDataUrl) {
          // Data URL has no filename on the URL.
          shortenNoFilename(mediaItem, maxLength);
        } else
        if (mediaItem.filename) {
          // Highlight the extension if it was present in the URL.
          let filename = (mediaItem.isExtensionInUrl) ?
            mediaItem.getFilename() : // Filename with extension if known.
            mediaItem.filename;       // Filename without extension.

          // Get the index of the path. Start searching after the origin.
          let pathStart = mediaItem.getUrl().indexOf(mediaItem.url.pathname, mediaItem.url.origin.length);
          let index = mediaItem.getUrl().indexOf(filename, pathStart);
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
          scope.before = mediaItem.getUrl().substring(0, index);
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
          scope.after = mediaItem.getUrl().substring(index + filename.length);
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
        if (mediaItem.getUrl().length >= maxLength) {
          scope.before = mediaItem.getUrl().substring(0, maxLength - 1) + '…';
        } else {
          scope.before = mediaItem.getUrl();
        }
      }

    }
  };
}]);
