
app.controller('rngController', ['$scope', '$http', '$rootScope', '$timeout',
function($scope, $http, $rootScope, $timeout) {
    
    $scope.data = {
        isCrossOver: false,
        
        n: 5,
        
        nTreatments: 2,
        nNonTreatments: 1,
        
        treatmentLevels: [2,3],
        nonTreatmentLevels: [2],
        
        table: [],
    };

    $scope.dataOut = {
        nGroups: 1
    };
    
    $scope.range = function(n) {
        return new Array(n);
    };
    
    $scope.$watch('data.nTreatments', function(nv, ov) {
        var dist = nv - ov;
        
        for(var ii=0; ii<Math.abs(dist); ii++){
            if( nv > ov )
                $scope.data.treatmentLevels.push(2);
            else 
                $scope.data.treatmentLevels.pop();
        }
        $scope.trtUpdate();
    });
    
    $scope.$watch('data.nNonTreatments', function(nv, ov) {
        var dist = nv - ov;
        
        for(var ii=0; ii<Math.abs(dist); ii++){
            if( nv > ov )
                $scope.data.nonTreatmentLevels.push(2);
            else 
                $scope.data.nonTreatmentLevels.pop();
        }
    });
    
    $scope.nTreat = function() {
        return $scope.data.treatmentLevels.length;
    };
    $scope.nNonTreat = function() {
        return $scope.data.nonTreatmentLevels.length;
    };
    $scope.maxLevels = function () {
        return $scope.nTreat() >= $scope.nNonTreat() ? $scope.nTreat() : $scope.nNonTreat();
    };
    
    $scope.trtUpdate = function() {
        var nGroups = 1;
        
        for(var ii=0; ii<$scope.data.treatmentLevels.length; ii++){
            nGroups = nGroups * $scope.data.treatmentLevels[ii];
        }
        
        $scope.dataOut.nGroups = nGroups;
    };
    
    $scope.rngCalc = function() {
        $http({
            method: 'POST',
            url: '/rng_table',
            data: $scope.data,
            headers: {'Content-Type': 'application/json'},
        }).then(function successCallback(response) {
            
            $scope.data.table = response.data;
            
            //console.log( $scope.data.table );
        }, function errorCallback(response) {
            console.log(response)
        });
    };
    
}]);
