app.controller('rootController', 
['$scope', '$state', '$rootScope','authService', '$document', '$timeout', rootController]);

/* @ngInject */
function rootController($scope, $state, $rootScope, authService, $document, $timeout)
{
    // Global naming shortcuts
    $scope.state = $state;
    
    $scope.getCurrentStateName = function() {
        return $scope.$state.current.name;
    };
    
    $scope.standalone = 0;
    $rootScope.$watch('standalone', function() {
        $scope.standalone = $rootScope.standalone;
    });
    
    // input id as a string --
    $scope.scrollToElementById = function(idname) {
        $timeout( function(){
            var res = document.getElementById(idname);
            var ae  = angular.element(res);
            $document.duScrollToElement(ae, 300, 750);
        }, 100);    // set a small timeout to wait for rendering / bounding client rect (applicable when using ng-show)
    };
    
    $scope.range = function(n) {
        var arr = [];
        for(var ii=0; ii<n; ii++){
            arr.push(ii);
        }
        return arr;
    };
    
    $scope.authService = authService;
};
