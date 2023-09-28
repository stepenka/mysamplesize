# Routes

This outlines all the routes - defined by ui-sref - grouped by general page
_________
## design_guide
No child routes; only tabs to navigate different parts of the guide.

* Controllers
    * [designguideController](../controllers_and_services/module_designguide#designguidecontroller)
    * [toolsController](../controllers_and_services/module_tools#toolsController)
    * [simPlotCtrl](../controllers_and_services/module_tools#simPlotCtrl)
    * [powerPlotsController](../controllers_and_services/module_tools#powerPlotsController)

_________
## Tools

| ui-sref name    | Controller(s)   |    Description  |
| ---------   | ----------- | ----------- |
| <span id="tools.samplesize">tools.samplesize</span> | [toolsController](../controllers_and_services/module_tools#toolsController) | Sample Size calculator
| <span id="tools.powersize">tools.powersize</span> | [toolsController](../controllers_and_services/module_tools#toolsController) | Statistical Power calculator
| <span id="tools.pwrgraph">tools.pwrgraph</span> | [toolsController](../controllers_and_services/module_tools#toolsController) <br> [powerPlotsController](../controllers_and_services/module_tools#powerPlotsController) | Power plots
| <span id="tools.analysis">tools.analysis</span> | [toolsController](../controllers_and_services/module_tools#toolsController) <br> [simPlotCtrl](../controllers_and_services/module_tools#simPlotCtrl) <br> [analysisController](../controllers_and_services/module_tools#analysisController) | Data Analysis
| <span id="tools.sims">tools.sims</span> | [toolsController](../controllers_and_services/module_tools#toolsController) <br> [simPlotCtrl](../controllers_and_services/module_tools#simPlotCtrl) | Simulation 
| <span id="tools.rng">tools.rng</span> | [toolsController](../controllers_and_services/module_tools#toolsController) <br> [rngController](../controllers_and_services/module_tools#rngController) | Random Number generator / balanced design table

_________
## Auth

| ui-sref name    | Controller(s)   |    Description  |
| ---------   | ----------- | ----------- |
| <span id="auth.signup">auth.signup</span>
| <span id="auth.home">auth.home</span>


_________
## Account

| ui-sref name    | Controller(s)   |    Description  |
| ---------   | ----------- | ----------- |
| <span id="account.home">account.home</span>
| <span id="account.billing">account.billing</span>
| <span id="account.update">account.update</span>
| <span id="account.projects">account.projects</span>

_________
## Report

| ui-sref name    | Controller(s)   |    Description  |
| ---------   | ----------- | ----------- |
| <span id="report.home">report.home</span>
| <span id="report.supplement">report.supplement</span>
| <span id="report.checklist">report.checklist</span>
| <span id="report.user">report.user</span>
| <span id="report.power">report.power</span>
| <span id="report.design">report.design</span>

_________
## Help

| ui-sref name    | Controller(s)   |    Description  |
| ---------   | ----------- | ----------- |
| <span id="help.home">help.home</span> | none | Home page
| <span id="help.faq">help.faq</span> | none | FAQ
| <span id="help.glossary">help.glossary</span> | none | Glossay of terms, references
| <span id="help.case">help.case</span> | none | Case Studies
| <span id="help.contact">help.contact</span> | none | Email form to contact us at info@consiliastats.com
| <span id="help.designtype">help.designtype</span> | none | Design Types
| <span id="help.tutorial">help.tutorial</span> | none | Website tutorial
| <span id="help.stattests">help.stattests</span> | none | Different statistical tests
| <span id="help.statbasics">help.statbasics</span> | none | Statistical basics such as effect size, sample size, power, etc.
| help. | none | 


