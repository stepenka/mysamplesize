
# "Standalone" Python Code {docsify-ignore}

We will outline some of the important Python functions and how they are called (specifically, which [routes](routes.py) access them). Note that all these are contained in the `pyhelp/` folder.

_________________
## auth0_controller.py

This controls all backend access to Auth0.

| Function              | Caller(s)     |    Purpose  |
| ---------             | -----------   | ----------- |
| get_access_token      | All functions in auth0_controller.py (below) | Generate a "handshake" to allow us to access the Auth0 API
| find_user_by_id       | [/get_stripe_account_info](../routes.py#get_stripe_account_info) | Get Auth0 user information provided an id
| find_user_by_email    | [/stripe-pay-new-account](../routes.py#stripe-pay-new-account) | Find is Auth0 user exists provided an email
| create_user           | [/stripe-pay-new-account](../routes.py#stripe-pay-new-account) | Create a new Auth0 user 
| change_password       | [/change_password](../routes.py#change_password) | Change Auth0 login password 


____________________
## app_database.py

This controls information access to the sqlite3 database.

| Function              | Caller(s)     |    Purpose  |
| ---------             | -----------   | ----------- |
| makeNewUser       | [/stripe-pay-new-account](../routes.py#stripe-pay-new-account) | Create a new user in the database, including any placeholder data
| get_email         | Currently not used  |  Get user email based on id
| get_customer_id   | [/cancel_subscription](../routes.py#cancel_subscription) <br> [/get_stripe_account_info](../routes.py#get_stripe_account_info) <br> [/stripe-update-pay](../routes.py#stripe-update-pay) | Retrieve Stripe customer id from the database 
| getProjects       | [/deleteSubProject](../routes.py#deleteSubProject) <br> [/renameproject](../routes.py#renameproject) | Retrieve the full list of projects for a user from the database
| getSubProjects    | [/deleteSubProject](../routes.py#deleteSubProject) <br> [/renameproject](../routes.py#renameproject) | Retrieve the full list of subprojects for a user from the database
| makeNewProject    | [/newproject](../routes.py#newproject) | Create a new main project for a user in the database 
| deleteProject     | [/deleteproject](../routes.py#deleteproject) | Delete a project and any associated subprojects for a user in the database 
| deleteSubProject  | [/deleteSubProject](../routes.py#deleteSubProject) | Delete subproject for a user in the database 
| renameProject     | [/renameproject](../routes.py#renameproject) | Rename a project for a user in the database 
| saveSample        | [/saveUserData](../routes.py#saveUserData) | Save data to the `samplesize` table in the database 
| savePower         | [/saveUserData](../routes.py#saveUserData) | Save data to the `powersize` table in the database 
| saveGraph         | [/saveUserData](../routes.py#saveUserData) | Save data to the `graph` table in the database 
| saveDesignGuideToProject  | Currently not used | Save design guide data to a project
| saveDesignGuideTempData   | [/update_design_summary](../routes.py#update_design_summary) | Save/replace design guide data to the table for a user
| getDesignGuideTempData    | [/design_report_template](../routes.py#design_report_template) | Retrieve the design guide data for a user in the database
| getImgData        | Currently not used | Retrieve the image data from the `graph` table in the database 
| getToolsReportData | [/toolsPDF](../routes.py#toolsPDF) <br> [/toolsHTML](../routes.py#toolsHTML) | Retrieve the tools report data (from any of the `samplesize`, `powersize`, or `graph` tables)


____________________
## genCombinations.py

Used to generate all combinations (main, secondary, tertiary, etc. interactions) for the ANOVAs.

_________________
## helpFun.py

This controls the plotting for Statistical Basics. If caller is "self", I mean that it's only used as a support for other functions in this file.

| Function              | Caller(s)     |    Purpose  |
| ---------             | -----------   | ----------- |
| setBounds | self | 
| setDefaults | self |  
| sampSizer | [/tools_demos](../routes.py#tools_demos) |
| efctSizer | [/tools_demos](../routes.py#tools_demos) |
| sigLeveler | [/tools_demos](../routes.py#tools_demos) |
| stdever | [/tools_demos](../routes.py#tools_demos) |
| powerSizer | [/tools_demos](../routes.py#tools_demos) |
| setIndepSampTTest  | self | Used to return basic output for sigLeveler, efctSizer, sampSizer, stdever, powerSizer, sampSizer
| setThreeNormals | [/tools_demos](../routes.py#tools_demos) | For ANOVA means 
| efctSizerANOVA | [/tools_demos](../routes.py#tools_demos) |
| setFTest | self | Used in efctSizerANOVA 

Note that the "self" callers are used as a support for other functions in this file.
_________________
## makeLatex.py

This converts data from the ARRIVE Supplemental Report to LaTeX and/or PDF. If caller is "self", I mean that it's only used as a support for other functions in this file.

| Function    | Caller(s)   |    Purpose  |
| ---------   | ----------- | ----------- |
| stringIt    | self        | Convert a dict to a string for LaTeX printing
| makeLatex   | [/compute_latex](../routes.py#compute_latex) 

Note that the "self" callers are used as a support for other functions in this file.

The latax are used in Supplemental Report. Users can either download the report in latex file or PDF. 
_________________
## old_r_interface_fns.py

This contains interface functions for calling (mostly deprecated) R code. Other than the power plots, which are maintained in R for speed, the other functions are no longer used. 


| Function    | Caller(s)   |    Purpose  |
| ---------   | ----------- | ----------- |
| tools_demos_R | none  | Previously used in the Help section 
| power_plot_calc_R | [/power_plot_calc](../routes.py#power_plot_calc) | Compute data for generating power plots
| rng_table_R | none | Create the randomized balanced design tables
| sim_plot_calc_R | none | Generate data for simulations plots

_________________
## recurList.py

It is a recursive function.

| Function    | Caller(s)   |    Purpose  |
| ---------   | ----------- | ----------- |
| recurList | Code in [old_r_interface_fns.py](./by_file#old_r_interface_fns.py) | Convert R data and arrays to Python-formatted numpy

_________________
## powerCalc.py

Power and sample size calculations. This file also contains functions for generating power plot data, but since they are currently done in R, I am not including these in the table below.

| Function    | Caller(s)   |    Purpose  |
| ---------   | ----------- | ----------- |
| oneAOV_solver | [/calculate](../routes.py#calculate) | Solve for power or sample size for 1-Way ANOVA
| twoAOV_solver | [/calculate](../routes.py#calculate) | Solve for power or sample size for 2-Way ANOVA
| AOVM_solver | [/calculate](../routes.py#calculate) | Solve for power or sample size for Multi-Way ANOVA
| rmPS1_solver | [/calculate](../routes.py#calculate) | Solve for power or sample size for Repeated Measures ANOVA
| rmCS1_solver | [/calculate](../routes.py#calculate) | Solve for power or sample size for Crossover

_________________
## stripe_payments.py

Functions for handling the Stripe API.

| Function    | Caller(s)   |    Purpose  |
| ---------   | ----------- | ----------- |
| create_customer | self    | Create a new customer from email and (optional) credit card token
| create_subscription | self <br> [/stripe-pay-existing-customer](../routes.py#/stripe-pay-existing-customer) | Create a subscription based on customer id
| create_subscription_from_coupon | self | Create a subscription for a customer with a coupon applied
| update_customer | [/stripe-update-pay](../routes.py#stripe-update-pay) | Update a customer's payment method
| cancel_subscription | [/cancel_subscription](../routes.py#cancel_subscription) | Cancel a customer's subscription. By default, the subscription is carried out through the end of the billing period.
| create_and_charge_customer | [/stripe-pay-new-account](../routes.py#stripe-pay-new-account) | Create a new Stripe customer with a subscription and payment token
| create_group_customer | [/stripe-pay-new-account](../routes.py#stripe-pay-new-account) | Create a new Stripe customer and subscription based on a license code
| update_as_group_customer | [/stripe-pay-existing-customer](../routes.py#/stripe-pay-existing-customer) | Create a new subscription for a customer based on a license code
| get_customer_info | [/get_stripe_account_info](../routes.py#get_stripe_account_info) | Get the information associated with a Stripe customer id

_________________
## simCalcDriver.py

simCalcDriver.py access functions in the subfolder `simCalc/`, whose files and functions I will not address here. (Documentation todo)

| Function    | Caller(s)   |    Purpose  |
| ---------   | ----------- | ----------- |
| threeWayANOVA | [/sim_plot_calc](../routes.py#sim_plot_calc) | Compute simulation or data analysis data for 3-Way ANOVA
| twoWayANOVA | [/sim_plot_calc](../routes.py#sim_plot_calc) | Compute simulation or data analysis data for 2-Way ANOVA
| oneWayANOVA | [/sim_plot_calc](../routes.py#sim_plot_calc) | Compute simulation or data analysis data for 1-Way ANOVA
| twoSampleT | [/sim_plot_calc](../routes.py#sim_plot_calc) | Compute simulation or data analysis data for the Two-Sample (Independent Sample) T-Test

