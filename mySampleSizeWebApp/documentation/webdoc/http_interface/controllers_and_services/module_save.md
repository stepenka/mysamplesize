# module_save/

----------
## plotsService
----------
Simply a place to hold onto contextual information for the power plots, simulation plots, and data analysis plots to use in database saving.

* Services Used
    * None

* Used by controllers
    * [saveToolsController](#saveToolsController)
    * [powerPlotsController](./module_tools#powerPlotsController)
    * [simPlotCtrl](./module_tools#simPlotCtrl)
    

----------
## saveToolsController
----------
Controller for clicking "Save" below each of the tools. Is is only used in static/partials/webpage_tools/tools.saveBtn.html, but that file is included in the following routes: 

* Services Used
    * [calculatorService](./module_tools#calculatorService)
    * [plotsService](#plotsService)

* Routes (all tools children)
    * [tools.home](../routes.js)
    * [tools.pwrgraph](../routes.js#tools.pwrgraph)
    * [tools.samplesize](../routes.js#tools.samplesize)
    * [tools.powersize](../routes.js#tools.powersize)
    * [tools.rng](../routes.js#tools.rng)
    * [tools.analysis](../routes.js#tools.analysis)


----------
## saveSvgAsPng
----------

This is here for documentation, but it is neither a service nor controller. The purpose of this file is to convert SVG data (from d3) to PNG information to save to the database. It is in this folder to identify it as belonging solely for saving purposes.

