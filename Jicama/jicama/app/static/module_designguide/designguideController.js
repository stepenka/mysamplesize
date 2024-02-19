
app.controller('designguideController', [
    '$scope', '$http', '$state', 'designService', 'calculatorService', '$anchorScroll',
    '$location', '$q', '$uibModal', '$timeout', '$rootScope', 'authService', 
function designguideController($scope, $http, $state, designService, calculatorService, $anchorScroll,
        $location, $q, $uibModal, $timeout, $rootScope, authService)
{
    $scope.design = designService;
    
    // For display purposes
    $scope.designReport     = '/static/partials/webpage_reports/report.design.html';
    $scope.quiztableinfo    = '/static/partials/webpage_design/guide/quiz.table_info.html';
    $scope.quiztablegroups  = '/static/partials/webpage_design/guide/quiz.table_groups.html';
    $scope.quizrepmeasps    = '/static/partials/webpage_design/guide/quiz.repMeasures_parallelSingle.html';
    $scope.quizrepmeascs    = '/static/partials/webpage_design/guide/quiz.repMeasures_crossoverSingle.html';
    $scope.quizrepmeases    = 'static/partials/webpage_tools/repMeasuresES.html';

    $scope.inProgress = false;      // for wait icon, disabled div, in loading report
    $scope.calculator = calculatorService;
    
    $scope.outputGraphs = [];
    $scope.graphsText   = [];
    
    var collapseAll = function()
    {
        var ttmp = true;
        var ftmp = false;
        if($scope.formData.step == 1)
        {
            ttmp = false;
            ftmp = true;
        }
        
        for(var ii=0; ii<$scope.tcollapse.length; ii++)
            $scope.tcollapse[ii].isCollapsed = ttmp;
        
        for(var ii=0; ii<$scope.fcollapse.length; ii++)
            $scope.fcollapse[ii].isCollapsed = ftmp;
    }
    
    $scope.swipe_class = {name: 'swipe-views swipe-views-left'};
    $scope.changeSwipeClass = function(step){        
        if( step > $scope.formData.step ){          // step down
            $scope.swipe_class.name = "swipe-views swipe-views-right";
        } else if (step < $scope.formData.step ){   // step up
            $scope.swipe_class.name = "swipe-views swipe-views-left";
        }
    };
    
    // These next functions are for the ui-tabs in the DesignGuide
    $scope.setStep = function(step){
        if( step < 0 ){
            step = 0;
            $scope.formData.step = step;
            return;
        };
        

        if( step !== 4 )
            $scope.tools.showSimPlots = false;
        
        $scope.formData.step = step;
        collapseAll();
        $scope.processForm();
        
        // scroll to the top of the design guide on page change
        $location.hash('scrollArea'); //Sets css class for anchorScoll to scroll to
        $anchorScroll.yOffset = 200;
        $anchorScroll();
        $location.hash('');
        
        // Remove tourCreated tag if move to new tab
        for(var ii=0; ii<6; ii++)
        {
            if( ii == step )
                continue;
            
            designService.tourCreated[step] = 0;
        }
    }

    $scope.simPlotExists = null;
    $scope.simPlotFcn = null;
    $scope.DG_register = function(simPlotExists, callPythonToPlot )
    {
        $scope.simPlotExists = simPlotExists;
        $scope.simPlotFcn = callPythonToPlot;
    };
    
    var svgOptions = {canvg:window.canvg};
    $scope.reportProgress = {item: 0, total: 4};
    function createURIs(n,def) {
        var deferred = def || $q.defer();
        $scope.reportProgress.item = n - $scope.reportProgress.total;
        
        if( n == 0 ){
            deferred.resolve(true);
            return deferred.promise;
        }
    
        $scope.simPlotFcn().then( function() {
            var allSvgElements = document.getElementsByTagName("nvd3");
            
            var URI2 = new Array(allSvgElements.length);
            
            var getUriData =  function(index) {
                var def2 = $q.defer();
                svgAsPngUri(allSvgElements[index].children[0], svgOptions, function(uri2) {
                    URI2[index] = uri2;
                    def2.resolve();
                });
                return def2.promise;
            };
            
            var promiseVector = [];
            for(var ii=1; ii<URI2.length; ii++){        // start indexing from 1 to ignore power plot
                promiseVector.push( getUriData(ii) );
            }
            
            $q.all(promiseVector).then(function(values){
                for(var ii=1; ii<URI2.length; ii++){
                    $scope.outputGraphs.push( URI2[ii] );
                    $scope.graphsText.push( designService.graphsText );
                }
                createURIs(n-1, deferred);
            });
        });
        
        return deferred.promise;
    };
    
    $scope.loadDataModal = function() {
        var openModal = $uibModal.open({
            templateUrl: mpath+'design.loadData.html',
            size: 'lg',
            scope: $scope,
            controller: 'ModalInstanceCtrl',
        });
    };
    
    $scope.saveDataModal = function() {
        // before we save the data, let's process the form
        $scope.processForm();
        
        var openModal = $uibModal.open({
            templateUrl: mpath+'design.saveData.html',
            size: 'lg',
            scope: $scope,
            controller: 'ModalInstanceCtrl',
        });
    };
    
    $scope.stepUp = function(){
        sendDataToServer();   // added this to update the tools part before the report is made

        if( $scope.formData.step == 4 )  // if currently on plots page, get plots
        {
            $scope.outputGraphs = [];
            $scope.graphsText = [];
            
            // If repeated measures, then we don't have any graphs
            if( $scope.formData.repMeas.checked )
            {
                sendDataToServer();
                $scope.setStep( $scope.formData.step + 1 );
                return;
            }
            
            // This is the modal for when the report is being generated -- 
            var processModalInstance = $uibModal.open({
                templateUrl: mpath+'design.processForm.html',
                size: 'md',
                scope: $scope,
                backdrop: 'static',
                keyboard: false,
            });
            
            var nURIS = 3;
            $scope.reportProgress.total = nURIS+1;
            
            // if not T-Test or 1-Way ANOVA, do not get sim plots (they don't exist yet)
            if( !$scope.simPlotExists() )
            {
                nURIS = 0;
            }
            
            $scope.inProgress = true;
            
            var svgElements = document.getElementsByTagName("nvd3")[0];
            
            // create as many Sim Plots as you want. Number of plots is the input argument.
            createURIs(nURIS).then( function success(){
                svgAsPngUri(svgElements.children[0], svgOptions, function(uri1) {
                    $scope.outputGraphs.push( uri1 );
                    $scope.graphsText.push( '' );   // it's already titled "Power Plot". Put additional info here if needed.
                    
                    //console.log( $scope.outputGraphs );
                    processModalInstance.close();
                    $scope.setStep($scope.formData.step+1);
                })
            }, function error() {
                console.log('uri error');
            }, function notify() {
                console.log( 'notify');
            });
        }
        else if( $scope.formData.step == 5 ) {
            // do nothing for setting step greater than # of pages
            return;
        } else {
            $scope.setStep($scope.formData.step+1);
        }
        
        $scope.inProgress = false;
    }
    $scope.stepDown = function(){
        $scope.setStep($scope.formData.step-1);
    }
   
    // =============================================================================
    // VARIABLES
    // =============================================================================

    // "thisTreatment" input will be either formData.treatments or formData.factors 
    $scope.levelUp = function (thisTreatment)
    {
        var nLevels = thisTreatment.level.length;
        nLevels = nLevels + 1;
        var newLevel = {id: nLevels, name: null};
        thisTreatment.level.push( newLevel );
        $scope.processForm();
    }
    $scope.levelDown = function (thisTreatment)
    {
        var nLevels = thisTreatment.level.length;
        
        if( nLevels == 1 )
            return;
        
        nLevels = nLevels - 1;
        thisTreatment.level.splice(nLevels, 1);
        $scope.processForm();
    }
    
    $scope.controlTypes2 =
    [
        {name: "Negative",      id: 6},
        {name: "Positive",      id: 1},
        {name: "Comparative",   id: 3},
        {name: "Sham",          id: 2},
        {name: "Vehicle",       id: 0},
        {name: "Naive",         id: 4},
        {name: "Wild Type",     id: 5}
        
    ];
    $scope.tcollapse = [{isCollapsed: false, nLevels: 1}];
    $scope.fcollapse = [{isCollapsed: false, nLevels: 1}];
    
    designService.formData.treatments[0].control = $scope.controlTypes2[0];
    $scope.formData                              = designService.formData;
    $scope.formData.pilotStudy                   = 0;
    $scope.formData.step                         = 0;   // initialize current step
    calculatorService.data.esComb                = {index: [], effect: [5]};
    
    $scope.$watchGroup(['calculator.RMPS1.esMultiple', 'formData.step'], function(){
        if( $scope.formData.step==3 && $scope.formData.repMeas.checked ){
            if( calculatorService.RMPS1.esMultiple ){
                // manually change to repeated measures so that calculatorService can process correctly
                designService.change(11, 11+$scope.formData.repMeas.opt-1);
                calculatorService.resetDG();
            }
        }
    });
    
    $scope.groupsMax = 3;    // this should probably be dynamic, from loaded JSON file in designService
    
    // *************************************
    // Function to list treatment table
    $scope.makeTreatmentTable = function()
    {
        var treatments  = $scope.formData.treatments;
        var factors     = $scope.formData.factors;
        var myArgs      = new Array(treatments.length + factors.length);
        
        //******************************************
        // setting up strings for display
        // TREATMENTS
        for(var ii=0; ii<treatments.length; ii++)
        {
            var nLevels = treatments[ii].level.length;   //includes control
            myArgs[ii]  = new Array(nLevels);
            
            var tmt = treatments[ii].description;
            if(( tmt == null ) || (tmt == undefined))
                tmt = "Treatment " + (ii+1);
            
            for(var jj=0; jj<nLevels; jj++)
            {
                var lvl = treatments[ii].level[jj].name;
                if( (lvl == null) || (lvl == undefined) )
                    lvl = "Level " + (jj+1);
                
                myArgs[ii][jj] = "(" + tmt + ": " + lvl + ")";
            }
            var cDesc = treatments[ii].control_desc;
            if(( cDesc == null ) || ( cDesc == undefined ))
                cDesc = "Control ";
            myArgs[ii][nLevels] = "(" + cDesc + ": " + treatments[ii].control.name + " control)";
        }
        
        // FACTORS
        for(var ii=0; ii<factors.length; ii++)
        {
            var nLevels = factors[ii].level.length;   //includes control
            myArgs[ii+treatments.length]  = new Array(nLevels);
            
            var tmt = factors[ii].description;
            if(( tmt == null ) || (tmt == undefined))
                tmt = "Factor " + (ii+1);
            
            for(var jj=0; jj<nLevels; jj++)
            {
                var lvl = factors[ii].level[jj].name;
                if( (lvl == null) || (lvl == undefined) )
                    lvl = "Level " + (jj+1);
                
                myArgs[ii+treatments.length][jj] = "(" + tmt + ": " + lvl + ")";
            }
        }

        //******************************************
        // creating string combination
        var r = [];
        function helper(arr, i) {
            for (var j=0, l=myArgs[i].length; j<l; j++) {
                var a = arr.slice(0); // clone arr
                a.push(myArgs[i][j]);
                if (i==myArgs.length-1)
                    r.push(a);
                else
                    helper(a, i+1);
            }
        }
        
        if( myArgs.length )    // not empty
            helper([], 0);

        //******************************************
        // concatenating string combos for display
        for(var ii=0; ii<r.length; ii++)
        {
            var tmp = r[ii][0];
            for(var jj=1; jj<r[ii].length; jj++)
                tmp = tmp + " + " + r[ii][jj];
            r[ii] = tmp;
        }
        
        var selected = true;
        var treatment_table = [{'group': r[0], 'selected': selected}];
        for(var ii=1; ii<r.length; ii++)
        {
            var combo_str = r[ii];
            treatment_table.push( {'group': combo_str, 'selected': selected} )
        }
        
        // if the treatment table has already been created, compare the strings to the new table
        // if equal, change the new 'selected' option to the current/old 'selected' option
        // this preserves the checkboxes
        if( $scope.treatment_table != null )
        {
            for(var ii=0; ii<r.length; ii++) {
                for(var jj=0; jj<$scope.treatment_table.length; jj++) {
                    if( $scope.treatment_table[jj].group === r[ii] )
                    {
                        // change the 'selected' option if the strings are equal
                        treatment_table[ii].selected = $scope.treatment_table[jj].selected;
                        break;
                    }
                }
            }
        }
        
        $scope.treatment_table          = treatment_table;
        designService.numGroups         = $scope.treatment_table.length;
        designService.treatment_table   = $scope.treatment_table;
        designService.formData          = $scope.formData;
        
        return;
    }
    // *************************************
    
    // =============================================================================
    // ADD/REMOVE ROW TO TABLE
    // =============================================================================
    $scope.addRow = function(objStr)    // input is either 'treatments' or 'factors'
    {
        // set defaults
        var myArray = $scope.formData[objStr];
        var newRow   = {'level': [{id:1, name: null}], 'description': null};
        
        //if(( myArray.length != 0 ) && ('control' in myArray[0] ))
        if( objStr === 'treatments' )
        {
            newRow.control      = $scope.controlTypes2[0];
            newRow.control_desc = null;
            $scope.tcollapse.push( {isCollapsed: false} );
        } else {
            // For non-treatment factors, add a row with 2 levels
            newRow   = {'level': [{id:1, name: null}, {id:2, name: null}], 'description': null};
            $scope.fcollapse.push( {isCollapsed: false} );
        }
        
        myArray.push( newRow );
        $scope.processForm();
    };
    
    $scope.removeRow = function(objStr, index) {
        var myArray = $scope.formData[objStr];
        
        // make it so we cannot remove row of one treatment
        if( objStr === 'treatments' && myArray.length==1){
            return;
        };
        
        myArray.splice(index, 1);

        if( objStr === 'treatments' ){
            $scope.tcollapse.splice(index, 1);
        } else {
            $scope.fcollapse.splice(index, 1);
        }
        
        $scope.processForm();
    };

    // =============================================================================
    // FORM SUBMIT FUNCTION
    // =============================================================================
    $scope.processForm = function()
    {
        designService.formData = $scope.formData;
        
        // Make the table to ensure formData is updated for use in Tools Calculators
        $scope.makeTreatmentTable()

        // On button click, process the form.
        
        // If navigated to last step, mark as completed.
        //if( $scope.formData.step === 6)
        {
            designService.DGcompleted = true;
        }
        
        designService.change(-1, -1);
        
        var formData = $scope.formData;
        var Tlength = formData.treatments.length;
        var Flength = 0;
        var TandFlength = Tlength;
        
        if(formData.factors!='undefined'){
            Flength = formData.factors.length;
            TandFlength = Tlength + Flength;
        }
        
        if( formData.repMeas.checked )
        {
            designService.change(11, 11+formData.repMeas.opt-1);
            
            sendDataToServer();
            return;
        }
        
        if( (formData.covariates.length == 0) )
        {
            if( TandFlength == 1 ){             // Simple randomized, 1-way ANOVA
                designService.change(0, 1);
            } else if ( TandFlength == 2 ){     // 2-Way ANOVA
                designService.change(0, 7);
            } else if ( TandFlength >= 3 ){     // Full factorial, multi-way ANOVA
                designService.change(6, 2);
            }
            
            sendDataToServer();
            return;
        }
        else if( formData.factors.length !== 0)
        {
            // Covariates but not factors
            //
            // Randomized block, multi-way ANOVA
            designService.change(1, 2);
        }
        else
        {
            // GLM
            designService.change(-1, 0);
        }
        sendDataToServer();
        return;
    };

    $scope.$watch('calculator.calcData', function(){
        //console.log( $scope.calculator.calcData );
        //updateDesignReport();
    });
    
    function sendDataToServer(){
        return updateDesignReport();
    };
    
    //  Make the pdf (send to Python)
    function updateDesignReport()
    {
        $scope.makeTreatmentTable();
        
        var data = $scope.formData;
        data.user_id         = authService.user_id;
        data.treatment_table = $scope.treatment_table.slice();      // create a copy
        data.designType      = designService.designType;
        data.statMethod      = designService.statMethod;
        data.outputGraphs    = $scope.outputGraphs;
        data.graphsText      = $scope.graphsText;
        
        //calculatorService.resetDG();    // fill in calc data with DG data
        
        data.tools           = calculatorService.calcData;
		        
        designService.count_addl_controls();
        
        designService.reportData = data;
        
        /*
        for(var ii=0; ii<data.controlTypes.length; ii++)
        {
            var ct = data.controlTypes[ii];
            if( ct.selected )
            {
                $scope.nControlAdditionalSelected ++;
                data.treatment_table.push( {'group': 'Additional control: ' + ct.name, 'selected': ct.selected} )
            }
        }//*/
        
        // nTotalGroups for repeated measures -- # of treatments, # of factors, # of additional controls
        $scope.nTotalGroups = $scope.formData.treatments.length + $scope.formData.factors.length + $scope.formData.nControlAdditionalSelected;
        
		//console.log( data );
		
        $http({
            method: 'POST',
            url: '/update_design_summary',
            headers: {'Content-Type': 'application/json'},
            data: data
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            
            if( response.data.error ){
                console.log( response.data.msg )
            }
            
            $scope.pdf_url  = response.data.pdf
            $scope.html_url = response.data.html
            
            $rootScope.design_report_url = $rootScope.trustSrc('/design_report' + get_rand_string());

        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    
    var get_rand_string  = function ()
    {
        var currentDate  = new Date();
        var rand_string  = currentDate.getDate() + '' + currentDate.getMonth() + '' + 
                            currentDate.getFullYear() + '' + currentDate.getHours() + '' + 
                            currentDate.getMinutes() + '' + currentDate.getSeconds();
        rand_string      = '&v=' + rand_string;
        
        rand_string = '?user_id=' + authService.user_id + rand_string;
        return rand_string;
    };
    
    $scope.tools = {
        type: "samplesize",
        showSimPlots: false
    };

    // watch DG service form data (may change via "Load Project") and update scope accordingly
    $scope.$watch('design.formData', function(nv,ov){
        if( nv !== ov ){
            $scope.formData = $scope.design.formData;
            $state.go("design_guide");
            $scope.setStep(0);
        }
    });
    
    $scope.fillForm = function()
    {
        var dat = $scope;
        // Set designService params to be consistent with case study 1
        $scope.treatment_table = null;
        $scope.formData.hypothesis = "Pharmacological activation of Group II metabotropic glutamate receptors with compound DCG-IV will reduce neuronal cell degeneration measured at 24 hours after experimental TBI in rats."
//        $scope.formData.expUnits = "rats";
        $scope.formData.outMeas  = "degenerating cells";
        $scope.formData.obsUnits = "number of cells";
        $scope.formData.effectSize = 60;
        $scope.formData.effectSizeLarge = 140;
        $scope.formData.stdev = "125";
        $scope.formData.treatments = [{
            level: [
                {id: 1, name: "20 fmol DCG-IV"},
                {id: 2, name: "100 fmol DCG-IV"},
                {id: 3, name: "500 fmol DCG-IV"},
            ],
            description: "drug",
            control: {name: "Vehicle", id: 0},
            control_desc: "Artificial CSF"
        }];
        $scope.formData.factors = [];
        
        $state.go("design_guide");
        $scope.setStep(0);
    };
    
    // Walkthrough
    $scope.tourCreated = [0, 0, 0, 0, 0, 0];
}

]);