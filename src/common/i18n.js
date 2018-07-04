'use strict';

var i18nModule = angular.module('i18n', []);

i18nModule.directive('i18n', [
  function () {
    return {
      restrict: 'EA',
      scope: {
        i18n: '<'
      },
      link: (scope, element, attrs) => {
        attrs.$observe('i18n', function (attributeValue) {
          let value = scope.$eval(attributeValue);
          if (angular.isString(value)) {
            element[0].innerText = browser.i18n.getMessage(value);
          }
        });
      }
    };
}]);

i18nModule.directive('i18nTitle', [
  function () {
    return {
      restrict: 'A',
      scope: {
        i18nTitle: '<'
      },
      link: (scope, element, attrs) => {
        attrs.$observe('i18nTitle', function (attributeValue) {
          let value = scope.$eval(attributeValue);
          if (angular.isString(value)) {
            element[0].setAttribute('title', browser.i18n.getMessage(value));
          }
        });

      }
    };
}]);

i18nModule.directive('i18nPlaceholder', [
  function () {
    return {
      restrict: 'A',
      scope: {
        i18nTitle: '<'
      },
      link: (scope, element, attrs) => {
        attrs.$observe('i18nPlaceholder', function (attributeValue) {
          let value = scope.$eval(attributeValue);
          if (angular.isString(value)) {
            element[0].setAttribute('placeholder', browser.i18n.getMessage(value));
          }
        });

      }
    };
}]);
