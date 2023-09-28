'use strict';

app.controller('helpEffectController', ['$scope', '$location', '$anchorScroll', '$timeout', '$state',
function ($scope, $location, $anchorScroll, $timeout, $state)
{
    $scope.cohenF = [
        {
            fval: 1.0,
            stdev: 0.05,
            nLevels: 2,
            effectSize: 0,
            calc: function(){
                var tmp = $scope.cohenF[0];
                var nLevels = 1.0 * tmp.nLevels;    // ensure float
                tmp.effectSize = tmp.stdev * tmp.fval * Math.sqrt(nLevels / (nLevels-1));
            }
        },
        {
            fval: 1.0,
            stdev: 0.05,
            nLevels: [2,2],
            effectSize: 0,
            calc: function(){
                var tmp = $scope.cohenF[1];
                var nLevels = tmp.nLevels;
                var fac = Math.sqrt( (nLevels[0]*nLevels[1]) / ((nLevels[0]-1)*(nLevels[1]-1)) );
                tmp.effectSize = tmp.stdev * tmp.fval * fac;
            }
        },
        {
            fval: 1.0,
            stdev: 0.05,
            nLevels: [2,2,2],
            effectSize: 0,
            calc: function(){
                var tmp = $scope.cohenF[2];
                var nLevels = tmp.nLevels;
                var fac = Math.sqrt( (nLevels[0]*nLevels[1]*nLevels[2]) / ((nLevels[0]-1)*(nLevels[1]-1)*(nLevels[2]-1)) );
                tmp.effectSize = tmp.stdev * tmp.fval * fac;
            }
        },
    ];
    
    $scope.cohenD = {
        dval: 1.0,
        stdev: 0.1,
        effectSize: 10
    };

    $scope.cohenD_calc = function(){
        $scope.cohenD.effectSize = $scope.cohenD.dval * $scope.cohenD.stdev;
    };
    
    function ctlInit() {
        $scope.cohenD_calc();
        
        for(var ii=0; ii<$scope.cohenF.length; ii++){
            $scope.cohenF[ii].calc();
        }
    };
    ctlInit();
}]);


// This controller is not used anywhere...
app.controller('helpToolsController', ['$scope', '$location', '$anchorScroll', '$timeout', '$state', 'calculatorService',
function ($scope, $location, $anchorScroll, $timeout, $state, calculatorService)
{
    $scope.calculator = calculatorService;
    
    $scope.datum = {
        esMeanAOV: [ 
            {group: 1, mean: 20, placeholder: 12.5},
            {group: 2, mean: 10, placeholder: 12.5},
            ],
    };

    function roundToFixed( varname )
    {
        var fixedDigits = 3;
        return varname.toFixed( fixedDigits );
    };
    
// T-Test ES
    $scope.TtestMean1 = 10;
    $scope.TtestMean2 = 20;
    $scope.TtestEffectCalc =function(m1,m2){
        $scope.calculator.data.esMean = roundToFixed( Math.abs(m1-m2) );
    };
// T-test Common Standard Deviation
    $scope.TtestSD1 = 5;
    $scope.TtestSD2 = 5;
    $scope.TtestSDCalc =function(sd1,sd2){
        var num = Math.pow(sd1,2)+Math.pow(sd2,2);
        $scope.calculator.data.esSD = roundToFixed( Math.sqrt(num / 2) );
    };
// Calculations for ANOVAs common Standard Deviation sigma^2
    $scope.AovSDCalc = function(){
        var numer = 0;
        for (var i=0; i<$scope.calculator.data.groups; i++){
            var working = $scope.calculator.sdAOV[i].df * $scope.calculator.sdAOV[i].s2;
            var numer = numer + working;
        }
        var denom = $scope.calculator.data.samplesize - $scope.calculator.data.groups;
        $scope.calculator.data.esSD_AOV_TEMP = roundToFixed( numer / denom );
    };
    $scope.AovSDCalc_change = function() { //Keeps Common SD from changing unless modal is used specifically
        $scope.calculator.data.esSD_AOV = roundToFixed( $scope.calculator.data.esSD_AOV_TEMP );
    };
// Calculation for ANOVAs Effect Size from highest and lowest mean
    $scope.effectAOV_lowMean = 10;
    $scope.effectAOV_highMean = 20;
    $scope.AOVmeanHighLow =function(){
        var diff = $scope.effectAOV_highMean - $scope.effectAOV_lowMean;
        var numer = (1/$scope.calculator.data.groups)*Math.pow(diff,2);
        var denom = 2*Math.pow($scope.calculator.data.esSD_AOV,2);
        var ans = Math.sqrt(numer/denom);
        $scope.calculator.data.esRel = roundToFixed( ans );
        $scope.calculator.data.esTest='effectRel';
    };
//  Calculation for SLM R2 value
    $scope.SSres = 10;
    $scope.SStot = 20;
    $scope.R2calc = function(){
        $scope.calculator.data.esR2 = roundToFixed( 1 - ($scope.SSres / $scope.SStot) );
    };
        
//Calculate Rows for Treatments and Groups
    function updateGroups()
    {
        var nGroups_old = $scope.datum.esMeanAOV.length;
        var nGroups_new = $scope.calculator.data.groups;
        var change = nGroups_new - nGroups_old;
        if (change > 0){
            for (var i=nGroups_old; i<nGroups_new; i++){  
                var newGroup = {group: i+1, mean: 10, placeholder: null};
                $scope.datum.esMeanAOV.push( newGroup );
                var newGroup2 = {group: i+1, df: 6, s2: 20};
                $scope.calculator.sdAOV.push( newGroup2 );
            }
        } else if (change < 0){
            if( nGroups_old == 2 ){
                return;
            } else if(nGroups_old - change < 2){
                return;
            } else {
                $scope.datum.esMeanAOV.splice(nGroups_new, Math.abs(change));
                $scope.calculator.sdAOV.splice(nGroups_new, Math.abs(change)); 
            }
        }
        
        //$scope.AovSDCalc();
        var numer = 0;
        for (var i=0; i<$scope.calculator.data.groups; i++){
            var working = $scope.calculator.sdAOV[i].df * $scope.calculator.sdAOV[i].s2;
            var numer = numer + working;
        }
        var denom = $scope.calculator.data.samplesize - $scope.calculator.data.groups;
        $scope.calculator.data.esSD_AOV_TEMP = roundToFixed( numer / denom );
    };
    //*
    $scope.$watch('calculator.data.groups', function (newVal, oldVal)
    {
        updateGroups();
    });
    
}]);
