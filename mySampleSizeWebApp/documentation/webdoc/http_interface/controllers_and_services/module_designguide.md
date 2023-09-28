# module_designguide/

----------
## designService
----------
Contains information such as the currently chosen statistical test, treatment table, and most of the [Design Guide](../routes.js#design_guide) form information.

* Services Used
    * None
    
* Used by controllers / services
    * [userProjectsController](./module_auth#userProjectsController)
    * [designguideController](./#designguideController)
    * [reportsController](./module_reports#reportsController)
    * [reportSupplementController](./module_report#reportSupplementController)
    * [saveToolsController](./module_save#saveToolsController)
    * [calculatorService](./module_tools#calculatorService)
    * [powerPlotsController](./module_tools#powerPlotsController)
    * [simPlotCtrl](./module_tools#simPlotCtrl)
    * [toolsController](./module_tools#toolsController)
    * designGuideWalkthroughController

----------
## designguideController
----------
Controls the design guide and pushing of data to the server.

* Services Used
    * [designService](./#designService)
    * [calculatorService](./module_tools#calculatorService)

* Routes
    * [design_guide](../routes.js#design_guide)
