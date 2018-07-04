/* global angular */
'use strict';

var app = angular.module('dsPopupApp', [
  'i18n'
]);

// ---------------------------------------------------------------------------------------------------------------------
// Main controller for the options page.
app.controller('OptionsCtrl', [
  '$scope',
  '$q',
  function ($scope, $q) {

    var vm = this;
    var doCheckSettings = null;

    // ----- Controller init -----
    vm.settings = {
      maxConcurrentDownloads: 4, // Maximum concurrent downloads.
      keepHistory: 'always',     // Store download history?
      maxHistory: 1000           // Maximum number of history entries.
    };

    // Load settings from storage.
    $q.when(browser.storage.local.get(vm.settings)).then(results => {
      angular.copy(results, vm.settings);
      doCheckSettings = angular.copy(results);
    });

    // Lifecycle and Callbacks -----------------------------------------------------------------------------------------

    /**
     * Invoked on every digest cycle.
     */
    vm.$doCheck = () => {
      // Save settings whenever the settings change.
      if (doCheckSettings && !angular.equals(doCheckSettings, vm.settings)) {
        doCheckSettings = angular.copy(vm.settings);
        browser.storage.local.set(vm.settings);
        console.log('settings changed', vm.settings);
      }
    };

  }]);
