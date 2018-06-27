/* global angular */
'use strict';

var app = angular.module('dsPopupApp', []);

// ---------------------------------------------------------------------------------------------------------------------
// Main controller for the history page.
app.controller('HistoryCtrl', [
  '$scope',
  '$q',
  function ($scope, $q) {

    var vm = this;

    // ----- Controller init -----
    vm.history = [];

    refreshHistory();

    // Functions -------------------------------------------------------------------------------------------------------

    function refreshHistory () {
      return $q.when(browser.storage.local.get({ history: [] }))
        .then(results => vm.history = results.history);
    }

    vm.clearHistory = () => {
      return browser.storage.local.set({ history: [] })
        .then(() => refreshHistory());
    };

  }]);
