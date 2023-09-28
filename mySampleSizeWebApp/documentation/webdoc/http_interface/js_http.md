# Controllers and Services that call the server {docsify-ignore}
_____________

On this page we outline which controllers are responsible for calling Python routes, of which the full list of routes can be found [here](routes.py). The controllers (which call the server through `$http`) are responsible for sending and getting data for the server to process.

List of the controllers detailed in this page

* [myAccountController](controllers_and_services/module_auth#myAccountController)
* [stripeController](controllers_and_services/module_auth#stripeController)
* [userProjectsController](controllers_and_services/module_auth#userProjectsController)
* [designguideController](controllers_and_services/module_designguide#designguideController)
* [contactFormController](controllers_and_services/module_help#contactFormController)
* [helpPlotsController](controllers_and_services/module_help#helpPlotsController)
* [reportSupplementController](controllers_and_services/module_reports#reportSupplementController)
* [saveToolsController](controllers_and_services/module_save#saveToolsController)
* [analysisController](controllers_and_services/module_tools#analysisController)
* [powerPlotsController](controllers_and_services/module_tools#powerPlotsController)
* [rngController](controllers_and_services/module_tools#rngController)
* [simPlotCtrl](controllers_and_services/module_tools#simPlotCtrl)
* [toolsController](controllers_and_services/module_tools#toolsController)
* [authService](controllers_and_services/module_auth#authService)

Note that items which have "query args" means that this is a "GET" request to the server. When this data is fetched, the actual url looks like:
```
http://www.<domain_name>/url_to_fetch?arg1=val1&arg2=val2&arg3=val3
```
More specifically, the `user_id` argument used comes from Auth0's unique user id, and is used to fetch data from all tables in the database.

_____________

## myAccountController
* [/change_password](routes.py#change_password)
* [/cancel_subscription](routes.py#cancel_subscription)
    * Query args: `user_id`
* [/stripe-update-pay](routes.py#stripe-update-pay)

## stripeController
* [/get_coupon](routes.py#get_coupon)
* [/get_stripe_plans](routes.py#get_stripe_plans)
* [/stripe-pay-new-account](routes.py#stripe-pay-new-account)
* [/stripe-pay-existing-customer](routes.py#stripe-pay-existing-customer)

## userProjectsController
* [/newproject](routes.py#newproject)
    * Query args: `user_id, project`
* [/deleteproject](routes.py#deleteproject)
    * Query args: `user_id, project`
* [/renameproject](routes.py#renameproject)
    * Query args: `user_id, project, newname`
* [/toolsHTML](routes.py#toolsHTML)
    * Query args: `user_id, project, rowid, table`
* [/deleteSubProject](routes.py#deleteSubProject)

## designguideController
* [/update_design_summary](routes.py#update_design_summary)

## contactFormController
* [/contact](routes.py#contact)

## helpPlotsController
* [/tools_demos](routes.py#tools_demos)

## reportSupplementController
* [/compute_latex](routes.py#compute_latex)

## saveToolsController
* [/saveUserData](routes.py#saveUserData)

## analysisController
* [/uploadCSV](routes.py#uploadCSV)

## powerPlotsController
* [/power_plot_calc](routes.py#power_plot_calc)

## rngController
* [/rng_table](routes.py#rng_table)

## simPlotCtrl
* [/sim_plot_calc](routes.py#sim_plot_calc)

## toolsController
* [/calculate](routes.py#calculate)

__________________________
## authService
* [/get_stripe_account_info](routes.py#get_stripe_account_info)
* [/sqlprojects](routes.py#sqlprojects)
    * Query args: `user_id`
* [/check_auth](routes.py#check_auth)
