# module_help/

----------
## contactFormController
----------
For sending an email through the website to contact us.

* Services Used
    * None
    
* Routes
    * [help.contact](../routes.js#help.contact)

----------
## helpController
----------
This is simply for organizing all the different headers and subsections with uib-tabs

* Services Used
    * None

* Routes (all Help children)
    * [help.home](../routes.js#help.home)
    * [help.faq](../routes.js#help.faq)
    * [help.glossary](../routes.js#help.glossary)
    * [help.case](../routes.js#help.case)
    * [help.contact](../routes.js#help.contact)
    * [help.designtype](../routes.js#help.designtype)
    * [help.tutorial](../routes.js#help.tutorial)
    * [help.stattests](../routes.js#help.stattests)
    * [help.statbasics](../routes.js#help.statbasics)

----------
## helpPlotsController
----------
Used for interfacing the graphics and simulation plots in Help with [simPlotCtrl](./module_tools#simPlotCtrl) and the server.

* Services Used
    * None

* Routes
    * [help.statbasics](../routes.js#help.statbasics)

----------
## helpEffectController
----------
Used for calculating effect size in the Help section

* Services Used
    * None

* Routes
    * [help.statbasics.effect_cohen](../routes.js#help.statbasics)  (check this link)
    
