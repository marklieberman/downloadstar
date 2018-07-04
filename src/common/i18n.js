'use strict';

var i18nModule = angular.module('i18n', []);

i18nModule.directive('i18n', [
  function () {
    return {
      restrict: 'EA',
      scope: {
        i18n: '='
      },
      link: (scope, element, attrs) => {
        // Only treat the string as HTML if enabled by attribute.
        let setter = angular.isDefined(attrs.i18nHtml) ? 'innerHTML' : 'innerText';

        scope.$watch('i18n', args => {
          if (angular.isString(args)) {
            element[0][setter] = browser.i18n.getMessage(args);
          } else
          if (angular.isArray(args)) {
            let message = args.shift();
            element[0][setter] = browser.i18n.getMessage(message, args);
          }
        });
      }
    };
}]);
