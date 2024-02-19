
app.controller('simPlotCtrl', ['$scope', '$http', '$q', 'designService', 'calculatorService', 'plotsService', '$timeout', '$interval', '$state',
function($scope, $http, $q, designService, calculatorService, plotsService, $timeout, $interval, $state)
{
    function isAnalysisPage() { return $state.current.name == 'tools.analysis'; };
    
    $scope.dataBlob = function(txt){
        $scope.data.dataIn = txt;
    };
    
    $scope.chartConfig = {
        refreshDataOnly: false,
        deepWatchData: true
    };
    
    // this sometimes triggers an infinite change cycle when going from sims to analysis page?
    $scope.$watch('data.dataIn', function(nv,ov){
        //console.log('watching datain', angular.equals(ov,nv), nv===ov, nv!==ov);
        if( isAnalysisPage() && (nv !== ov) ){            
            //console.log('updating simplot in datain watcher. count:');
            $scope.updateSimPlot();
        }
    });
    
    //$scope.simRefresh={};
    //$scope.boxPlotRefresh={};
    
    $scope.simForm = false;
    
    $scope.checkValid = function(simForm, keyName){
        $scope.simForm = simForm;
        
        if( keyName ){
            var inp = simForm[keyName];
            return inp.$valid;
        }
    };
    
    $scope.simPlotExists = function() {
        return (designService.isANOVA1() || designService.isTTest2() || designService.isANOVA2() || (designService.isANOVAm() && $scope.data.nLevels3.length==3));
    };
    
    function computeUsingDG() {
        return !designService.notEmbedded;
    };
    
    function exampleData() {
        var plotData = [];
        for(var jj=0; jj<3; jj++){
            var tmp = [];
            for(var ii=0; ii<10; ii++){
                var yVal = 10*Math.random();
                
                tmp.push({x:ii, y:yVal, low: 0.9*yVal, high:1.1*yVal} );
            }
            plotData.push({key: 'Main Factor, Level ' + (jj+1), values: tmp});
        };
      return plotData;
    };
    
    $scope.render = {
        data: null
    };
    function initRenderData() {
        $scope.render.data = [];
    };
    initRenderData();
    function addRenderData() {
        $scope.render.data.push( false );
        return $scope.render.data.length-1;
    };
    function makeRenderEndEvent(par, ndx) {
        par.chart.dispatch = {
            renderEnd: function(e){
                $scope.render.data[ndx] = true;
            }
        };
    };
    
    function makeBoxPlotOptions() {
        var opts = {
            processing: true,
            chart: {
                type: 'boxPlotGroupedChart',
                height: 450,
                duration: 0,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 45,
                    left: 45
                },
                
                //x: function(d){return d.label;},
                x: function(d){return d.group;},
                showControls: false,
                maxBoxWidth: 75,
                legend: {
                    updateState: false,   // disable on-off click of legend
                },
            }
        };
        return opts;
    };
    
    function makeMultiBarOptions() {
        var opts = {
            processing: true,
            chart: {
                type: 'multiBarChart',
                height: 450,
                duration: 0,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 45,
                    left: 45
                },
                wrapLabels: true,
                showControls: false,
                groupSpacing: 0.5,
                legend: {
                    updateState: false,   // disable on-off click of legend
                },
                legendPosition: 'right',
                
                clipEdge: true,
                stacked: false,
                yDomain: [-1,11],
                
                /*
                tooltip: {
                    contentGenerator: function(info) {
                        var data        = info.data;
                        var key         = data.key;
                        var secFactor   = info.index + 1;
                        var barL        = Number.parseFloat(data.low).toFixed(3);
                        var barH        = Number.parseFloat(data.high).toFixed(3);
                        
                        var titleInfo   =  key + ', Secondary Group ' + secFactor;
                        titleInfo += '<br> Error bar: [' + barL + ', ' + barH + ']';
                        return titleInfo;
                    }
                }, //*/
                
                xAxis: {
                    axisLabel: 'Secondary Factor',
                    showMaxMin: false,
                    tickFormat: function(d){
                        return d3.format(',f')(d);
                    }
                },
            }
        };
        return opts;
    };
    
    $scope.multiBar = {
        options: makeMultiBarOptions(),
        data: exampleData()
    };
    
    $scope.boxPlots = {
        options: makeBoxPlotOptions(),
        data: null,
    };
    
    function initData() {
        $scope.data = {
            mu: 5,
            sig: 0.05,
            effectSize: 1,
            std: 1,
            n: 10,
            p: 2,
            iType: "linear",
            powerVal: 0.8,
            pVal: null,
            id: 8,
            dataIn: null,
            
            // stuff for 2-way anova
            nLevels: [2,2],
            nLevels3: [2,2,2]
        };
    };
    initData();
    
    $scope.response = {
        shape: {},
        options: [
            {label: "Increasing", value: "linearUp"},
            {label: "Decreasing", value: "linearDown"},
            //{label: "Linear", value: "linear"},
            {label: "U-shape", value: "regU"},
            {label: "Inverted U-shape", value: "invertedU"}
        ]
    };
    
    $scope.response2 = {
        shape: {},
        options: [
            {label: "Cooperative", value: "coop"},
            {label: "Opposing", value: "oppo"}
        ]
    };
    $scope.response.shape = $scope.response.options[0];
    $scope.response2.shape = $scope.response2.options[0];
    
    $scope.anova = {
        response : [$scope.response.options[0], $scope.response.options[0], $scope.response2.options[0]],
    };
    
    var graphConstants = {
        xrange : [0, 100],
        x      : [30, 55],  // x-locations for bars (not constant, changes with ANOVAs)
        errorW : 4,
        barWidth : 10
    };
    
    $scope.myOptions = makeOptions();

    function makeOptions(){
        var myOptions = {
            processing: true,
            chart: {
                type: 'multiChart',
                wrapLabels: true,
                duration: 0,
                height: 475,
                margin : {
                    top: 30,
                    right: 60,
                    bottom: 75,
                    left: 70
                },
                legend : {
                    maxKeyLength: 100,
                    updateState: false,
                    //align: false,
                },
                //useInteractiveGuideline: false,
                yDomain1: [0, 100],
                xAxis: {
                    tickFormat: function(d){ return null; }
                },
                yAxis1: {
                    axisLabel: '',
                    tickFormat: function(d){
                        return d3.format(',.0f')(d);
                    }
                },
            }
        };
        return myOptions;
    };
    
    function makeErrorBar(xMid, yLow, yHigh, label)
    {
        var tmp       = graphConstants.errorW/2.0;
        var xLow      = xMid - tmp;
        var xHigh     = xMid + tmp;
        var C         = "black";
        var W         = 2;
        
        var errorData = [{type:"line", yAxis:1, key:label, strokeWidth:W, color:C, showLegend: false, 
            values:[{x: xLow,  y:yHigh}, 
                    {x: xHigh, y:yHigh}, 
                    {x: xHigh, y:null}, 
                    {x: xLow,  y:yLow}, 
                    {x: xHigh, y:yLow}, 
                    {x: xMid,  y:yLow}, 
                    {x: xMid,  y:yHigh}]
        }];

        return errorData;
    };
    
    function adjustBarSpacing()
    {
        var barW  = graphConstants.barWidth/2.0;
        var nBars = $scope.data.p;
        var tmp1  = graphConstants.xrange[1] / (nBars + 2);
        
        $scope.myOptions.chart.xAxis.tickValues = Array(nBars);
        graphConstants.x = Array(nBars);
        for(var ii=0; ii<nBars; ii++)
        {
            graphConstants.x[ii] = tmp1*(ii+1) + (ii+1)*barW;
            $scope.myOptions.chart.xAxis.tickValues[ii] = graphConstants.x[ii];
        }
        
        // Something needs to be fixed with this function -- x-axis labeling doesn't work as expected for more than 3 groups
        $scope.myOptions.chart.xAxis.tickFormat = function(d)
        {
            return appendTickLabels(d);
        };
    };

    
    function appendTickLabels(d) {
        for(var ii=0; ii<graphConstants.x.length; ii++)
        {
            //return d3.format(',.0f')(d);
            var dist = Math.abs(d - graphConstants.x[ii]);
            if( dist <= 0.1 )
            {
                var xTickStr = "Group " + (ii+1);
                return xTickStr;
                
                if( designService.DGcompleted && !HELP_PAGE_FLAG)
                {
                    var tmp = designService.formData.treatment_table[ii];
                    xTickStr += tmp.group;
                }
                return xTickStr;
            }
        }
        return null;
    };
    
    function makeBars(y)
    {
        var barW  = graphConstants.barWidth/2.0;
        var barsT = {type: "line", yAxis: 1, color:"#7E7E7E", area:true, key: "Bars", showLegend: false, values: []};
        var nBars = $scope.data.p;
        
        for(var ii=0; ii<nBars; ii++)
        {
            var xL = graphConstants.x[ii] - barW;
            var xH = graphConstants.x[ii] + barW;
            
            barsT.values = barsT.values.concat( {x:xL-1, y:null}, {x:xL, y:y[ii]}, {x:xH, y:y[ii]}, {x:xH+1, y:null} )
        }
        
        return barsT;
    };
    
    function gen_rand_color()
    {
        var componentToHex = function(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        var rgbToHex = function(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }
        var getRandomInt = function(min, max) {
          min = Math.ceil(min);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
        }
        return rgbToHex(getRandomInt(10,200), getRandomInt(100,200), getRandomInt(150,200));
    };
    
    function makePopLevels(levels)
    {
        var lines    = [];
        var XL       = graphConstants.xrange[0];
        var XU       = graphConstants.xrange[1];

        for(var ii=0; ii<levels.length; ii++)
        {
            var label = "Group " + (ii+1) + " Population Level";
            var tColor = gen_rand_color();
            
            lines.push( {type: "line", color:tColor, yAxis:1, key: label,  values: [{x:XL, y:levels[ii]}, {x:XU, y:levels[ii]}]} );
        }
        
        return lines;
    };
    
    function make_rand_data() {
        var data = {
            x: null, y: null,
            myStats: {delta: [5,6], xbar:[45,70], errBarL: [55,80], errBarU: [60,85],
                quantiles: [0,1,2,3,4,5]}
        };
        data.x = new Array(10);
        for(var ii=0; ii<$scope.data.p; ii++)
        {
            for(var jj=0; jj<$scope.data.n; jj++)
            {
                var ndx = jj + ii*$scope.data.n;
                var max = 80, min = 50;
                data.x[ndx] = Math.random() * (max - min) + min;
            }
        }
        return data;
    };
    function make3WaySimData(data)
    {
        if( !data ){    // random data to setup
            data = make_rand_data();
        } else {
            $scope.data.nLevels3 = data.myStats.nLevels;
        }
        
        if( isAnalysisPage() ){
            $scope.data.n = data.myStats.n;
            var nSubCopy = [];
            for(var ii=0; ii<$scope.data.n.length; ii++)
                for(var jj=0; jj<$scope.data.n[ii].length; jj++)
                    for(var kk=0; kk<$scope.data.n[ii][jj].length; kk++)
                        nSubCopy.push( $scope.data.n[ii][jj][kk] );
            $scope.data.n = nSubCopy;
        }
        
        var nBars   = $scope.data.nLevels3[0];
        var nGroups = $scope.data.nLevels3[1];
        var nPlots  = $scope.data.nLevels3[2];
        
        $scope.multiBar.data       = new Array(nPlots);
        $scope.multiBar.options    = new Array(nPlots);
        
        var xBar    = data.myStats.xbar;
        var errBarL = data.myStats.errBarL;
        var errBarU = data.myStats.errBarU;
        
        $scope.boxPlots.options = []
        $scope.boxPlots.data = [];
        var qDataGlob = data.myStats.quantiles;
        
        for(var index=0; index<nPlots; index++)
        {
            $scope.multiBar.data[index] = [];
            $scope.multiBar.options[index] = makeMultiBarOptions();
            
            var rendNdx = addRenderData();
            makeRenderEndEvent($scope.multiBar.options[index], rendNdx);
            
            var yMax = -1;
            var yMin = 0;
            
            // boxplot initializations
            $scope.boxPlots.options.push( makeBoxPlotOptions() );
            $scope.boxPlots.options[index].chart.type = 'boxPlotGroupedChart';
            $scope.boxPlots.data.push([]);
            
            var rendNdx2 = addRenderData();
            makeRenderEndEvent($scope.boxPlots.options[index], rendNdx2);
            
            for(var ii=0; ii<nBars; ii++){
                var tmpData = [];
                for( var jj=0; jj<nGroups; jj++){
                    var yLow    = errBarL[ii][jj][index];
                    var yHigh   = errBarU[ii][jj][index];
                    yMax        = (yHigh > yMax) ? yHigh : yMax;
                    yMin        = (yLow < yMin) ? yLow : yMin;
                    
                    tmpData.push( {x:jj+1, y:xBar[ii][jj][index], low:yLow, high:yHigh} );
                    
                    //------------------------------------------------
                    // make boxplot
                    //------------------------------------------------
                    var qGrpFactor = qDataGlob[ii][jj][index];
                    
                    var tmpBoxData = {
                        label: 'Main Factor ' + (ii+1)  + ' ' + jj, 
                        key: 'Main Factor, Level ' + (ii+1), 
                        showLegend: (jj>0) ? false : true,
                        group: jj+1,
                        series: ii+1,
                        values: {
                            Q1: qGrpFactor[1],
                            Q2: qGrpFactor[2],
                            Q3: qGrpFactor[3],
                            whisker_low: qGrpFactor[0],
                            whisker_high: qGrpFactor[4],
                            outliers: []
                        }
                    };
                    $scope.boxPlots.data[index].push( tmpBoxData );
                }
                var keyName = 'Factor 1, Level ' + (ii+1);

                $scope.multiBar.data[index].push( {key: keyName, values:tmpData} );
            }
            
            $scope.multiBar.options[index].chart.yDomain = [yMin*1.1, yMax*1.1];
            //$scope.multiBar.options[index].title = {enable:true, text: 'Third Factor, Level ' + (index+1)};

            //$scope.boxPlots.options[index].chart.yDomain = $scope.multiBar.options[index].chart.yDomain;
            $scope.boxPlots.options[index].chart.xAxis =  {
                axisLabel: 'Secondary Factor',
            };
        }
    };
    
    function make2WaySimData(data)
    {
        $scope.multiBar.options = makeMultiBarOptions();
        
        initRenderData();
        var rendNdx0 = addRenderData();
        makeRenderEndEvent($scope.multiBar.options, rendNdx0);
        
        if( !data ) {   // random data to setup
            data = make_rand_data();
        } else {
            $scope.data.nLevels = data.myStats.nLevels;
        }
        
        if( isAnalysisPage() ){
            $scope.data.n = data.myStats.n;
            var nSubCopy = [];
            for(var ii=0; ii<$scope.data.n.length; ii++)
                for(var jj=0; jj<$scope.data.n[ii].length; jj++)
                    nSubCopy.push( $scope.data.n[ii][jj] );
            $scope.data.n = nSubCopy;
        }
        
        $scope.multiBar.data = [];
        var xBar = data.myStats.xbar;
        var yMax = -1;
        var yMin = 0;
        
        // boxplot initializations
        $scope.boxPlots.options = makeBoxPlotOptions();
        $scope.boxPlots.options.chart.type = 'boxPlotGroupedChart';
        $scope.boxPlots.data = [];
        
        var rendNdx = addRenderData();
        makeRenderEndEvent($scope.boxPlots.options, rendNdx);
        
        for(var ii=0; ii<xBar.length; ii++){
            var tmpData = [];
            
            for( var jj=0; jj<xBar[ii].length; jj++){
                var yLow    = data.myStats.errBarL[ii][jj];
                var yHigh   = data.myStats.errBarU[ii][jj];
                yMax        = (yHigh > yMax) ? yHigh : yMax;
                yMin        = (yLow < yMin) ? yLow : yMin;

                tmpData.push( {x:jj+1, y:xBar[ii][jj], low:yLow, high:yHigh} );
                
                //------------------------------------------------
                // add boxplot data
                //------------------------------------------------
                var qGrpFactor = data.myStats.quantiles[ii][jj];
                var tmpBoxData = {
                    label: 'Main Factor ' + (jj+1)  + ' ' + ii, 
                    key: 'Main Factor, Level ' + (ii+1), 
                    showLegend: (jj>0) ? false : true,
                    group: jj+1,
                    series: ii+1,
                    values: {
                        Q1: qGrpFactor[1],
                        Q2: qGrpFactor[2],
                        Q3: qGrpFactor[3],
                        whisker_low: qGrpFactor[0],
                        whisker_high: qGrpFactor[4],
                        outliers: []
                    }
                };
                $scope.boxPlots.data.push( tmpBoxData );
            }
            $scope.multiBar.data.push( {key: 'Main Factor, Level ' + (ii+1), values:tmpData} );
        }
        $scope.multiBar.options.chart.yDomain = [yMin*1.1, yMax*1.1];

        $scope.boxPlots.options.chart.xAxis =  {
            axisLabel: 'Secondary Factor',
        };
    };

    function makeSimData(data)
    {
        $scope.myOptions = makeOptions();
        
        if( !data ) { // random data to setup
            data = make_rand_data();
        } else {
            $scope.data.p = data.myStats.p;
            $scope.data.n = data.myStats.n;
        }
        
        var nSubCopy = $scope.data.n;
        
        if( !isAnalysisPage() ) {
            nSubCopy = [];
            for(var ii=0; ii<$scope.data.p; ii++)
                nSubCopy.push( $scope.data.n );
        }
        
        adjustBarSpacing();
        $scope.myData = [];
        
        $scope.myData = $scope.myData.concat( makeBars(data.myStats.xbar) );

        // makeErrorBar(xMid, yLow, yHigh, seriesIndexStart)
        //$scope.myData = $scope.myData.concat( makeErrorBar(data.myStats.errBarL, data.myStats.errBarU) );
        for(var ii=0; ii<$scope.data.p; ii++)
        {
            var xMid    = graphConstants.x[ii];
            var yLow    = data.myStats.errBarL[ii];
            var yHigh   = data.myStats.errBarU[ii];
            var label   = "Group " + (ii+1) + " Error";
            
            $scope.myData = $scope.myData.concat( makeErrorBar(xMid, yLow, yHigh, label) );
        }
        
        // scatter data
        $scope.myData.push( {type: "scatter", yAxis: 1, key: "Scatter", color:"#ff4c4c", showLegend: false, values: []} );
        var L = $scope.myData.length - 1;
        var yMax = 0;
        var yMin = 0;
        
        //------------------------------------------------
        // make boxplot
        //------------------------------------------------
        var qData = data.myStats.quantiles;
        $scope.boxPlots.options = makeBoxPlotOptions();
        $scope.boxPlots.options.chart.type = 'boxPlotChart';   
        $scope.boxPlots.data = [];

        var ndx = 0;
        for(var ii=0; ii<$scope.data.p; ii++)
        {
            for(var jj=0; jj<nSubCopy[ii]; jj++)
            {
                var DATVAL = data.x[ndx];
                
                $scope.myData[L].values.push( {x: graphConstants.x[ii], y: DATVAL, shape: "circle", size: 3.0} );
                
                yMax = (yMax > DATVAL) ? yMax : DATVAL;
                yMin = (yMin < DATVAL) ? yMin : DATVAL;
                ndx = ndx + 1;
            }
            
            var tmpData = {
                label: 'Sample ' + ii, 
                group: 'Group ' + (ii+1),
                values: {
                    Q1: data.myStats.quantiles[ii][1],
                    Q2: data.myStats.quantiles[ii][2],
                    Q3: data.myStats.quantiles[ii][3],
                    whisker_low: data.myStats.quantiles[ii][0],
                    whisker_high: data.myStats.quantiles[ii][4],
                    outliers: []
                }
            };
            $scope.boxPlots.data.push( tmpData );
        }
        
        // makePopLevels( levelsVector )
        if( !isAnalysisPage() ){
            $scope.myData = $scope.myData.concat( makePopLevels(data.myStats.delta) );
        }

        $scope.myOptions.chart.yDomain1 = [yMin*1.5, yMax*1.5];

        
        initRenderData();
        var rendNdx0 = addRenderData();     // must be a independent variable index to work (?)
        // the dispatch -> renderEnd function is nested differently for a multiChart
        $scope.myOptions.chart.lines1 = {
            dispatch: {
                renderEnd: function(e){
                    $scope.render.data[rendNdx0] = true;
                }
            }
        };
        
        var rendNdx = addRenderData();
        makeRenderEndEvent( $scope.boxPlots.options, rendNdx);
        
        $scope.boxPlots.options.chart.yDomain = $scope.myOptions.chart.yDomain1;
    };
    // don't make initial random data if on analysis page
    if( !isAnalysisPage() )
        makeSimData();      // make some random data

    var HELP_PAGE_FLAG = false;
    $scope.initSimPlot = function(data)
    {
        initData();

        // This IF statement is for input from the helpController scope
        if( data ){
            HELP_PAGE_FLAG = true;
            
            $scope.plotsHelpService = plotsService.help;
            // update the plot if the sample size value changes in the Help
            $scope.$watch('plotsHelpService.simPlotData', function (newval, oldval)
            {
                // set input params
                var data = newval;
                $scope.data.effectSize  = data.es;
                $scope.data.powerVal    = (data.powerVal);
                $scope.data.sig         = data.sigLevel;
                $scope.data.std         = data.sd0;
                $scope.data.mu          = $scope.data.std*4.0;     // default
                $scope.data.n           = data.ss;
                $scope.data.p           = data.nGroups;
                $scope.data.id          = data.id;
                
                $scope.updateSimPlot($scope.data.id);  
            }, true);
            
            // set input params
            $scope.data.effectSize  = data.es;
            $scope.data.powerVal    = Number(data.powerVal[0]);
            $scope.data.sig         = data.sigLevel;
            $scope.data.std         = data.sd0;
            $scope.data.mu          = $scope.data.std*4.0;     // default
            $scope.n                = data.ss;
            $scope.p                = data.nGroups;
            $scope.data.id          = data.id;
            
            $scope.updateSimPlot($scope.data.id);
            return;
        }
        
        //*/
        if( computeUsingDG() )
        {
            var es    = Number( designService.formData.effectSize );
            var stdev = Number( designService.formData.stdev );
            
            var treatments  = designService.formData.treatments;
            var factors     = designService.formData.factors;
            
            es = calculatorService.data.esMean;
            stdev = calculatorService.data.esSD_AOV;
            
            $scope.data.p           = designService.numGroups;      // verify this...
            $scope.data.effectSize  = es;
            $scope.data.std         = stdev;
            $scope.data.n           = calculatorService.data.samplesize[0];
            $scope.data.mu          = $scope.data.std * 4.0;
            
            var nLevelsStr = 'nLevels';
            
            if( designService.isANOVA2() ){ // 2-way anova
                $scope.data.nLevels = [2,2];
            }
            
            if( designService.isANOVAm() ){ // multi-way anova
                nLevelsStr = 'nLevels3';
                $scope.data.nLevels3 = [2,2,2];
            }
            
            // to do if 2-way or multi-way anova
            if( designService.isANOVA2() || designService.isANOVAm() ) {
                var nLevels = designService.count_factors_levels();
                
                for(var ii=0; ii<nLevels.length; ii++)
                    $scope.data[nLevelsStr][ii] = nLevels[ii];
                
            }else{
                $scope.myOptions.chart.yAxis1.axisLabel = designService.formData.obsUnits;
            }
            
            // adding a watcher so the sim plots will update when changed
            $scope.calc = calculatorService.data;
            $scope.$watch('calc.samplesize', function (newval, oldval)
            {
                if ( computeUsingDG() ){
                    var tmp = newval;
                    if( Array.isArray(newval) )
                        tmp = newval[0];
                    
                    $scope.data.n = tmp;
                    
                    $scope.updateSimPlot();
                } else{
                    return;
                }
            });
        }
        
        //console.log("update from initSimPlot");
        $scope.updateSimPlot();
    };

    //--------------------------- Function that interacts with Python
    var watchCount = 0;
    
    $scope.callPythonToPlot = function()
    {
        var def = $q.defer();
        var isRendered = function(){ return $scope.render.data.every( function(val){ return val==true; } ) };
        
        var intervalFn,
            watcher,
            // vars for $interval
            fnDelay = 100,  //ms
            fnCount = 50;   //max number of function calls
        
        //if( isAnalysisPage() ){
        if( designService.notEmbedded ){   // if not in DG, we don't really need this interval stuff
            fnCount = 1;        // don't do interval stuff
        }
        
        watcher = $scope.$watch('render.data', function(nv,ov){
            if( isRendered() ) {
                //console.log("render.data change. isRendered?:", isRendered(), 'resolving in watcher, canceling intervalFn');
                
                $interval.cancel( intervalFn );
           }
        }, true);
        
        $scope.myOptions.processing = true;
        plotsService.updateData( $scope.data );     // for database saving
        d3.selectAll('.nvtooltip').remove();        // required to prevent "stuck" tooltips
        
        $http({
            method: 'POST',
            url: '/sim_plot_calc',
            data: $scope.data,
            headers: {'Content-Type': 'application/json'},
        }).then(function successCallback(response) {
            
            var data = response.data;
            //console.log( data );
            
            if( data.error ){
                $scope.data.error = data.msg;
                def.resolve();
                return;
            }
            $scope.data.error = false;
            
            data.x = data.myStats.y;
            
            if( !isAnalysisPage() || (isAnalysisPage() && watchCount==0) ){ //if(true) { //
                $scope.data.dataIn = data.myStats.csvdata;
                watchCount = watchCount + 1;    // this is here to prevent infinite loops
            }
            
            $scope.data.pVal = data.myStats.pValue;//.toFixed(3);
            
            if( !isAnalysisPage() ){
                for(var ii=0; ii<data.myParms.powerVal.length; ii++){
                    // round to fixed # of digits
                    data.myParms.powerVal[ii] = data.myParms.powerVal[ii].toFixed(3);
                }
                $scope.data.powerVal = data.myParms.powerVal;
            }
            
            if( designService.isANOVAm() ){
                make3WaySimData(data);
            } else if ( designService.isANOVA2() ){
                make2WaySimData(data);
            } else {
                // T-Test or 1-Way ANOVA
                makeSimData(data);
                
                // this is needed to insert into DG report
                designService.graphsText = "p-value this sim: " + $scope.data.pVal[0].toExponential(3);
            }
            
            // cannot return a promise if the interval is canceled
            intervalFn = $interval(isRendered, fnDelay, fnCount);
            
            var endAll = function(){ 
                watcher();
                def.resolve();
            };
            var newprom = intervalFn.then(function(tmp){    // called when $interval completes
                //console.log('interval complete with count', tmp);
                endAll();
            }, function errorCallback(resp) {               // called when $interval gets cancelled
                //console.log('intervalFn', resp);
                endAll();
            });
            
        }, function errorCallback(response) {
            console.log("error")
            def.resolve();
        });
        
        return def.promise;
    };
    
    $scope.updateSimPlot = function(id_inp)
    {
        var test = "two.sample";
        var id = designService.stat.selectedOption.id;
        $scope.data.test = designService.stat.selectedOption.name;

        if( id_inp ) {
            id = id_inp;
            $scope.data.test = designService.getTest(id);
            //console.log( id );
        } else {
            //console.log('Using designService id: ' + id);
        }
        
        // if not two-sample T or ANOVAs, we don't have a sim plot
        if( id !== 8 && id !== 1 && id!==7 && id!==2){
            $scope.myOptions.processing = false;
            console.log("No sim plot for id", id);
            return;
        }
        
        if( $scope.simForm ){
            if( $scope.simForm.$invalid ){
                console.log("invalid form. do nothing.");
                $scope.myOptions.processing = false;
                return;
            }
        }
        
        if( designService.isTTest2() )
            $scope.data.p = 2;
        
        $scope.data.iType = $scope.response.shape.value;
        
        if( designService.isANOVA2() ){
            $scope.data.iType = [$scope.anova.response[0].value,
                                $scope.anova.response[1].value,
                                $scope.anova.response[2].value];
        }
        
        if( designService.isANOVAm() ){ // multi-way ANOVA
            $scope.data.iType = [$scope.anova.response[0].value,
                                $scope.anova.response[2].value];
            
            if( $scope.data.nLevels3.length != 3 ){
                $scope.myOptions.processing = false;
                console.log("ANOVAm nLevels", $scope.data.nLevels3.length);
                return;
            }
        }
        
        if( isAnalysisPage() ){
            $scope.data.csvdata = $scope.data.dataIn;
        };
        
        $scope.callPythonToPlot().then(function(){
            
            $scope.myOptions.processing = false;
            
            // Manually call the refresh
            $timeout(function(){
                window.dispatchEvent(new Event('resize'));  // trigger a resize so that the box plots are rendered properly
            }, 100);
        });
        
    };
    
    //$scope.updateSimPlot();
	//$scope.initSimPlot();
}]);

