'use strict';

var i18nModule = angular.module('ds-moment', []);

i18nModule.filter('momentFormat', [
  function () {
    return function (input, format) {
      return moment(input).format(format);
    };
  }]);
