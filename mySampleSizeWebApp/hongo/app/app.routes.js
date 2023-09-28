app.config(['$stateProvider', 
 function ($stateProvider) { $stateProvider 
.state('home', 
{"data": {"requireLogin": false}, "meta_desc": "Your Science. Our Tools. Fast Results.", "ncyBreadcrumb": {"label": "MySampleSize", "skip": true}, "templateUrl": "static/partials//homepage.html", "url": "/"})

 //---------------------- 
.state('error', 
{"ncyBreadcrumb": {"label": "Error"}, "templateUrl": "static/partials/webpage_core/404.html", "url": "/404.html"})

 //---------------------- 
.state('design_guide', 
{"controller": "designguideController", "data": {"requireLogin": true}, "meta_desc": "A step-by-step guide to designing your study.", "ncyBreadcrumb": {"label": "Design Guide"}, "url": "/design_guide", "resolve": {
"promise1": ['authService', function(authService){
    return authService.hasHandledInfo();
}],
 },

 "templateProvider":  function($templateRequest, $rootScope) { if( $rootScope.has_access() ){ return $templateRequest('static/partials/webpage_design/design.guide.html') } else{ return $templateRequest('static/partials/webpage_design/design.guide.noauth.html') } }})

 //---------------------- 
.state('tools', 
{"abstract": true, "controller": "toolsController", "data": {"requireLogin": false}, "templateUrl": "static/partials//tools.html", "url": "/tools"})

 //---------------------- 
.state('tools.home', 
{"meta_desc": "MySampleSize Tools: calculate sample size, statistical power, and simulate a study", "ncyBreadcrumb": {"label": "Tools Home"}, "templateUrl": "static/partials/webpage_tools/tools.home.html", "url": "/"})

 //---------------------- 
.state('tools.samplesize', 
{"data": {"requireLogin": true}, "meta_desc": "Calculate your sample size with this easy-to-use interface.", "ncyBreadcrumb": {"label": "Sample Size", "parent": "tools.home"}, "url": "/sample_size", "resolve": {
"promise1": ['authService', function(authService){
    return authService.hasHandledInfo();
}],
 },

 "templateProvider":  function($templateRequest, $rootScope) { if( $rootScope.has_access() ){ return $templateRequest('static/partials/webpage_tools/tools.skel.html') } else{ return $templateRequest('static/partials/webpage_tools/tools.skel.noauth.html') } }})

 //---------------------- 
.state('tools.powersize', 
{"data": {"requireLogin": true}, "meta_desc": "Calculate your statistical power based on a given sample size.", "ncyBreadcrumb": {"label": "Statistical Power", "parent": "tools.home"}, "url": "/power_size", "resolve": {
"promise1": ['authService', function(authService){
    return authService.hasHandledInfo();
}],
 },

 "templateProvider":  function($templateRequest, $rootScope) { if( $rootScope.has_access() ){ return $templateRequest('static/partials/webpage_tools/tools.skel.html') } else{ return $templateRequest('static/partials/webpage_tools/tools.skel.noauth.html') } }})

 //---------------------- 
.state('tools.pwrgraph', 
{"data": {"requireLogin": true}, "meta_desc": "Explore the tradeoff between power and sample size.", "ncyBreadcrumb": {"label": "Power Plots", "parent": "tools.home"}, "url": "/power_graph", "resolve": {
"promise1": ['authService', function(authService){
    return authService.hasHandledInfo();
}],
 },

 "templateProvider":  function($templateRequest, $rootScope) { if( $rootScope.has_access() ){ return $templateRequest('static/partials/webpage_tools/tools.skel.html') } else{ return $templateRequest('static/partials/webpage_tools/tools.skel.noauth.html') } }})

 //---------------------- 
.state('tools.rng', 
{"controller": "rngController", "meta_desc": "Random number generator for blocking your experimental design", "ncyBreadcrumb": {"label": "Random Number Generator", "parent": "tools.home"}, "templateUrl": "static/partials/webpage_tools/tools.skel.html", "url": "/rng"})

 //---------------------- 
.state('tools.analysis', 
{"data": {"requireLogin": true}, "meta_desc": "Data analysis", "ncyBreadcrumb": {"label": "Data analysis", "parent": "tools.home"}, "url": "/analysis", "resolve": {
"promise1": ['authService', function(authService){
    return authService.hasHandledInfo();
}],
 },

 "templateProvider":  function($templateRequest, $rootScope) { if( $rootScope.has_access() ){ return $templateRequest('static/partials/webpage_tools/tools.skel.html') } else{ return $templateRequest('static/partials/webpage_tools/tools.skel.noauth.html') } }})

 //---------------------- 
.state('tools.sims', 
{"data": {"requireLogin": true}, "meta_desc": "Simulate outcomes of your study.", "ncyBreadcrumb": {"label": "Simulations", "parent": "tools.home"}, "url": "/simulations", "resolve": {
"promise1": ['authService', function(authService){
    return authService.hasHandledInfo();
}],
 },

 "templateProvider":  function($templateRequest, $rootScope) { if( $rootScope.has_access() ){ return $templateRequest('static/partials/webpage_tools/tools.skel.html') } else{ return $templateRequest('static/partials/webpage_tools/tools.skel.noauth.html') } }})

 //---------------------- 
.state('tools.report', 
{"controller": "reportsController", "data": {"requireLogin": true}, "meta_desc": "Generate a report of our power and sample size calculations to submit for your proposal", "ncyBreadcrumb": {"label": "Summary Report", "parent": "tools.home"}, "url": "/report", "resolve": {
"promise1": ['authService', function(authService){
    return authService.hasHandledInfo();
}],
 },

 "templateProvider":  function($templateRequest, $rootScope) { if( $rootScope.has_access() ){ return $templateRequest('static/partials/webpage_reports/report.tools.html') } else{ return $templateRequest('static/partials/webpage_reports/report.tools.noauth.html') } }})

 //---------------------- 
.state('auth', 
{"abstract": true, "data": {"requireLogin": false}, "templateUrl": "static/partials//auth.html", "url": "/auth"})

 //---------------------- 
.state('auth.home', 
{"ncyBreadcrumb": {"label": "Account"}, "templateUrl": "static/partials/webpage_auth/home.html", "url": "/home"})

 //---------------------- 
.state('auth.signup', 
{"ncyBreadcrumb": {"label": "Sign Up"}, "templateUrl": "static/partials/webpage_auth/signup.html", "url": "/signup"})

 //---------------------- 
.state('auth.logout', 
{"ncyBreadcrumb": {"label": "Logout"}, "templateUrl": "static/partials/webpage_auth/logout.html", "url": "/logout.html"})

 //---------------------- 
.state('account', 
{"abstract": true, "controller": "myAccountController", "data": {"requireLogin": true}, "ncyBreadcrumb": {"label": "My Account"}, "templateUrl": "static/partials//auth.html", "url": "/account", "resolve": {
"promise1": ['authService', function(authService){
    return authService.hasHandledInfo();
}],
 },
})

 //---------------------- 
.state('account.home', 
{"ncyBreadcrumb": {"label": "My Account", "parent": "account"}, "templateUrl": "static/partials/webpage_auth/account.html", "url": "/"})

 //---------------------- 
.state('account.billing', 
{"ncyBreadcrumb": {"label": "Billing", "parent": "account.home"}, "templateUrl": "static/partials/webpage_auth/account.payment.html", "url": "/billing"})

 //---------------------- 
.state('account.update', 
{"ncyBreadcrumb": {"label": "Change Password", "parent": "account.home"}, "templateUrl": "static/partials/webpage_auth/account.update_password.html", "url": "/update"})

 //---------------------- 
.state('account.projects', 
{"ncyBreadcrumb": {"label": "Projects", "parent": "account.home"}, "templateUrl": "static/partials/webpage_reports/report.user_projects.html", "url": "/projects"})

 //---------------------- 
.state('report', 
{"abstract": true, "controller": "reportsController", "data": {"requireLogin": false}, "templateUrl": "static/partials//report.html", "url": "/report"})

 //---------------------- 
.state('report.home', 
{"ncyBreadcrumb": {"label": "Reports"}, "templateUrl": "static/partials/webpage_reports/report.home.html", "url": "/"})

 //---------------------- 
.state('report.supplement', 
{"controller": "reportSupplementController", "ncyBreadcrumb": {"label": "Supplement", "parent": "report.home"}, "templateUrl": "static/partials/webpage_reports/report.supplement.html", "url": "/supplement"})

 //---------------------- 
.state('report.checklist', 
{"ncyBreadcrumb": {"label": "Checklist", "parent": "report.home"}, "templateUrl": "static/partials/webpage_reports/report.checklist.html", "url": "/checklist"})

 //---------------------- 
.state('report.user', 
{"data": {"requireLogin": true}, "ncyBreadcrumb": {"label": "User Projects", "parent": "report.home"}, "url": "/userprojects", "resolve": {
"promise1": ['authService', function(authService){
    return authService.hasHandledInfo();
}],
 },

 "templateProvider":  function($templateRequest, $rootScope) { if( $rootScope.has_access() ){ return $templateRequest('static/partials/webpage_reports/report.user_projects.html') } else{ return $templateRequest('static/partials/webpage_reports/report.user_projects.noauth.html') } }})

 //---------------------- 
.state('report.power', 
{"data": {"requireLogin": true}, "ncyBreadcrumb": {"label": "Sample Size and Power", "parent": "report.home"}, "url": "/power", "resolve": {
"promise1": ['authService', function(authService){
    return authService.hasHandledInfo();
}],
 },

 "templateProvider":  function($templateRequest, $rootScope) { if( $rootScope.has_access() ){ return $templateRequest('static/partials/webpage_reports/report.tools.html') } else{ return $templateRequest('static/partials/webpage_reports/report.tools.noauth.html') } }})

 //---------------------- 
.state('help', 
{"abstract": true, "controller": "HelpCtrl", "data": {"requireLogin": false}, "templateUrl": "static/partials//help.html", "url": "/help"})

 //---------------------- 
.state('help.home', 
{"data": {"requireLogin": false}, "meta_desc": "Help on statistical basics, different types of tests, and case studies to use with our tools.", "ncyBreadcrumb": {"label": "Help"}, "templateUrl": "static/partials/webpage_help/help.home.html", "url": "/"})

 //---------------------- 
.state('help.faq', 
{"data": {"requireLogin": false}, "ncyBreadcrumb": {"label": "FAQ", "parent": "help.home"}, "templateUrl": "static/partials/webpage_help/help.faq.html", "url": "/faq"})

 //---------------------- 
.state('help.glossary', 
{"ncyBreadcrumb": {"label": "Glossary", "parent": "help.home"}, "templateUrl": "static/partials/webpage_help/help.glossary.html", "url": "/glossary"})

 //---------------------- 
.state('help.case', 
{"meta_desc": "Real case studies to explore our tools with.", "ncyBreadcrumb": {"label": "Case Studies", "parent": "help.home"}, "templateUrl": "static/partials/webpage_help/help.case.html", "url": "/casestudies"})

 //---------------------- 
.state('help.contact', 
{"meta_desc": "Need help or more information? Contact us!", "ncyBreadcrumb": {"label": "Contact Us"}, "templateUrl": "static/partials/webpage_help/help.contact.html", "url": "/contact_us"})

 //---------------------- 
.state('help.designtype', 
{"meta_desc": "Explore different design types (e.g. randomized, blocked, crossover)", "ncyBreadcrumb": {"label": "Design Types", "parent": "help.home"}, "templateUrl": "static/partials/webpage_help/designtype/design.type.main.html", "url": "/designtypes"})

 //---------------------- 
.state('help.tutorial', 
{"abstract": true, "meta_desc": "A tutorial on how to use all the tools on our site", "ncyBreadcrumb": {"label": "Tutorial", "parent": "help.home"}, "template": "<div ui-view autoscroll='True'></div>", "url": "/tutorial"})

 //---------------------- 
.state('help.stattests', 
{"abstract": true, "meta_desc": "Explore the difference between different tests, like T-Test, ANOVAs, and Repeated Measures.", "ncyBreadcrumb": {"label": "Statistical Tests", "parent": "help.home"}, "template": "<div ui-view autoscroll='True'></div>", "url": "/stattests"})

 //---------------------- 
.state('help.statbasics', 
{"abstract": true, "controller": "basicsPlotCtrl", "meta_desc": "Statistical basics with an emphasis on effect size, sample size, and power", "ncyBreadcrumb": {"label": "Statistical Basics", "parent": "help.home"}, "template": "<div ui-view autoscroll='True'></div>", "url": "/statbasics"})

 //---------------------- 
.state('help.tutorial.home', { "url": '/',"templateUrl": 'static/partials/webpage_help/tutorial/tutorial.main.html', 
"ncyBreadcrumb": {"parent": 'help.home',"label": 'Tutorial'} }) 
.state('help.tutorial.overview', {"url": '/overview',"templateUrl": 'static/partials/webpage_help/tutorial/tutorial.overview.html', 
"ncyBreadcrumb": { 
    "parent": 'help.tutorial.home', 
    "label": 'Overview'} 
}) 
 .state('help.tutorial.designguide', {"url": '/designguide',"templateUrl": 'static/partials/webpage_help/tutorial/tutorial.designguide.html', 
"ncyBreadcrumb": { 
    "parent": 'help.tutorial.home', 
    "label": 'Design Guide'} 
}) 
 .state('help.tutorial.tools', {"url": '/tools',"templateUrl": 'static/partials/webpage_help/tutorial/tutorial.tools.html', 
"ncyBreadcrumb": { 
    "parent": 'help.tutorial.home', 
    "label": 'Tools'} 
}) 
 .state('help.tutorial.reports', {"url": '/reports',"templateUrl": 'static/partials/webpage_help/tutorial/tutorial.reports.html', 
"ncyBreadcrumb": { 
    "parent": 'help.tutorial.home', 
    "label": 'Reports'} 
}) 
 .state('help.stattests.home', { "url": '/',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.main.html', 
"ncyBreadcrumb": {"parent": 'help.home',"label": 'Statistical Tests'} }) 
.state('help.stattests.overview', {"url": '/overview',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.overview.html', 
"ncyBreadcrumb": { 
    "parent": 'help.stattests.home', 
    "label": 'Overview'} 
}) 
 .state('help.stattests.sig', {"url": '/significance',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.sig.html', 
"ncyBreadcrumb": { 
    "parent": 'help.stattests.home', 
    "label": 'Significance and Power'} 
}) 
 .state('help.stattests.mean_std_es', {"url": '/mean_std_es',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.mean_std_es.html', 
"ncyBreadcrumb": { 
    "parent": 'help.stattests.home', 
    "label": 'Mean, Standard Deviation, and Effect Size'} 
}) 
 .state('help.stattests.ttest_def', {"url": '/ttest_def',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.ttest_def.html', 
"ncyBreadcrumb": { 
    "parent": 'help.stattests.home', 
    "label": 'Definitions'} 
}) 
 .state('help.stattests.t1', {"url": '/t1',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.t1.html', 
"ncyBreadcrumb": { 
    "parent": 'help.stattests.home', 
    "label": 'One-Sample T-Test'} 
}) 
 .state('help.stattests.t2', {"url": '/t2',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.t2.html', 
"ncyBreadcrumb": { 
    "parent": 'help.stattests.home', 
    "label": 'Paired T-Test'} 
}) 
 .state('help.stattests.tI', {"url": '/tI',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.tI.html', 
"ncyBreadcrumb": { 
    "parent": 'help.stattests.home', 
    "label": 'Independent-Sample T-Test'} 
}) 
 .state('help.stattests.anova_def', {"url": '/anova_def',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.anova_def.html', 
"ncyBreadcrumb": { 
    "parent": 'help.stattests.home', 
    "label": 'Definitions'} 
}) 
 .state('help.stattests.anova', {"url": '/anova',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.anova.html', 
"ncyBreadcrumb": { 
    "parent": 'help.stattests.home', 
    "label": 'ANOVA'} 
}) 
 .state('help.stattests.2anova', {"url": '/2anova',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.2anova.html', 
"ncyBreadcrumb": { 
    "parent": 'help.stattests.home', 
    "label": '2-Way ANOVA'} 
}) 
 .state('help.stattests.3anova', {"url": '/3anova',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.3anova.html', 
"ncyBreadcrumb": { 
    "parent": 'help.stattests.home', 
    "label": '3-Way ANOVA'} 
}) 
 .state('help.stattests.anova_rep', {"url": '/anova_rep',"templateUrl": 'static/partials/webpage_help/stattests/stat.test.anova_rep.html', 
"ncyBreadcrumb": { 
    "parent": 'help.stattests.home', 
    "label": 'Repeated Measures ANOVA'} 
}) 
 .state('help.statbasics.home', { "url": '/',"templateUrl": 'static/partials/webpage_help/statbasics/basics.main.html', 
"ncyBreadcrumb": {"parent": 'help.home',"label": 'Statistical Basics'} }) 


.state('standalone', {"url": '/standalone', "template": "<div ui-view autoscroll='True'></div>", "abstract": true, "controller": "basicsPlotCtrl"})

.state('help.statbasics.overview', {"url": '/overview',"templateUrl": 'static/partials/webpage_help/statbasics/basics.overview.html', 
"ncyBreadcrumb": { 
    "parent": 'help.statbasics.home', 
    "label": 'Overview'} 
}) 
 .state('standalone.overview', {"url": '/overview',"templateUrl": 'static/partials/webpage_help/statbasics/basics.overview.html', 
"ncyBreadcrumb": { 
    "label": 'Overview'} 
}) 
 .state('help.statbasics.sig', {"url": '/significance',"templateUrl": 'static/partials/webpage_help/statbasics/basics.sig.html', 
"ncyBreadcrumb": { 
    "parent": 'help.statbasics.home', 
    "label": 'Significance'} 
}) 
 .state('standalone.sig', {"url": '/significance',"templateUrl": 'static/partials/webpage_help/statbasics/basics.sig.html', 
"ncyBreadcrumb": { 
    "label": 'Significance'} 
}) 
 .state('help.statbasics.stdev', {"url": '/stdev',"templateUrl": 'static/partials/webpage_help/statbasics/basics.stdev.html', 
"ncyBreadcrumb": { 
    "parent": 'help.statbasics.home', 
    "label": 'Standard Deviation'} 
}) 
 .state('standalone.stdev', {"url": '/stdev',"templateUrl": 'static/partials/webpage_help/statbasics/basics.stdev.html', 
"ncyBreadcrumb": { 
    "label": 'Standard Deviation'} 
}) 
 .state('help.statbasics.groups', {"url": '/groups',"templateUrl": 'static/partials/webpage_help/statbasics/basics.groups.html', 
"ncyBreadcrumb": { 
    "parent": 'help.statbasics.home', 
    "label": 'Groups and Factors'} 
}) 
 .state('standalone.groups', {"url": '/groups',"templateUrl": 'static/partials/webpage_help/statbasics/basics.groups.html', 
"ncyBreadcrumb": { 
    "label": 'Groups and Factors'} 
}) 
 .state('help.statbasics.samplesize', {"url": '/samplesize',"templateUrl": 'static/partials/webpage_help/statbasics/basics.samplesize.html', 
"ncyBreadcrumb": { 
    "parent": 'help.statbasics.home', 
    "label": 'Sample Size'} 
}) 
 .state('standalone.samplesize', {"url": '/samplesize',"templateUrl": 'static/partials/webpage_help/statbasics/basics.samplesize.html', 
"ncyBreadcrumb": { 
    "label": 'Sample Size'} 
}) 
 .state('help.statbasics.effect', {"url": '/effect',"templateUrl": 'static/partials/webpage_help/statbasics/basics.effect.html', 
"ncyBreadcrumb": { 
    "parent": 'help.statbasics.home', 
    "label": 'Effect Size'} 
}) 
 .state('standalone.effect', {"url": '/effect',"templateUrl": 'static/partials/webpage_help/statbasics/basics.effect.html', 
"ncyBreadcrumb": { 
    "label": 'Effect Size'} 
}) 
 .state('help.statbasics.power', {"url": '/power',"templateUrl": 'static/partials/webpage_help/statbasics/basics.power.html', 
"ncyBreadcrumb": { 
    "parent": 'help.statbasics.home', 
    "label": 'power'} 
}) 
 .state('standalone.power', {"url": '/power',"templateUrl": 'static/partials/webpage_help/statbasics/basics.power.html', 
"ncyBreadcrumb": { 
    "label": 'power'} 
}) 
 .state('help.statbasics.effect_anova', {"url": '/effect_anova',"templateUrl": 'static/partials/webpage_help/statbasics/basics.effect_anova.html', 
"ncyBreadcrumb": { 
    "parent": 'help.statbasics.home', 
    "label": 'Effect Size in ANOVA'} 
}) 
 .state('standalone.effect_anova', {"url": '/effect_anova',"templateUrl": 'static/partials/webpage_help/statbasics/basics.effect_anova.html', 
"ncyBreadcrumb": { 
    "label": 'Effect Size in ANOVA'} 
}) 
 .state('help.statbasics.effect_cohen', {"url": '/effect_cohen',"templateUrl": 'static/partials/webpage_help/statbasics/basics.effect_cohen.html', 
"ncyBreadcrumb": { 
    "parent": 'help.statbasics.home', 
    "label": 'Cohen`s d and f Values'} 
}) 
 .state('standalone.effect_cohen', {"url": '/effect_cohen',"templateUrl": 'static/partials/webpage_help/statbasics/basics.effect_cohen.html', 
"ncyBreadcrumb": { 
    "label": 'Cohen`s d and f Values'} 
}) 
 }]); 
