/* global angular */
'use strict';

var app = angular.module('dsPopupApp', [
  'ui.bootstrap'
]);

// ---------------------------------------------------------------------------------------------------------------------
app.controller('PopupCtrl', [
  '$scope',
  function ($scope) {
    // ----- Scope variables -----
    $scope.controls = {
      activeTab: 'links',
      manualPattern: null,

      collapseFilters: true
    };
    $scope.media = [];

    // ----- Publish scope functions -----
    $scope.checkMatch = checkMatch;

    // ----- Controller init -----
    var promise = browser.tabs.executeScript({
      file: '/content/scrape.js',
      runAt: 'document_end'
    });

    promise.then(frames => $scope.$apply(() => {
      $scope.media = {
        links: frames[0].links.map(urlToItem),
        embeds: frames[0].embeds.map(urlToItem),
      };
    }));

    // Functions -------------------------------------------------------------------------------------------------------

    function urlToItem (url) {
      return {
        url: url,
        checked: false
      };
    }

    function checkMatch (item) {
      if ($scope.controls.manualPattern) {
        return item.url.match($scope.controls.manualPattern);
      }

      return false;
    }

  }]);
