/* global angular */
'use strict';

var app = angular.module('dsPopupApp', [
  'ds-i18n'
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
      watchControls: false,           // Watch controls for changes?
      maxConcurrentDownloads: 4,      // Maximum concurrent downloads.
      keepHistory: 'always',          // Store download history?
      maxHistory: 1000,               // Maximum number of history entries.
      browserActionPopupType: 'popup' // How to open the popup
    };
    vm.permissions = {
      origins: []
    };

    // Load settings from storage.
    $q.when(browser.storage.local.get(vm.settings)).then(results => {
      angular.copy(results, vm.settings);
      doCheckSettings = angular.copy(results);

      // Refresh permissions.
      vm.refreshPermissions();
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

    // Functions -------------------------------------------------------------------------------------------------------

    /**
     * Refresh the permissions granted to the addon.
     */
    vm.refreshPermissions = () => {
      $q.when(browser.permissions.getAll()).then(permissions => vm.permissions = permissions);
    };

    /**
     * True if the addon has been granted '<all_urls>', otherwise false.
     **/
    vm.hasAllUrlsPermission = () => {
      return !!~vm.permissions.origins.indexOf('<all_urls>');
    };

    /**
     * Grant the '<all_urls>' host permissions required to use scrape all tabs.
     */
    vm.grantAllUrlsPermission = () => {
      browser.permissions.request({ origins: [ '<all_urls>' ] }).then(granted => {
        vm.refreshPermissions();
      });
    };

    /**
     * Remove all optional permissions used by the addon.
     */
    vm.removeAllPermissions = () => {
      browser.permissions.remove({ origins: [ '<all_urls>' ] }).then(removed => {
        vm.refreshPermissions();
        window.alert(browser.i18n.getMessage('removePermissionsSuccess'));
      });
    };

    /**
     * Configure the method by which the popup is opened.
     */
    vm.reconfigurePopup = () => {
      if (vm.settings.browserActionPopupType === 'popup') {
        // Set the popup URL; the onClicked handler will not receive callbacks.
        browser.browserAction.setPopup({
          popup: '/popup/popup.html'
        });
      } else {
        // Clear the popup URL; the onClicked handler to receive callbacks.
        browser.browserAction.setPopup({
          popup: ''
        });
      }
    };

  }]);
