'use strict';

app.controller('saveController', ['$scope', '$http', '$timeout', '$q', '$state', 'calculatorService', 'designService', 'plotsService', 'authService', saveController]);
function saveController($scope, $http, $timeout, $q, $state, calculatorService, designService, plotsService, authService)
{
    $scope.userWarn = 'Saving will rewrite any data';
    $scope.design = designService;
    
    $scope.accordionStatus = {
        isCustomHeaderOpen: !$scope.design.notEmbedded
    };
    
    $scope.save_status = 0; // For save button animation
    
    $scope.save = function()
    {
        //console.log( $state.current.name );
        
        if( $state.current.name == 'tools.powersize' || $state.current.name == 'tools.samplesize')
        {
            saveSampleAndPowerData();
        }
        else if($state.current.name == 'design_guide') {
            saveDesignGuideData();
        }
        else //if( $state.current.name == 'tools.pwrgraph')
        {
            savePlots();
        }
        $scope.save_status = 1
        $timeout(function(){$scope.save_status = 0}, 500);
    };
    
    function saveDesignGuideData() {
        var projectname = authService.sqlprojects.selected.name;
        
        designService.reportData.tool = "design_guide";
        designService.reportData.project = projectname;
        
        $http({
            method: 'POST',
            url: '/saveUserData',
            headers: {'Content-Type': 'application/json'},
            data: designService.reportData
        }).then(function successCallback(response) {

            var currentSelectedProject = authService.sqlprojects.selected;
            authService.getProjects().then(function(){
                updateCurrentSelectedProject( currentSelectedProject );
           });
        }, function errorCallback(response) {
            console.log( 'saveUserData error');console.log(response);
        });
    };
    
    function updateCurrentSelectedProject( currentSelectedProject ) {
        if( currentSelectedProject ){
            var allOpts = authService.sqlprojects.options;
            var selectedProjMatch = allOpts[0];
            
            for(var ii=0; ii<allOpts.length; ii++){
                if( allOpts[ii].id == currentSelectedProject.id ){
                    selectedProjMatch = allOpts[ii];
                }
            }
            authService.sqlprojects.selected = selectedProjMatch;
            authService.subProjectSelected = selectedProjMatch.subs[0];
        }
    };
    
    function saveSampleAndPowerData()
    {
        var projectname = authService.sqlprojects.selected.name;
        $scope.save_status = 0;
        
        var data     = calculatorService.data;
        data.test    = designService.stat.selectedOption.name;
        data.user_id = authService.user_id;
        data.project = projectname;
        
        var toolsScope = $scope.$parent.$parent.$parent;	// refer to toolsController, need to careful for using relative

        if (designService.isNone() ||toolsScope.groupError==true||toolsScope.treatmentError==true||data.es==0||!data.es||!data.pow||!data.samplesize||!data.sig||!data.groups){
            console.log("ERROR: invalid input value")
            $scope.save_status = 2
            $timeout(function(){$scope.save_status = 0}, 3000);
        } else {
            $http({
                method: 'POST',
                url: '/saveUserData',
                headers: {'Content-Type': 'application/json'},
                data: data
            }).then(function successCallback(response) {

                var currentSelectedProject = authService.sqlprojects.selected;
                authService.getProjects().then(function(){
                    updateCurrentSelectedProject( currentSelectedProject );
               });
            }, function errorCallback(response) {
                console.log( 'saveUserData error');console.log(response);
            });
        }
    };
    
    $scope.hideSave = function(selectedID)
    {
        var tmp = false;
        if( $state.current.name == 'tools.powersize' || $state.current.name == 'tools.samplesize')
        {
            $scope.userWarn = "Select a project to save to FIRST. Saving will overwrite previously saved data in the selected project.";
            $scope.userInfo = "To create or rename your project goto USER PROJECTS under REPORTS or My Account.";
            tmp = (selectedID==10);
        }
        else if( $state.current.name == 'tools.pwrgraph')
        {
            $scope.userWarn = "A new plot will be saved called 'Power Plot'.";
            tmp = (selectedID==10);
        }
        else if( $state.current.name == 'tools.sims')
        {
            $scope.userWarn = "A new plot will be saved called 'Sim Plot'.";
            tmp = (selectedID==10);
        }
        else if( $state.current.name == 'tools.rng')
        {
            tmp = true;
        }
        return tmp;
    };
    
    // this currently saves multiple plots
    function savePlots()
    {
        //var svgElements = document.getElementsByTagName("svg");
        
        var nvd3Elements = document.getElementsByTagName("nvd3");

        var dataURI = new Array(nvd3Elements.length);
        var options = {scale: 0.75, canvg:window.canvg};       // change size of second plot (simulations)
        
        var getUriData =  function(index) {
            var def = $q.defer();
            
            //var svgCanvas = svgElements[index];
            var svgCanvas = nvd3Elements[index].getElementsByTagName("svg")[0];
            
            svgAsPngUri(svgCanvas, options, function(uri2) {
                dataURI[index] = uri2;
                def.resolve();
            });
            return def.promise;
        };
        
        var promiseVector = [];
        for(var ii=0; ii<dataURI.length; ii++){
            promiseVector.push( getUriData(ii) );
        }
        
        $q.all(promiseVector).then(function(values){
            var plotname = '';
            
            if( $state.current.name == 'tools.pwrgraph')
                plotname = "Power Plot";
            else if( $state.current.name == 'tools.sims')
                plotname = "Simulation Plot";
            else
                plotname = "Data Analysis";
            
            plotname += " for " + designService.stat.selectedOption.name
            // add a field to identify the plot type
            plotsService.dataIn.plotType = $state.current.name;
            
            var data = {user_id: authService.user_id, 
                        tool: "graph",
                        project: authService.sqlprojects.selected.name,
                        data: {data:plotsService.dataIn, img: dataURI},
                        plotname: plotname};
                        
            $http({
                method: 'POST',
                url: '/saveUserData',
                data: data,
                headers: {'Content-Type': 'application/json'},
            }).then(function successCallback(response) {
                var currentSelectedProject = authService.sqlprojects.selected;
                authService.getProjects().then(function(){
                    updateCurrentSelectedProject( currentSelectedProject );
               });                
            }, function errorCallback(response) {
                console.log("error")
            });
        });
    };
    
};
