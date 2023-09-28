# module_reports/

----------
## reportsController
----------
Used to call the server for a PDF of the report in question. This mostly uses  [authService](./module_auth#authService) to get the project and subproject to click on.

* Services Used
    * [designService](./module_designguide#designService)
    * [authService](./module_auth#authService)

* Routes
    * [tools.report](../routes.js#tools)
    * Report - all children
        * [report.home](../routes.js#report.home)
        * [report.supplement](../routes.js#report.supplement)
        * [report.checklist](../routes.js#report.checklist)
        * [report.user](../routes.js#report.user)
        * [report.power](../routes.js#report.power)
        * [report.design](../routes.js#report.design)

----------
## reportSupplementController
----------
Controller for the walkthrough ARRIVE form.

* Services Used
    * [designService](./module_designguide#designService)

* Routes (all tools children)
    * [report.supplement](../routes.js#report.supplement)

