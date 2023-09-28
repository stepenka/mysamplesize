
app.controller('powerPlotsController', ['$scope', '$http', '$q', 'calculatorService', 'designService', 'plotsService', '$timeout',powerPlotsController]);
function powerPlotsController($scope, $http, $q, calculatorService, designService, plotsService, $timeout)
{
    //$scope.powerRefresh = {};    // var for api plot refresh
    
    function computeUsingDG() {
        //return designService.DGcompleted;   // original
        return !designService.notEmbedded;
    };
    
    $scope.updateFlag = true;
    
    $scope.chartConfig = {
        refreshDataOnly: true,
        deepWatchData: true
    };
    
    $scope.plotOptions = {
        processing: true,
        chart : {
            type: 'lineChart',
            height: 450,
            duration: 0,
            margin : {
                top: 20,
                right: 20,
                bottom: 60,
                left: 65
            },
            
            yDomain: [0, 50],
            color: d3.scale.category10().range(),
            useInteractiveGuideline: true,
            clipVoronoi: false,
            
            xAxis: {
                axisLabel: 'Relative Effect Size',
                showMaxMin: false,
                tickFormat: function(d) { return d3.format(',.3f')(d) }
            },

            yAxis: {
                axisLabel: 'Sample Size per group',
                showMaxMin: false,
                tickFormat: function(d){ return d3.format(',.0f')(d) }
            },

            zoom: {
                enabled: false,
                useFixedDomain: false,
                useNiceScale: true,
                horizontalOff: false,
                verticalOff: true,
                unzoomEventType: "dblclick.zoom"
            }
        }
    };
    
    // data for plotting
    $scope.plotData = [
        {key: "Power 1", type:"line", yAxis:1, values: [{x: 0, y:1}]},
        {key: "Power 2", type:"line", yAxis:1, values: [{x: 0, y:1}]},
        {key: "Power 3", type:"line", yAxis:1, values: [{x: 0, y:1}]}
    ];
    $scope.globData = [];   // will hold all plotData, with plotData possibly truncated for display purposes
    
    // data for controller / inputs
    $scope.data = {
        // 2-Way ANOVA values
        nGroups: [2,2,2],
        aov2effect: {value:'M'},              // "M", "S", "I" : Main, Secondary, or Interaction
        stat: {
            sig: 0.05,
            sigOpts: [0.001, 0.01, 0.05, 0.1]
        },
    };
    
    // for initializing within DesignGuide
    $scope.initPlot = function()
    {
        //console.log('initPlot() called for power plots');
        
        for(var ii=0; ii<$scope.data.nGroups.length; ii++)
            $scope.data.nGroups[ii] = designService.numGroups;

        if( designService.isANOVA2() ) {       // 2-Way ANOVA
            var tmp = designService.formData.treatments.concat( designService.formData.factors );
            
            $scope.data.nGroups = Array( tmp.length );
            for(var ii=0; ii<tmp.length; ii++) {
                $scope.data.nGroups[ii] = tmp[ii].level.length;
                
                if( ii < designService.formData.treatments.length )
                    $scope.data.nGroups[ii]++;  // add a level for the control
            }
        }

        if( designService.isANOVAm() ) {        // multi-way ANOVA
            var tmp = designService.formData.treatments.concat( designService.formData.factors );
            
            $scope.AOVM.nGroups = Array( tmp.length );
            for(var ii=0; ii<tmp.length; ii++) {
                $scope.AOVM.nGroups[ii] = tmp[ii].level.length;
                if( ii < designService.formData.treatments.length )
                    $scope.AOVM.nGroups[ii]++;   // add a level for the control
            }
        }
        
        $scope.updatePlot();
    };
    
    // trigger a watch if in designGuide
    $scope.calc = calculatorService;
    $scope.$watch('calc.calculateComplete', function (newval, oldval)
    {
        if( newval === oldval )
            return;
        
        // no plots available for Repeated Measures
        if( designService.isRMPS1() || designService.isRMCS1() )  
            return;
        
        if( newval == true )
            updatePlotWithDG();
    });
    function updatePlotWithDG() 
    {
        if( designService.isSLM() || designService.isRMCS1() || designService.isRMPS1() || designService.isNone() ){
            return;
        }

        if( computeUsingDG() )
        {
            var nLevels = designService.count_factors_levels();
            $scope.data.nGroups = nLevels;
            
            if( designService.isANOVAm() )  // multi-way
            {
                $scope.AOVM.nGroups  = $scope.data.nGroups;
                $scope.AOVM.nFactors = $scope.AOVM.nGroups.length;  // needed to add this to work with nGroups=4
                
                $scope.updateFlag = false;  // turn off updatePlot  (temporarily)
                $scope.combAOVM();
                $scope.updateFlag = true;

                // update again after combAOVm -> makeAOVMoptions defaults all groups to 2
                $scope.AOVM.nGroups = $scope.data.nGroups;
            }
            
            var ss    = $scope.calc.data.samplesize;
            //var esRel = $scope.calc.data.es;                // this should cover all tests I think ???
            var esMax = Number(designService.formData.effectSizeLarge);
            var esRel = Number(designService.formData.effectSize );
            
            if( esRel == 0 )
                esRel = $scope.calc.data.esMean;    // this might not be the best value?
            
            if( esMax <= esRel )
                esMax = 2.0*esRel;
            
            if( typeof(ss) !== 'number' ) {
                // make a copy, and choose the max value for samplesize to display in plot
                ss = Object.assign({}, $scope.calc.data.samplesize);
                for(var ii=1; ii<ss.length; ii++)
                    ss[0] = ((ss[ii] > ss[0]) ? ss[ii] : ss[0]);
                ss = ss[0];
                
                var ind1 = $scope.AOVM.inputTypeSelection.id;
                var cols = $scope.AOVM.inputTypeOptions.length;     // all interaction types (3-Way => 3 types)
                var ind2 = parseInt( $scope.AOVM.interactions );
                var index = ind2 + cols * ind1;
                
                ss = $scope.calc.data.samplesize[index];
            }
            
            $scope.plotOptions.chart.xAxis.axisLabel = 'Effect Size';
            
            // consider modifying this the dynamic precision, based on effect size min and max
            $scope.effectSize_slider = {
                minValue: 0.01,
                maxValue: esMax,
                options: {
                    floor: 0.01,
                    ceil: esMax,
                    showTicksValues: 10,
                    draggableRange: false,
                    step: 10,
                    precision: 2,
                    onChange: function() {
                        var slider = $scope.effectSize_slider;
                        clipAxes(slider);
                    }
                }
            };

            //esMax = $scope.calc.effectCalc2(designService.stat.selected.id, esMax);
            add_single_plot_data(esRel, ss, esMax);
            return;
            
            add_single_plot_data(esRel, ss, esMax).then( function(){
                deferred.resolve();
                return deferred.promise;
            });
        }
    };
    
    //------------------------ Multi-Way ANOVA values
    $scope.AOVM = {
        comb : {            // data for combinations/interactions
            data: [],
            display: []
        },

        nGroups: [], 
        nFactors: 3,
        interactions: ''+0,
        
        id: 0,
        inputTypeSelection: {},
        inputTypeOptions: [
            {id: 0, label: 'Main'},
            {id: 1, label: '2-Way'},
            {id: 2, label: '3-Way'},
            {id: 3, label: '4-Way'},
            {id: 4, label: '5-Way'},
        ],
        
        // Pre-Python calculation stuff
        numdf: 1,
        totGrpProd: 1,
        lambda1: 1
    };
    $scope.AOVM.inputTypeSelection = $scope.AOVM.inputTypeOptions[0];
    
    //Range slider with ticks and values
    $scope.power_slider = {
        minValue: 0.7,
        maxValue: 0.9,
        options: {
            floor: 0.7,
            ceil: 0.9,
            showTicksValues: true,
            draggableRange: false,
            step: 0.1,
            precision: 1,
            ticksArray: [0.7,0.80,0.9],
            onChange: function()
            {
                $scope.updatePlot();
            },
            onStart: function()
            {
                $timeout(function () {
                    $scope.$broadcast('rzSliderForceRender');
                });
            }
        }
    };
    
    //Range slider with ticks and values
    $scope.effectSizeRel_slider = {
        minValue: 0.01,
        maxValue: 2.0,
        options: {
            floor: 0.01,
            ceil: 2.0,
            showTicksValues: 0.5,
            draggableRange: false,
            step: 0.01,
            precision: 2,
            onChange: function() {
                var slider = $scope.effectSizeRel_slider;
                clipAxes(slider);
            }
        }
    };
    
    //Range slider with ticks and values
    $scope.effectSize_slider = {
        minValue: 0.01,
        maxValue: 2.0,
        options: {
            floor: 0.01,
            ceil: 2.0,
            showTicksValues: 0.5,
            draggableRange: false,
            step: 0.01,
            precision: 2,
            onChange: function() {
                var slider = $scope.effectSize_slider;
                clipAxes(slider);
            }
        }
    };
    
    //Range slider with ticks and values
    $scope.sampleSize_slider = {
        minValue: 2,
        maxValue: 50,
        options: {
            floor: 2,
            ceil: 50,
            showTicksValues: 25,
            draggableRange: false,
            step: 1,
            precision: 0,
            onChange: function(){
                var slider = $scope.sampleSize_slider;
                clipAxes(slider);
            }
        }
    };
    
    function slidersReset() {
        var sliderNames = ["sampleSize_slider", "effectSize_slider", "effectSizeRel_slider", "power_slider"];
        
        for(var ii=0; ii<sliderNames.length; ii++){
            $scope[sliderNames[ii]].minValue = $scope[sliderNames[ii]].options.floor;
            $scope[sliderNames[ii]].maxValue = $scope[sliderNames[ii]].options.ceil;
        };
    };
    
    // the next two functions clip the "global" data structure to fit (instead of recalculating)
    function clipAxes(xy) {
        // make a copy of plotData, then modify twice (once for each axis)
        $scope.plotData = [];
        for(var ii=0; ii<$scope.globData.length; ii++){
            $scope.plotData.push();
            //$scope.plotData[ii] = JSON.parse(JSON.stringify( $scope.globData[ii] ));
            $scope.plotData[ii] = Object.assign({}, $scope.globData[ii] );
        }

        var ySlider = $scope.sampleSize_slider;
        var xSlider = $scope.effectSizeRel_slider;
        if( computeUsingDG() )
            xSlider = $scope.effectSize_slider;

        clipAxis(xSlider.minValue, xSlider.maxValue, 'x');
        clipAxis(ySlider.minValue, ySlider.maxValue, 'y');
        
        $scope.plotOptions.chart.yDomain = [ySlider.minValue, ySlider.maxValue];
        $scope.plotOptions.chart.xDomain = [xSlider.minValue, xSlider.maxValue];
    };
    function clipAxis(vmin, vmax, xy)
    {
        for(var kk=0; kk<$scope.plotData.length; kk++) {
            var tmpArray = $scope.plotData[kk].values;
            
            var tmp2 = tmpArray.filter(function(el){
                inRange = (el[xy] >= vmin) && (el[xy] <= vmax);
                return inRange; //( (el[xy] <= vmax) );
            } );
            $scope.plotData[kk].values = tmp2.slice();
            //console.log(tmp2);
        }
    };
    
    // Multi-Way ANOVA callback functions
    $scope.updateAOVMselection = function()
    {
        var dataNDX = $scope.AOVM.inputTypeSelection.id;
        var data    = $scope.AOVM.comb.display;
        var tmp     = $scope.AOVM.comb.display[ dataNDX ];
        var tmpNDX  = parseInt( $scope.AOVM.interactions );
        
        if( typeof(tmp) !== 'undefined')
        {
            var intStr      = tmp[tmpNDX];
            
            var numdf       = 1;
            var nGroupsProd = 1;
            var totGrpProd  = 1;
            
            // this is the list of 3-way interactions
            var totalStr    = $scope.AOVM.comb.display[ $scope.AOVM.comb.display.length - 1][0];
            
            // actual index is:  $scope.AOVM.inputTypeSelection.id, parseIntT( $scope.AOVM.interactions )
            //updatePlotWithDG()

            for(var ii=0; ii<totalStr.length; ii++)
            {
                var nGroups = $scope.AOVM.nGroups[ ii ];
                totGrpProd  = totGrpProd * nGroups;
            }
            
            for(var ii=0; ii<intStr.length; ii++)
            {
                var ndx     = totalStr.indexOf( intStr[ii] );
                var nGroups = $scope.AOVM.nGroups[ ndx ];
                numdf       = numdf * (nGroups - 1);
                nGroupsProd = nGroupsProd * nGroups;
            }

            var lambda1             = totGrpProd * numdf / nGroupsProd;
            
            $scope.AOVM.numdf       = numdf;
            $scope.AOVM.totGrpProd  = totGrpProd;
            $scope.AOVM.lambda1     = lambda1;
        }
        else
        {
            console.log( 'undef' );
        }
        
        if( $scope.updateFlag )
            $scope.updatePlot();
    };
    
    $scope.interactionHighlight = function()
    {
        $scope.AOVM.interactions = '' + 0;
        $scope.updateAOVMselection();
    };
    
    var makeAOVMoptions = function()
    {
        var n = $scope.AOVM.nFactors;
        
        // Make new options
        if( !computeUsingDG() )
            $scope.AOVM.nGroups = [2];
        
        $scope.AOVM.inputTypeOptions = [ {id: 0, label: 'Main'} ];
        
        for(var ii=1; ii<n; ii++)
        {
            var str = (ii+1) + '-Way';
            $scope.AOVM.inputTypeOptions.push( {id: ii, label: str} );
            
            if( !computeUsingDG() )
                $scope.AOVM.nGroups.push(2)      // hard-coded initial group size for a single factor
        }
        $scope.interactionHighlight();
    };

    $scope.combAOVM = function()
    {
        $scope.AOVM.inputTypeSelection = $scope.AOVM.inputTypeOptions[0];
        
        var tmp = generateCombinations( $scope.AOVM.nFactors );
        $scope.AOVM.comb.data = tmp;
        
        // convert 123 to ABC for display purposes
        var convert2Char = function(keh){ return String.fromCharCode(65+keh-1) };
        var n = 0;
        for(var ii=0; ii<tmp.length; ii++){
            var sub = tmp[ii];
            $scope.AOVM.comb.display[ii] = [];
            for(var jj=0; jj<sub.length; jj++){
                var str = '';
                for(var kk=0; kk<sub[jj].length; kk++){
                    n   = parseInt( sub[jj][kk] )
                    str = str + convert2Char(n);
                }
                $scope.AOVM.comb.display[ii][jj] = str;
            }
        }
        
        makeAOVMoptions();
        //$scope.interactionHighlight();
    };

    $scope.resetPlot = function()
    {
        //console.log( 'resetPlot');
        $scope.AOVM.nGroups = 2;
        $scope.data.nGroups = [2,2,2];
        
        for(var ii=0; ii<designService.formData.treatments.length; ii++)
            $scope.data.nGroups[ii] = $scope.calc.treatments.levels;
        
        $scope.updatePlot();
    };
    
    //--------------------------- Function that interacts with Python
    $scope.singleDataPoint = [];
    
    $scope.updatePlot = function()
    {
        //console.log('powerPlotsController: updatePlot()');
        $scope.plotOptions.processing = true;
        d3.selectAll('.nvtooltip').remove();
        
        if( designService.isSLM() || designService.isRMCS1() || designService.isRMPS1() || designService.isNone() ){
            return;
        }
        
        // this $timeout function allows the sliders to get updated/initialized properly.
        $timeout(function () {
            $scope.$broadcast('rzSliderForceRender');
        }, 500);
        
        if( computeUsingDG() ){
            // Convert absolute to relative effect size
            var ID = $scope.design.stat.selectedOption.id;
            var esAbs = $scope.effectSize_slider;
            var minV = calculatorService.effectCalc2(ID, esAbs.minValue);
            var maxV = calculatorService.effectCalc2(ID, esAbs.maxValue);
            $scope.effectSizeRel_slider.minValue = minV;
            $scope.effectSizeRel_slider.maxValue = maxV;
        }
        
        var numdf       = $scope.AOVM.numdf;
        var totGrpProd  = $scope.AOVM.totGrpProd;
        var lambda1     = $scope.AOVM.lambda1;
        
        var test = $scope.design.stat.selectedOption.name;
        
        var dataIn = {'test': test,
                      'effect': $scope.effectSizeRel_slider, 
                      'power': $scope.power_slider,
                      'sig': $scope.data.stat.sig, 
                      'nGroups': $scope.data.nGroups,
                      'aovEffect': $scope.data.aov2effect.value, 
                      'totGrpProd': $scope.AOVM.totGrpProd,
                      'numdf': $scope.AOVM.numdf, 
                      'lambda1': $scope.AOVM.lambda1,
                      
                      // this is extra stuff to add for saving to database
                      'aovm': $scope.AOVM
                      };
        
        plotsService.updateData( dataIn );
        
        return $http({
            method: 'POST',
            url: '/power_plot_calc',
            data: dataIn,
            headers: {'Content-Type': 'application/json'},
        }).then(function successCallback(response) {

            slidersReset();     // reset all values to defaults
            var data        = response.data;
            var rows        = data.y.length;
            var cols        = data.y[0].length;
            
            var effectMin   = $scope.effectSizeRel_slider.options.floor;
            var effectMax   = $scope.effectSizeRel_slider.options.ceil;

            if( computeUsingDG() )
            {
                effectMin = $scope.effectSize_slider.minValue;
                effectMax = $scope.effectSize_slider.maxValue;
                
                $scope.effectSize_slider.options.step = (effectMax-effectMin)/10;
                $scope.effectSize_slider.options.precision = 5;
            }
            
            var powerMin    = $scope.power_slider.minValue;
            var powerMax    = $scope.power_slider.maxValue;
            var sampleMin   = $scope.sampleSize_slider.options.floor;
            var sampleMax   = $scope.sampleSize_slider.options.ceil;
            
            $scope.plotData = [];
            $scope.globData = [];
            
            for(var jj=0; jj<rows; jj++)
            {
                var power = powerMin + jj*$scope.power_slider.options.step;
                power = Math.round(power * 100) / 100;
                var powerVals = data.y[jj];
                
                for(var ii=0; ii<cols; ii++)
                {
                    var x0 = data.x[ii]; //effectMin + ii * (effectMax-effectMin) / (cols-1);
                    var y0 = powerVals[ii];
                    
                    if( computeUsingDG() ) {
                        // Convert relative back to absolute effect size
                        x0 = calculatorService.effectCalc2_inv($scope.design.stat.selectedOption.id, x0);
                    }
                    
                    powerVals[ii] = {x: x0, y: Math.round(y0*100)/100};
                }

                $scope.plotData.push( {type:"line", yAxis:1, key: "Power " + (power), values: powerVals} );
            }
            
            $scope.plotOptions.chart.xDomain = [effectMin, effectMax] ;
            $scope.plotOptions.chart.yDomain = [sampleMin, sampleMax];
            
            if( $scope.singleDataPoint.length !== 0 )
                $scope.plotData.push( $scope.singleDataPoint );
            
            $scope.globData = $scope.plotData.slice();
            
            $scope.plotOptions.processing = false;
            
            if( computeUsingDG() ){
                $scope.effectSize_slider.options.onChange();        // manually trigger change for plot rendering
            }
            
            d3.selectAll('.nvtooltip').remove();        // required to prevent "stuck" tooltips
            return;
            
            // Manually call the refresh
            // ... there are still some plot rendering errors when doing this
            $timeout(function(){
                //console.log('refreshing power plot');
                //$scope.powerRefresh.api.refresh();
            }, 500);
            
        }, function errorCallback(response) {
            $scope.plotOptions.processing = false;
            console.log("error")
        });
    };
    
    function add_single_plot_data(effectSize, sampleSize, maxEffectSize)
    {
        var deferred = $q.defer();
        var s = $scope.plotData.length;
        
        $scope.singleDataPoint = {type:"line", yAxis:1, key:"You are here", color:"black",
            values: [{x: effectSize, y: sampleSize, shape: "circle", size: 20.0*Math.random()}]
        };
        //$scope.plotData.push( $scope.singleDataPoint );
        
        $scope.updatePlot().then( function() {
            // maxEffectSize = 2.0;
            $scope.effectSize_slider.maxValue     = maxEffectSize;
            $scope.effectSize_slider.options.ceil = maxEffectSize;
            
            deferred.resolve();
            return deferred.promise;
        });
        
        return deferred.promise;
    };
    
    // combAOVM() must be called to work with standalone, but causes issues when embedded
    if( !computeUsingDG() )
        $scope.combAOVM();  //calls updatePlot()
    
};
