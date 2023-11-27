'use strict';

app
    .controller('reportsController', [
        '$scope', '$rootScope', '$state', 'designService', 'authService', '$timeout', '$uibModal',
        reportsController
    ]);
  
function reportsController($scope, $rootScope, $state, designService, authService, $timeout, $uibModal)
{
    $scope.sqlprojects  = authService.sqlprojects;
    $scope.DGcompleted  = designService.DGcompleted;     // used for display
    
    $scope.projectChange = function () {
        //console.log('Project', $scope.sqlprojects.selected.name );
        
        authService.subProjectSelected = $scope.sqlprojects.selected.subs[0];
    };
    
    $scope.dataExists = function() {
        var subProj = authService.subProjectSelected;
        var subProjExists = (subProj !== null) && (subProj !== undefined);

        return (authService.sqlprojects.selected && subProj);
    };
    
    function get_rand_string_tools()
    {
        var currentDate  = new Date();
        var rand_string  = currentDate.getDate() + '' + currentDate.getMonth() + '' + 
                            currentDate.getFullYear() + '' + currentDate.getHours() + '' + 
                            currentDate.getMinutes() + '' + currentDate.getSeconds();
        rand_string      = '?v=' + rand_string;
        
        if( authService.authenticated && $scope.dataExists() ){
            var tableName = '';
            
            if( authService.subProjectSelected ){
                tableName = authService.subProjectSelected.table;

                if( tableName == 'graph' ){
                    tableName += "&rowid=" + authService.subProjectSelected.rowid;
                } else {
                    tableName += "&rowid=None"
                }
            }
            
            rand_string += '&user_id=' + authService.user_id + '&project=' + authService.sqlprojects.selected.name + "&table=" + tableName;
            
            //console.log(rand_string);
        }
      
        return rand_string;
    };
    
    //To transfer data to Python with trustSrc
    $scope.tools_report_url = ''; //$rootScope.trustSrc('/toolsPDF'+ get_rand_string_tools());
    
    $scope.getToolsReport = function(){
        if( $scope.dataExists() )
            $scope.tools_report_url = $rootScope.trustSrc('/toolsPDF'+ get_rand_string_tools());
        else
            $scope.tools_report_url = $rootScope.trustSrc('/static/img/arrive/blank.pdf');
    };

    //Make wait icon for loading reports
    $scope.spin_status = 0;
    $scope.spin = function(){
        $scope.spin_status = 100;
        $timeout(function(){$scope.spin_status = 0}, 2500);
    };
};
