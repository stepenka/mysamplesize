'use strict';

app.directive('effectSize', [function() {
  return {
    restrict: 'E',
    scope: true,
    template: '<a class="keyword-directive" ui-sref="help.statbasics.effect">effect size</a>'
  };
}]);

app.directive('standardDeviation', [function() {
  return {
    restrict: 'E',
    scope: true,
    template: '<a class="keyword-directive" ui-sref="help.statbasics.stdev">standard deviation</a>'
  };
}]);

app.directive('power', [function() {
  return {
    restrict: 'E',
    scope: true,
    template: '<a class="keyword-directive" ui-sref="help.statbasics.power">power</a>'
  };
}]);

app.directive('significance', [function() {
  return {
    restrict: 'E',
    scope: true,
    template: '<a class="keyword-directive" ui-sref="help.statbasics.sig">significance</a>'
  };
}]);
