
// --------------------------------
app.controller('ContactForm', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
    
    $scope.send_status = 0;

    $scope.formData = {
        name : '',
        email : '',
        phone : '',
        message : ''
    };
    
    resetFormData = function()
    {
        $scope.formData = {
        name : '',
        email : '',
        phone : '',
        message : ''
        };
    };
    
    $scope.submit = function()
    {
        var data  = $scope.formData;
        $scope.send_status = 1;
        
        $http({
            method: 'POST',
            url: '/contact',
            headers: {'Content-Type': 'application/json'},
            data: data
        }).then(function successCallback(response) {
            //added for unit testing to see if data was being passed though, do we need data to just be written to log?
            // KH: writing to log seems to break IE, so this solution is better.
            $scope.contactinfo = response.data

        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
        
        resetFormData();
        
        $scope.send_status = 2
        
        $timeout(function(){$scope.send_status = 0}, 5000);
    };
}]);
