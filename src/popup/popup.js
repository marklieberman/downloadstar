/* global angular */
'use strict';

var app = angular.module('dsPopupApp', []);

// ---------------------------------------------------------------------------------------------------------------------
app.controller('PopupCtrl', [
  '$scope',
  function ($scope) {

    var IMAGE_FILTER = /\.(jpe?g|png|gif|bmp)\b/;
    var VIDEO_FILTER = /\.(webm|mp4|mkv|m4v|mov|avi)\b/;
    var AUDIO_FILTER = /\.(mp3|flac|m4a|aac|ape|ogg)\b/;
    var ARCHIVE_FILTER = /\.(zip|rar|7z)\b/;
    var EXE_FILTER = /\.(exe|dmg|apk|xpi)\b/;
    var DOCUMENT_FILTER = /\.(doc[xm]?|xls[xm]?|pdf|xps|eps)\b/;

    // ----- Scope variables -----
    $scope.error = false;
    $scope.scraping = true;
    $scope.controls = {
      downloadPath: 'DownloadStar/',
      conflictAction: 'skip',
      eraseHistory: false,
      sourceList: 'links'
    };
    $scope.filters = {
      useImageFilter: false,
      useVideoFilter: false,
      useAudioFilter: false,
      useArchiveFilter: false,
      useExeFilter: false,
      useDocumentFilter: false,
      fastFilter: '',
      fastFilterRegex: false
    };
    $scope.media = [];

    // ----- Publish scope functions -----
    $scope.getMediaList = getMediaList;
    $scope.getMediaListChecked = getMediaListChecked;
    $scope.evaluateFilters = evaluateFilters;
    $scope.downloadFiles = downloadFiles;

    // ----- Scope watch -----
    $scope.$watch('controls', (newValue, oldValue) => {
      if (!angular.equals(newValue, oldValue)) {
        browser.storage.local.set({ controls: newValue });
      }
    }, true);
    $scope.$watch('filters', (newValue, oldValue) => {
      if (!angular.equals(newValue, oldValue)) {
        browser.storage.local.set({ filters: newValue });
        $scope.evaluateFilters($scope.media.links);
        $scope.evaluateFilters($scope.media.embeds);
        $scope.evaluateFilters($scope.media.text);
      }
    }, true);

    // ----- Controller init -----

    // Initialize settings.
    browser.storage.local.get({
      controls: $scope.controls,
      filters: $scope.filters
    }).then(results => {
      angular.extend($scope.controls, results.controls);
      angular.extend($scope.filters, results.filters);
    });

    // Scrape the page for links.
    var promise = browser.tabs.executeScript({
      file: '/content/scrape.js',
      runAt: 'document_end',
      allFrames: true
    });

    promise.then(frames => $scope.$apply(() => {
      $scope.scraping = false;
      $scope.media = frames.reduce((media, frame) => {
        media.links = media.links.concat(frame.links.map(item => {
          item.checked = false;
          return item;
        }));

        media.embeds = media.embeds.concat(frame.embeds.map(item => {
          item.checked = false;
          return item;
        }));

        console.log(frame);
        media.text = media.text.concat(frame.text.map(item => {
          item.checked = false;
          return item;
        }));
        return media;
      }, { links: [], embeds: [], text: [] });
    }));

    // Close the popup if scraping failed.
    promise.catch(err => $scope.$apply(() => {
      $scope.error = true;
    }));

    // Functions -------------------------------------------------------------------------------------------------------

    function getMediaList () {
      switch ($scope.controls.sourceList) {
        case 'links':
          return $scope.media.links;
        case 'embeds':
          return $scope.media.embeds;
      case 'text':
        return $scope.media.text;
      }
      return [];
    }

    function applyImageFilter (item) {
      if (IMAGE_FILTER.test(item.url)) {
        item.checked |= true;
        item.matches.push('Image');
      }
    }

    function applyVideoFilter (item) {
      if (VIDEO_FILTER.test(item.url)) {
        item.checked |= true;
        item.matches.push('Video');
      }
    }

    function applyAudioFilter (item) {
      if (AUDIO_FILTER.test(item.url)) {
        item.checked |= true;
        item.matches.push('Audio');
      }
    }

    function applyArchiveFilter (item) {
      if (ARCHIVE_FILTER.test(item.url)) {
        item.checked |= true;
        item.matches.push('Archive');
      }
    }

    function applyExeFilter (item) {
      if (EXE_FILTER.test(item.url)) {
        item.checked |= true;
        item.matches.push('Exe');
      }
    }

    function applyDocumentFilter (item) {
      if (DOCUMENT_FILTER.test(item.url)) {
        item.checked |= true;
        item.matches.push('Document');
      }
    }

    function getFastFilterPredicate () {
      try {
        if ($scope.filters.fastFilterRegex) {
          // Fast filter is a regular expression.
          let regex = new RegExp($scope.filters.fastFilter, 'gi');
          return url => regex.test(url);
        } else {
          // Fast filter is a wildcard pattern.
          let tokens = $scope.filters.fastFilter.split('*').filter(token => !!token);
          return url => {
            let index = 0;
            for (let i = 0; i < tokens.length; i++) {
              index = url.indexOf(tokens[i], index);
              if (index == -1) {
                return false;
              }
            }
            return true;
          };
        }
      } catch (err) {}
      return url => false;
    }

    function applyFastFilter (item, fastFilterPredicate) {
      if (fastFilterPredicate(item.url)) {
        item.checked |= true;
        item.matches.push('FastFilter');
      }
    }

    function evaluateFilters (list) {
      let predicate = getFastFilterPredicate();
      list.forEach(item => {
        item.checked = false;
        item.matches = [];

        if ($scope.filters.useImageFilter) {
          applyImageFilter(item);
        }

        if ($scope.filters.useVideoFilter) {
          applyVideoFilter(item);
        }

        if ($scope.filters.useAudioFilter) {
          applyAudioFilter(item);
        }

        if ($scope.filters.useArchiveFilter) {
          applyArchiveFilter(item);
        }

        if ($scope.filters.useExeFilter) {
          applyExeFilter(item);
        }

        if ($scope.filters.useDocumentFilter) {
          applyDocumentFilter(item);
        }

        if ($scope.filters.fastFilter) {
          applyFastFilter(item, predicate);
        }

        item.matches = item.matches.join(', ');
      });
    }

    function getMediaListChecked () {
      return getMediaList().filter(item => item.checked);
    }

    function downloadFiles () {
      window.close();

      let downloadPath = $scope.controls.downloadPath
        .split(/(\/|\\)]/)
        .filter(token => !!token)
        .join('/');

      browser.runtime.sendMessage({
        topic: 'ds-downloadFiles',
        data: {
          items: getMediaList().filter(item => item.checked),
          downloadPath: downloadPath,
          conflictAction: $scope.controls.conflictAction,
          eraseHistory: $scope.controls.eraseHistory
        }
      });
    }

  }]);
