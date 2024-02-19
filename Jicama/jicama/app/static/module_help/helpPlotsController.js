/****************************************************************************/
//          Plots for HELP
/****************************************************************************/
app.controller('basicsPlotCtrl', ['$scope', '$sce', '$http', '$timeout', 'plotsService', 
function($scope, $sce, $http, $timeout, plotsService) {
    var ctrlColor = "#1f77b4";
    var trtColor  = "#ff7f0e";
    
    //$scope.plotType = "effectSize";
    
    $scope.helpService = plotsService.help;
    $scope.helpService.simPlotData = {};
    
    //Range slider with ticks and values
    $scope.effectSize_slider = {
        value: 0.05,
        options: {
            minLimit: 0.05,
            maxLimit: 2.0,
            floor: 0.05,
            ceil: 2,
            showTicksValues: true,
            draggableRange: false,
            ticksArray: [0.05, 1.0, 2.0],
            step: 0.05,
            precision: 2,
            onChange: function(){
                updatePlot();
            }
        }
    };
    
    //Range slider with ticks and values
    $scope.nGroups_slider = {
        value: 3,
        options: {
            minLimit: 2,
            maxLimit: 8,
            floor: 2,
            ceil: 8,
            showTicksValues: 1,
            draggableRange: false,
            step: 1,
            precision: 0,
            onChange: function(){
                updatePlot();
            }
        }
    };
    
    //Range slider with ticks and values
    $scope.stdev_slider = {
        value: 1,
        options: {
            minLimit: 0.4,
            maxLimit: 2.0,
            floor: 0.4,
            ceil: 2,
            showTicks: true,
            draggableRange: false,
            step: 0.2,
            precision: 2,
            onChange: function(){
                updatePlot();
            }
        }
    };
    
    //Range slider with ticks and values
    $scope.sampleSize_slider = {
        value: 5,
        options: {
            floor: 2,
            ceil: 30,
            minLimit: 2,
            maxLimit: 30,
            showTicksValues: true,
            ticksArray: [2, 15, 30],
            draggableRange: false,
            step: 1,
            precision: 0,
            onChange: function(){
                updatePlot();
            }
        }
    };
    
    //Range slider with ticks and values
    $scope.sigLevel_slider = {
        value: 0.05,
        options: {
            floor: 0.001,
            ceil: 0.1,
            showTicks: true,
            showTicksValues: true,
            logScale: true,
            ticksArray: [0.001, 0.005, 0.01, 0.05, 0.1],
            draggableRange: false,
            step: 0.001,
            precision: 3,
            onChange: function(){
                updatePlot();
            }
        }
    };
    
    //Sliders for ANOVA treatment means plot
    $scope.tMean1_slider = {
        value: 1,
        options: {
            floor: 0,
            minLimit: 0.1,
            ceil: 4,
            showTicks: true,
            showTicksValues: true,
            draggableRange: false,
            step: 0.1,
            ticksArray: [0, 1, 2, 3, 4],
            precision: 1,
            onChange: function(){
                var origPlotType = $scope.plotType;
                $scope.plotType = "ANOVAmeans";
                updatePlot();
                $scope.plotType = origPlotType;
            }
        }
    };
    
    $scope.tMean2_slider = {
        value: 2,
        options: {
            floor: 0,
            minLimit: 0.1,
            ceil: 4,
            showTicks: true,
            showTicksValues: true,
            draggableRange: false,
            step: 0.1,
            ticksArray: [0, 1, 2, 3, 4],
            precision: 1,
            onChange: function(){
                var origPlotType = $scope.plotType;
                $scope.plotType = "ANOVAmeans";
                updatePlot();
                $scope.plotType = origPlotType;
            }
        }
    };
    
    $scope.esMeanPlotOptions = {
        chart: {
            type: 'lineChart',
            height: 350,
            margin : {
                top: 30,
                right: 60,
                bottom: 50,
                left: 70
            },
            color: d3.scale.category10().range(),
            x: function(d){ return d.x; },
            y: function(d){ return d.y; },
            duration: 500,
            
            xAxis: {
                tickFormat: function(d){
                    return d3.format(',.1f')(d);
                }
            },
            showYAxis: false,   // turn off yAxis for helper effect size plots
            useInteractiveGuideline: false,
            tooltip: {enabled: false}       // disable tooltip / mouseover
        }
    };
    
    $scope.esPlotOptions = {
        chart: {
            type: 'lineChart',
            height: 350,
            margin : {
                top: 30,
                right: 60,
                bottom: 50,
                left: 70
            },
            color: d3.scale.category10().range(),
            x: function(d){ return d.x; },
            y: function(d){ return d.y; },
            duration: 500,
            
            xAxis: {
                //ticks: 10,
                tickFormat: function(d){
                    return d3.format(',.1f')(d);
                }
            },
            showYAxis: false,   // turn off yAxis for helper effect size plots
            /*
            yAxis: {
                ticks: 4,
                tickFormat: function(d){
                    return d3.format(',.1f')(d);
                }
            },//*/
            legend: {
            },
            useInteractiveGuideline: false,
            tooltip: {enabled: false}       // disable tooltip / mouseover
        }
    };
    $scope.esPlotData = [];
    $scope.esAnovaData = [];
    $scope.powerPlotData = [];
    $scope.samplePlotData = [];
    $scope.sigPlotData = [];
    
    function changePlotDomains(arrsX, arrsY) {
        function getMinVal(arr) {
            var minval = arr[0];
            for(var ii=1; ii<arr.length; ii++){
                minval = (arr[ii] < minval) ? arr[ii] : minval;
            }
            return minval;
        };
        function getMaxVal(arr) {
            var maxval = arr[0];
            for(var ii=1; ii<arr.length; ii++){
                maxval = (arr[ii] > maxval) ? arr[ii] : maxval;
            }
            return maxval;
        };
        var xmin = getMinVal( arrsX );
        var xmax = getMaxVal( arrsX );
        var ymin = getMinVal( arrsY );
        var ymax = getMaxVal( arrsY );
        
        ymax = ymax * 1.5;
        
        $scope.esPlotOptions.chart.xDomain = [xmin, xmax];
        $scope.esPlotOptions.chart.yDomain = [ymin, ymax];
        
        return( [xmin,xmax,ymin,ymax] );
    };
    
    function makeEsPlotData(x,y, x2,y2, zcrit, mean1, mean2)
    {
        var siz1 = x.length;
        var siz2 = x2.length;
        
        var plotData = [];
        plotData.push( {type:"line", color:ctrlColor, key:"Control",   values:[]} );
        plotData.push( {type:"line", area:true, color:ctrlColor, key:"ControlArea",   values:[]} );
        
        plotData.push( {type:"line", color:trtColor,  key:"Treatment", values:[]} );
        plotData.push( {type:"line", area:true, color:trtColor, key:"TreatmentArea",   values:[]} );

        plotData[0].values = new Array(siz1);
        plotData[1].values = new Array(siz1);
        plotData[2].values = new Array(siz2);
        plotData[3].values = new Array(siz2);
        
        for(var ii=0; ii<x.length; ii++){
            var ytmp = ((x[ii]<=-zcrit) || (x[ii]>=zcrit)) ? y[ii] : null;
            plotData[0].values[ii] = {x: x[ii], y: y[ii]}
            plotData[1].values[ii] = {x: x[ii], y: ytmp};
        }
        
        for(var ii=0; ii<x2.length; ii++){
            var ytmp = (x2[ii]>=zcrit) ? y2[ii] : null;
            plotData[2].values[ii] = {x: x2[ii], y: y2[ii]}
            plotData[3].values[ii] = {x: x2[ii], y: ytmp}
        }
        
        var drange = changePlotDomains(x.concat(x2), y.concat(y2));
        
        var ymin = drange[2];
        var ymax = drange[3];
        
        plotData.push( {type:"line", classed: 'dashed', color:ctrlColor, key:"Control Mean",   values: [{x:mean1, y:ymin}, {x:mean1, y:ymax}]} );
        plotData.push( {type:"line", classed: 'dashed', color:trtColor,  key:"Treatment Mean", values: [{x:mean2, y:ymin}, {x:mean2, y:ymax}]} );
        
        return plotData;
    };
    
    function makeMeanAnovaPlotData(x, y0, y1, y2)
    {
        var siz = x.length;
        
        var plotData = [];
        plotData.push( {type:"line", color:"black",   key:"Control",   values:[]} );
        plotData.push( {type:"line", color:ctrlColor, key:"Treatment 1",   values:[]} );
        plotData.push( {type:"line", color:trtColor,  key:"Treatment 2", values:[]} );        

        plotData[0].values = new Array(siz);
        plotData[1].values = new Array(siz);
        plotData[2].values = new Array(siz);
        
        for(var ii=0; ii<siz; ii++)
        {
            plotData[0].values[ii] = {x: x[ii], y: y0[ii]};
            plotData[1].values[ii] = {x: x[ii], y: y1[ii]};
            plotData[2].values[ii] = {x: x[ii], y: y2[ii]};
        }
        return plotData;
    }
    
    function makeEsAnovaPlotData(x,y, x2,y2, fcrit)
    {
        var siz1 = x.length;
        var siz2 = x2.length;
        
        var plotData = [];
        plotData.push( {type:"line", color:"black", key:"Null",   values:[]} );
        plotData.push( {type:"line", area:true, color:ctrlColor, key:"Type I Error",   values:[]} );
        
        plotData.push( {type:"line", color:"red",  key:"Alternative", values:[]} );
        plotData.push( {type:"line", area:true, color:trtColor, key:"Type II Error",   values:[]} );

        plotData[0].values = new Array(siz1);
        plotData[1].values = new Array(siz1);
        plotData[2].values = new Array(siz2);
        plotData[3].values = new Array(siz2);
        
        for(var ii=0; ii<x.length; ii++){
            var ytmp = (x[ii]>=fcrit) ? y[ii] : null ;
            plotData[0].values[ii] = {x: x[ii], y: y[ii]};
            plotData[1].values[ii] = {x: x[ii], y: ytmp};
        }
        
        for(var ii=0; ii<x2.length; ii++){
            var ytmp = (x2[ii]>=fcrit) ? y2[ii] : null;
            plotData[2].values[ii] = {x: x2[ii], y: y2[ii]};
            plotData[3].values[ii] = {x: x2[ii], y: ytmp};
        }
        
        changePlotDomains( x.concat(x2), y.concat(y2) );

        return plotData;
    };
    
    function makeSSPlotData(x,y, x2,y2, zcrit, mean1, mean2)
    {
        var siz1 = x.length;
        var siz2 = x2.length;
        
        var plotData = [];
        plotData.push( {type:"line", color:ctrlColor, key:"Null", values:[]} );
        plotData.push( {type:"line", showLegend: false, area:true, color:ctrlColor, key:"NullArea", values:[]} );
        
        plotData.push( {type:"line", color:trtColor, key:"Alternative", values:[]} );
        plotData.push( {type:"line", area:true, color:trtColor, key:"Power", values:[]} );

        plotData[0].values = new Array(siz1);
        plotData[1].values = new Array(siz1);
        plotData[2].values = new Array(siz2);
        plotData[3].values = new Array(siz2);
        
        for(var ii=0; ii<x.length; ii++){
            var ytmp = ((x[ii]>=-zcrit) && (x[ii]<=zcrit)) ?  null : y[ii];
            plotData[0].values[ii] = {x: x[ii], y: y[ii]}
            plotData[1].values[ii] = {x: x[ii], y: ytmp};
        }
        
        for(var ii=0; ii<x2.length; ii++){
            var ytmp = (x2[ii]>=zcrit) ? y2[ii] : null;
            plotData[2].values[ii] = {x: x2[ii], y: y2[ii]}
            plotData[3].values[ii] = {x: x2[ii], y: ytmp}
        }
        
        changePlotDomains( x.concat(x2), y.concat(y2) );
        
        return plotData;
    };
    
    function makePowerPlotData(x,y,y2, zcrit)
    {
        var siz = x.length;
        
        var plotData = [];
        plotData.push( {type:"line", color:ctrlColor, key:"Null", values:[]} );
        plotData.push( {type:"line", color:"black", key:"Alternative", values:[]} );
        
        plotData.push( {type:"line", area:true, color:trtColor, key:"Power", values:[]} );
        plotData.push( {type:"line", area:true, color:"#6dc173", key:"Type I Error", values:[]} );

        plotData[0].values = new Array(siz);
        plotData[1].values = new Array(siz);
        plotData[2].values = new Array(siz);
        plotData[3].values = new Array(siz);
        
        for(var ii=0; ii<x.length; ii++){
            var ytmp2 = (x[ii]<=zcrit) ? null : y[ii];
            var ytmp = (x[ii]>=-zcrit && x[ii]<=zcrit) ? null : y[ii];
            var pwrArea = (x[ii]<=zcrit) ? null : y2[ii];
            
            plotData[0].values[ii] = {x: x[ii], y: y[ii]}
            plotData[1].values[ii] = {x: x[ii], y: y2[ii]}
            
            plotData[3].values[ii] = {x: x[ii], y: ytmp};
            plotData[2].values[ii] = {x: x[ii], y: pwrArea};
        }
        
        changePlotDomains(x, y);
        
        return plotData;
    };
    
    function makeSigPlotData(x,y, zcrit)
    {
        var siz = x.length;
        
        var plotData = [];
        plotData.push( {type:"line", color:ctrlColor, key:"Distribution", values:[]} );
        
        plotData.push( {type:"line", area:true, color:"#6dc173", key:"Two-Tailed", values:[]} );
        plotData.push( {type:"line", area:true, color:"#778899", key:"One-Tailed", values:[]} );
        
        plotData[0].values = new Array(siz);
        plotData[1].values = new Array(siz);
        plotData[2].values = new Array(siz);
        
        for(var ii=0; ii<x.length; ii++){
            var ytmp1 = (x[ii] >= zcrit[1]) ? y[ii] : null;
            var ytmp2 = ((x[ii] >= zcrit[0]) || (x[ii] <= - zcrit[0])) ? y[ii]: null;
            
            plotData[0].values[ii] = {x: x[ii], y: y[ii]}

            plotData[1].values[ii] = {x: x[ii], y: ytmp1};
            plotData[2].values[ii] = {x: x[ii], y: ytmp2};
        }
        changePlotDomains(x, y);
        
        return plotData;
    };
    
    $scope.meanAnovaOutput = {
        effectSize: 0,
        pairDiffs: [0,0,0]
    };

    function updatePlot()
    {
        var tmp = {es: $scope.effectSize_slider.value, 
                    ss: $scope.sampleSize_slider.value, 
                    stdev: $scope.stdev_slider.value,
                    sig: $scope.sigLevel_slider.value, 
                    nGroups: $scope.nGroups_slider.value,
                    mean1: $scope.tMean1_slider.value,
                    mean2: $scope.tMean2_slider.value,
                    id: $scope.simPlotID,
                    type: $scope.plotType};
        
        $http({
            method: 'POST',
            url: '/tools_demos',
            data: tmp,
            headers: {'Content-Type': 'application/json'},
        }).then(function successCallback(response) {
            
            var data = response.data;

            $scope.helpService.simPlotData = data;
            
            if( tmp.type == "effectSize"){
                $scope.esPlotData = makeEsPlotData(data.x, data.y, data.x2, data.y2, data.tCrit[0], data.m1, data.m2);
                //$scope.esPlotData = makeSSPlotData(data.x, data.y, data.x2, data.y2, data.zcrit, data.m1, data.m2);
                $scope.powerVal = data.powerVal[0];
            }
            
            if( tmp.type == "effectSizeANOVA") {
                $scope.esAnovaPlotData = makeEsAnovaPlotData(data.x, data.y, data.x2, data.y2, data.fCrit[0]);
                $scope.powerVal = data.powerVal[0];
            }
            
            if( tmp.type == "ANOVAmeans") {
                $scope.meanAnovaPlotData = makeMeanAnovaPlotData(data.x0, data.y0, data.y1, data.y2);
                $scope.meanAnovaOutput = {
                    effectSize: data.es,
                    pairDiffs: [data.d10, data.d12, data.d20]
                };
            }
            
            if( tmp.type == "sampleSize") {
                $scope.samplePlotData = makeSSPlotData(data.x, data.y, data.x2, data.y2, data.tCrit[0], data.m1, data.m2);
                $scope.powerVal = data.powerVal[0];
            }
            
            if(tmp.type == "power") {
                $scope.powerPlotData = makePowerPlotData(data.x, data.y, data.y2, data.tCrit[0]);
                $scope.powerVal = data.powerVal[0];
            }
            
            if( tmp.type == "sigLevel") {
                $scope.sigPlotData = makeSSPlotData(data.x, data.y, data.x2, data.y2, data.tCrit[0], data.m1, data.m2);
                $scope.powerVal = data.powerVal[0];
            }

            if( tmp.type == "stdev") {
                $scope.stdevPlotData = makeSSPlotData(data.x, data.y, data.x2, data.y2, data.tCrit[0], data.m1, data.m2);
                $scope.powerVal = data.powerVal[0];
            }

        }, function errorCallback(response) {
            console.log(response);
        });
    };
    
    
    $scope.initPlotType = function(str)
    {
        $scope.nGroups_slider.value = 2;
        $scope.simPlotID = 8;   // T-Test
        
        if( str == "power" ){
            $scope.sampleSize_slider.value  = 6;
            $scope.effectSize_slider.value  = 1;
            $scope.stdev_slider.value       = 1;
            $scope.sigLevel_slider.value    = 0.05; //-1.3;
        }
        if( str == "sampleSize")
        {
            $scope.effectSize_slider.value = 0.5;
            // str = "power";
        }
        if( str == "effectSize" ) {
            // set some values
            $scope.effectSize_slider.value = 1;
        }
        
        if( str == "effectSizeANOVA" ) {
            // set some values
            $scope.simPlotID = 1;   // 1-Way ANOVA
            
            $scope.effectSize_slider.value = 1;
            $scope.sampleSize_slider.value = 6;
            $scope.stdev_slider.value = 1;
            $scope.nGroups_slider.value = 3;
            $scope.sigLevel_slider.value = 0.05; //-1.3;
        }
        
        $scope.plotType = str;
        updatePlot();
    };
}]);
