/* global angular */
'use strict';

var app = angular.module('dsPopupApp', [
  'ds-moment'
]);

// ---------------------------------------------------------------------------------------------------------------------
// Main controller for the queue page.
app.controller('QueueCtrl', [
  '$scope',
  '$q',
  function ($scope, $q) {

    var vm = this;

    // ----- Controller init -----
    vm.queue = [];
    vm.concurrentDownloads = 0;

    refreshQueue();

    // Functions -------------------------------------------------------------------------------------------------------

    function refreshQueue () {
      return $q.when(browser.runtime.sendMessage({
        topic: 'ds-getQueue'
      })).then(data => {
        vm.queue = data.queue;
        vm.concurrentDownloads = data.concurrentDownloads;
      });
    }

    vm.clearQueue = () => {
      return $q.when(browser.runtime.sendMessage({
        topic: 'ds-clearQueue'
      })).then(() => refreshQueue());
    };

  }]);
