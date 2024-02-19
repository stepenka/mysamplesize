
app.controller('fileController', ['$scope', '$http', '$timeout', '$q', 
function ($scope, $http, $timeout, $q) {
    $scope.csvdata = '';
    $scope.display = {
        data: 'Random data initialized'
    };
    
    $scope.getFile = function () {
        return postFormData();
    };
    function postFormData() {
        var formData = new FormData();
        formData.append('file', $scope.file);
        
        return $http({
            method: 'POST',
            url: '/uploadCSV',
            data: formData,
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function successCallback(response) {
            //do stuff
            
            var content = response.data.content;
            var status  = response.data.status;
            
            if( status ){
                $scope.display.data = 'File loaded: ' + $scope.file.name;
                $scope.myfun(content);
            } else {
                $scope.display.data = 'File load error!';
            }
            
            return $scope.plotDataFn();
            $timeout(function(){
                $scope.display.data = ''
            }, 2000);
            
        }, function errorCallback(response) {
            // do stuff
            console.log( 'error response', response );
        });
    };
    
    $scope.myfun = false;
    $scope.plotDataFn = false;
    $scope.fileController_handler = function( myfun, plotDataFn ){
        $scope.myfun = myfun;
        $scope.plotDataFn = plotDataFn;
    };
    
    $scope.downloadCSV = function(text) {
        if( !text ){
            text = $scope.csvdata;
        }
        
        var filename = 'simData.csv';
        //var text = $scope.csvdata;
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    };
    
}]);

app.directive("ngFile",function(){
    return {
        link: function($scope,el){
            el.bind("change", function(e){
                $scope.file = (e.srcElement || e.target).files[0];
                $scope.getFile().then(function(){
                    (e.srcElement || e.target).value = '';
                });
            })
        }
    }
});
