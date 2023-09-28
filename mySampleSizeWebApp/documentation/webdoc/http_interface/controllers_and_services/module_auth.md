# module_auth/

----------
## authService
----------

* Services Used
    * None
    
* Used by controllers
    * root controller
    * [myAccountController](./module_auth#myAccountController)
    * [stripeController](./module_auth#stripeController)
    * [stripeService](./module_auth#stripeService)
    * [userProjectsController](./module_auth#userProjectsController)
    * [designguideController](./module_designguide#designguideController)
    * [reportsController](./module_reports#reportsController)
    * [saveToolsController](./module_save#saveToolsController)

----------
## stripeService
----------

* Services Used
    * [authService](./module_auth#authService)

* Used by controllers
    * [myAccountController](./module_auth#myAccountController)
    * [stripeController](./module_auth#stripeController)
    
----------
## myAccountController
----------
Controls the file input for data analysis

* Services Used
    * [authService](#authService)
    * [stripeService](#stripeService)

* Routes
    * [account.home](../routes.js#account.home)
    * [account.billing](../routes.js#account.billing)
    * [account.update](../routes.js#account.update)
    * [account.projects](../routes.js#account.projects)

----------
## stripeController
----------
* Services Used
    * [authService](#authService)
    * [stripeService](#stripeService)

stripeController is used for static/partials/webpage_auth/payment_form.html. This file is embedded/included within several different html files, whose routes come from the following:

* Routes
    * [account.billing](../routes.js#account.billing)
    * [auth.signup](../routes.js#auth.signup)

----------
## userProjectsController
----------

* Services Used
    * [authService](#authService)
    * [designService](module_designguide#designService)


stripeController is used solely in static/partials/webpage_reports/projects_list.html which is contained in static/partials/webpage_reports/report.user_projects.html. This file is included in the following routes:
* Routes
    * [account.projects](../routes.js#account.projects)
    * [report.user](../routes.js#report.user)
    