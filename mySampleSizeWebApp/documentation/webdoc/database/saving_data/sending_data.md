# Sending Data to Python

The main interface for sending data to Python is contained in `static/module_save/saveToolsController.js`. Both Power/Sample size and the graphs are saved using the Flask endpoint [`saveUserData`](python). 

## Power and Sample Size Data

In the saveToolsController, we take data from the `calculatorService` (persistent) and send it as JSON to Python. 

```javascript
function saveSampleAndPowerData()
{
    var projectname = authService.sqlprojects.selected.name;
    toolsScope.save_status = 0;
    
    var data     = calculatorService.data;
    data.test    = toolsScope.design.stat.selectedOption.name;
    data.user_id = authService.user_id;
    data.project = projectname;
     
    if (toolsScope.design.isNone() || toolsScope.groupError==true || toolsScope.treatmentError==true || data.es==0 || !data.es || !data.pow || !data.samplesize || !data.sig || !data.groups){
        console.log("ERROR: invalid input value")
        toolsScope.save_status = 2
        $timeout(function(){toolsScope.save_status = 0}, 3000);
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
```

## Graphs

In the saveToolsController, we take data from the `plotsService` (persistent), generate graph(s) by converting SVG (D3 data) to PNG, and send this PNG data and contextual data as JSON to Python. 

```javascript
function savePlots()
{
    var svgElements = document.getElementsByTagName("svg");

    var dataURI = new Array(svgElements.length);
    var options = {scale: 0.75, canvg:window.canvg};       // change size of second plot (simulations)
    
    var getUriData =  function(index) {
        var def = $q.defer();
        svgAsPngUri(svgElements[index], options, function(uri2) {
            dataURI[index] = uri2;
            def.resolve();
        });
        return def.promise;
    };
    
    var promiseVector = [];
    for(var ii=0; ii<dataURI.length; ii++){
        promiseVector.push( getUriData(ii) );
    }
    
    // Return as a promise, that is, make sure everything returns before moving on to http
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
```


## Design Guide
