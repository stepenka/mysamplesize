'use strict';

app.controller('userProjectsController', [
    '$scope', '$rootScope', '$state', '$http', 'designService', 'authService', '$timeout', '$uibModal',
    userProjectsController
]);
  
function userProjectsController($scope, $rootScope, $state, $http, designService, authService, $timeout, $uibModal)
{
    $scope.DGcompleted  = designService.DGcompleted;     // used for display
    $scope.design = designService;
    
    authService.getProjects();

    //Functions for User Projects Page
    $scope.sortUpName = function(){
        authService.sqlprojects.options.sort(function(a,b){
            var textA = a.name.toUpperCase();
            var textB = b.name.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    };

    $scope.sortDownName = function(){
        authService.sqlprojects.options.sort(function(a,b){
            var textA = a.name.toUpperCase();
            var textB = b.name.toUpperCase();
            return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
        });
    };

    $scope.sortUpDate = function(){
        authService.sqlprojects.options.sort(function(a,b){
            var textA = a.created.toUpperCase();
            var textB = b.created.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    };

    $scope.sortDownDate = function(){
        authService.sqlprojects.options.sort(function(a,b){
            var textA = a.created.toUpperCase();
            var textB = b.created.toUpperCase();
            return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
        });
    };

    $scope.validname = 'NOTvalid';
    $scope.alert = false;
    $scope.alert2 = false;

    function checkname(myArray, name){
        var found = myArray.some(function (el) {
            return el.name === name;
        });
        if (!found) {
            $scope.validname = 'valid'
            }
        if (found) {
            $scope.validname = 'NOTvalid'
        }
    };

    //User database controls
    function addsqlRow(myArray,holdername) {
        //remove current view on webpage
        //myArray.splice(0, myArray.length);        // WHAT IS THE PURPOSE OF THIS LINE?
        
        // push new row to database projects
        $http({
            method: 'GET',
            url: '/newproject?user_id=' + authService.user_id + '&project=' + holdername,
        }).then(function successCallback(response) {
            $scope.addsqlRow_valid = response.data;
            
            authService.handleGetProjects( response.data );
            
        }, function errorCallback(response) {
        });
    };

    $scope.check_addsqlRow = function(myArray) {
        var holdername = "New Project";
        checkname(myArray,holdername);
        if ($scope.validname=='valid') {
           addsqlRow(myArray,holdername);
        } else {
            for (var i = 1; i < 51; i++) {
                var holdername = "New Project " + i;
                checkname(myArray,holdername);
                if(i==50){
                    $scope.alert2=true;
                    break;
                } else if($scope.validname=='valid'){
                    addsqlRow(myArray,holdername);
                    break;
                }
            }
        }
    };
    
    $scope.deleteProject = function(mainProject, subProject)
    {
        // delete subproject in database
        $http({
            method: 'POST',
            url: '/deleteSubProject',
            headers: {'Content-Type': 'application/json'},
            data: {project: mainProject.name, rowid: subProject.rowid, table: subProject.table, user_id: authService.user_id}
        }).then(function successCallback(response) {
            // update user information from database
            authService.handleGetProjects( response.data );
        }, function errorCallback(response) {
            // update user information from database
        });
    };
    
    $scope.removesqlRow = function(myArray, index) {
        var projectname = myArray[index].name;
        
        //remove current view on webpage
        myArray.splice(0, myArray.length);
        
        // delete row in database
        $http.get('/deleteproject?user_id=' + authService.user_id + '&project=' + projectname
        ).then(function successCallback(response) {
            // update user information from database
            authService.handleGetProjects( response.data );
        }, function errorCallback(response) {
        });
    };
    
    $scope.renameSubmit = function(isValid, myArray, index, newname){
        if(isValid){
            renameSql(myArray, index, newname);
        }
    };

    function renameSql(myArray, index, newname) {
        var projectname = myArray[index].name;
        
        checkname(myArray,newname);
        if ($scope.validname == 'valid'){
            //remove current view on webpage
            myArray.splice(0, myArray.length);

            // delete row in database
            $http({
                method: 'GET',
                url: '/renameproject?user_id=' + authService.user_id + '&project=' + projectname + '&newname=' + newname,
            }).then(function successCallback(response) {
                // update user information from database
                authService.sqlprojects.selected = 0;
                authService.handleGetProjects( response.data );
            }, function errorCallback(response) {
            });

            // reset name check
            $scope.validname = 'backtonotvalid';
            $scope.alert = false;
        }
        if ($scope.validname == 'NOTvalid'){
            //call alert
            $scope.alert = true;
        }
    };

    $scope.clickProject = function(mainProject, subProject)
    {
        var clickOut = "<div class='pull-right'><button class='btn btn-primary' type='button' ng-click='ok()'>X</button></div>";
        var projName = mainProject.name;
        var table    = subProject.table;
        var rowid    = subProject.rowid;
        var userid   = authService.user_id;
        var queryStr = "project="+projName + "&rowid="+rowid + "&user_id="+userid + "&table="+table;
        var pyUrl    = '/toolsHTML';
        
        // if in DesignGuide, then just load the necessary data to fill in the DG report
        if( !designService.notEmbedded )
        {
            pyUrl = '/getDGdata';
            
            if( table !== "design_guide" ){
                alert("You can only load Design Guide data into the Design Guide!");
                return;
            }
        }
        
        $http({
            method: 'GET',
            url: pyUrl + '?' + queryStr,
        }).then(function successCallback(response) {
            
            // Trust so we can embed the returned HTML (<img> data)
            var imgData      = response.data;
            
            if( !designService.notEmbedded ){
                designService.formData = imgData;
                // need a way to close the modal here
                return;
            }
            
            var templateData = "<div class='modal-header'><h3>" + projName + " > " + subProject.name;
            templateData    += clickOut;
            templateData    += "</h3></div> <div class='modal-body text-center'>" + imgData + "</div>";

            var modalInstance = $uibModal.open({
                animation: true,
                controller: 'ModalInstanceCtrl',
                template: templateData,
                size: 'lg'
            });
            
        }, function errorCallback(response) {
        });
    };
};
