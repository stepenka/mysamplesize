# module_tools/

----------
## calculatorService
----------
Controls pre-Python calculations (e.g. product of the number of groups) and used mainly for Sample and Power size calculations.

* Services Used
    * [designService](./module_designguide#designService)
    
* Used by controllers
    * [designguideController](./module_designguide#designguideController)
    * [helpToolsController](./module_help#helpToolsController)
    * [saveToolsController](./module_save#saveToolsController)
    * [powerPlotsController](#powerPlotsController)
    * [simPlotCtrl](#simPlotCtrl)
    * [toolsController](#toolsController)
    

----------
## toolsController
----------

Controls power and sample size calculations, and is the parent controller for all tools. (It probably doesn't *need* to be the parent, but that's how it is right now.) 

* Services Used
    * [calculatorService](./#calculatorService)
    * [designService](./module_designguide#designService)
    
* Routes
    * [design_guide](../routes.js#design_guide) (on Sample Size tab)
    * [tools.home](../routes.js)
    * [tools.pwrgraph](../routes.js#tools.pwrgraph)
    * [tools.samplesize](../routes.js#tools.samplesize)
    * [tools.powersize](../routes.js#tools.powersize)
    * [tools.rng](../routes.js#tools.rng)
    * [tools.analysis](../routes.js#tools.analysis)


----------
## analysisController
----------
Controls the file input for data analysis. The actual plotting is still controlled by [simPlotCtrl](#simPlotCtrl).

* Services Used
    * None

* Routes
    * [tools.analysis](../routes.js#tools.analysis)
    
----------
## powerPlotsController
----------

Controls the power plots.

* Services Used
    * [calculatorService](./module_tools#calculatorService)
    * [designService](./module_designguide#designService)
    * [plotsService](./module_save#plotsService)

* Routes
    * [design_guide](../routes.js#design_guide) (on Sample Size tab)
    * [tools.pwrgraph](../routes.js#tools.pwrgraph)

----------
## rngController
----------

Controls the random number table generator.

* Services Used
    * None
    
* Routes
    * [tools.rng](../routes.js#tools.rng)
    
----------
## simPlotCtrl
----------

Generates simulation and data analysis plots in D3 after calling the server.
 
* Services Used
    * [calculatorService](#calculatorService)
    * [designService](./module_designguide#designService)
    * [plotsService](./module_save#plotsService)
    
* Routes
    * [design_guide](../routes.js#design_guide) (on Sample Size tab)
    * [tools.sims](../routes.js#tools.sims)
