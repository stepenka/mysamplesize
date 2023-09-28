#--------------------------------------------------------------
#   This file is used to generate the app.routes.js file
#   as well as sitemap.xml.
#--------------------------------------------------------------

import json, datetime, re

# globally open files for app.routes.js, sitemap.xml, and html5routes.py
py_routes_file  = open('./app/pyhelp/html5routes.py', 'w');
js_routes_file  = open('./app/app.routes.js', 'w');
sitemap_file    = open('./app/static/partials/webpage_core/sitemap.xml', 'w');
meta_data_file  = open('./app/structured_data/main.html', 'w');

partialPath = 'static/partials/';
path = {
    "base":           partialPath,
    "core":           partialPath+'webpage_core', 
    "auth":           partialPath+'webpage_auth', 
    "design":         partialPath+'webpage_design', 
    "tools":          partialPath+'webpage_tools', 
    "report":         partialPath+'webpage_reports',
    "help":           partialPath+'webpage_help',
    "tutorial":       partialPath+'webpage_help/tutorial', 
    "design_types":   partialPath+'webpage_help/designtype', 
    "stat_tests":     partialPath+'webpage_help/stattests', 
    "stat_basics":    partialPath+'webpage_help/statbasics', 
    "case_studies":   partialPath+'webpage_help/casestudies',
};

requireLocalLogin = True;

BASE_URL = "https://www.mysamplesize.com";

BASE_DATE = str( datetime.date.today() )

#from shutil import copyfile

def define_routes():
    #### Long list of routes .... 
    routes = [
        {'name': 'home',
            'url': '/', 
            'templateUrl': path["base"]+'/homepage.html',
            'data': { 'requireLogin': False },
            'ncyBreadcrumb': {
                'skip': True,
                'label': 'MySampleSize'
            },
            'meta_desc': 'Your Science. Our Tools. Fast Results.'
        },
        {'name': 'error',
            'url': '/404.html',
            'templateUrl': path["core"]+'/404.html',
            'ncyBreadcrumb': {'label': 'Error'}
        },
        {'name': 'design_guide',
            'url': '/design_guide',
            'templateUrl': path["design"]+'/design.guide.html',
            'data': { 'requireLogin': requireLocalLogin },
            'controller': 'designguideController',
            'ncyBreadcrumb': {
                'label': 'Design Guide'
            },
            'meta_desc': 'A step-by-step guide to designing your study.'
        },
        
        # ------------ Tools and its child states
        {'name' : 'tools',
            'abstract': True,
            'url': '/tools',
            'templateUrl': path["base"]+'/tools.html',
            'controller': 'toolsController',
            'data': { 'requireLogin': False },
            
            'children' : [
                {'name' : 'home',
                    'url': '/',
                    'templateUrl': path["tools"]+'/tools.home.html',
                    'ncyBreadcrumb': {
                        'label': 'Tools Home'
                    },
                    'meta_desc': 'MySampleSize Tools: calculate sample size, statistical power, and simulate a study'
                },
                {'name': 'samplesize',
                    'url': '/sample_size',
                    'templateUrl': path["tools"]+'/tools.skel.html',
                    'data': { 'requireLogin': requireLocalLogin },
                    'ncyBreadcrumb': {
                        'parent': 'tools.home',
                        'label': 'Sample Size'
                    },
                    'meta_desc': 'Calculate your sample size with this easy-to-use interface.'
                },
                {'name' : 'powersize', 
                    'url': '/power_size',
                    'templateUrl': path["tools"]+'/tools.skel.html',
                    'data': { 'requireLogin': requireLocalLogin },
                    'ncyBreadcrumb': {
                        'parent': 'tools.home',
                        'label': 'Statistical Power'
                    },
                    'meta_desc': 'Calculate your statistical power based on a given sample size.'
                }, 
                {'name': 'pwrgraph',
                    'url': '/power_graph',
                    'templateUrl': path["tools"]+'/tools.skel.html',
                    'data': { 'requireLogin': requireLocalLogin },
                    'ncyBreadcrumb': {
                        'parent': 'tools.home',
                        'label': 'Power Plots'
                    },
                    'meta_desc': 'Explore the tradeoff between power and sample size.'
                },
                {'name': 'rng',
                    'url': '/rng',
                    'templateUrl': path["tools"]+'/tools.skel.html',
                    'controller': "rngController",
                    'ncyBreadcrumb': {
                        'parent': 'tools.home',
                        'label': 'Random Number Generator'
                    },
                    'meta_desc': 'Random number generator for blocking your experimental design'
                },
                {'name': 'analysis',
                    'url': '/analysis',
                    'templateUrl': path["tools"]+'/tools.skel.html',
                    'data': { 'requireLogin': requireLocalLogin },
                    'ncyBreadcrumb': {
                        'parent': 'tools.home',
                        'label': 'Data analysis'
                    },
                    'meta_desc': 'Data analysis'
                },
                {'name' : 'sims',
                    'url': '/simulations',
                    'templateUrl': path["tools"]+'/tools.skel.html',
                    'data': { 'requireLogin': requireLocalLogin },
                    'ncyBreadcrumb': {
                        'parent': 'tools.home',
                        'label': 'Simulations'
                    },
                    'meta_desc': 'Simulate outcomes of your study.'
                },
                {'name': 'report',
                    'url': '/report',
                    'templateUrl': path["report"]+'/report.tools.html',
                    'controller': 'reportsController',
                    'data': { 'requireLogin': requireLocalLogin },
                    'ncyBreadcrumb': {
                        'parent': 'tools.home',
                        'label': 'Summary Report'
                    },
                    'meta_desc': 'Generate a report of our power and sample size calculations to submit for your proposal'
                }                
            ]
        },
        
        #------------- Authentication and its child states
        {'name': 'auth',
            'url': '/auth',
            'abstract': True,
            'templateUrl': path["base"]+'/auth.html',
            'data': { 'requireLogin': False },
            
            'children': [
                {'name': 'home',
                    'url': '/home',
                    'templateUrl': path["auth"]+'/home.html',
                    'ncyBreadcrumb': {
                        'label': 'Account'
                    }
                }, 
                {'name': 'signup',
                    'url': '/signup',
                    'templateUrl': path["auth"]+'/signup.html',
                    'ncyBreadcrumb': {
                        'label': 'Sign Up'
                    }
                },
                {'name': 'logout',
                    'url': '/logout.html',
                    'templateUrl': path["auth"]+'/logout.html',
                    'ncyBreadcrumb': {
                        'label': 'Logout'
                    }
                }
            ]
        },
        
        #----------------- Account / logged in and child states
        {'name': 'account',
            'url': '/account',
            'abstract': True,
            'controller': 'myAccountController',
            'templateUrl': path["base"]+'/auth.html',
            'data': { 'requireLogin': True },
            'ncyBreadcrumb': {
                'label': 'My Account',
            },
            
            'children' : [
                {'name': 'home',
                    'url': '/',
                    'templateUrl': path["auth"]+'/account.html',
                    'ncyBreadcrumb': {
                        'label': 'My Account',
                        'parent': 'account',
                    }
                },
                {'name': 'billing',
                    'url': '/billing',
                    'templateUrl': path["auth"]+'/account.payment.html',
                    'ncyBreadcrumb': {
                        'label': 'Billing',
                        'parent': 'account.home'
                    }
                },
                {'name': 'update',
                    'url': '/update',
                    'templateUrl': path["auth"]+'/account.update_password.html',
                    'ncyBreadcrumb': {
                        'label': 'Change Password',
                        'parent': 'account.home'
                    }
                },
                {'name': 'projects',
                    'url': '/projects',
                    'templateUrl': path["report"]+'/report.user_projects.html',
                    'ncyBreadcrumb': {
                        'label': 'Projects',
                        'parent': 'account.home'
                    }
                }
            ]
        },
        
        #---------- Reports 
        {'name': 'report',
            'abstract': True,
            'url': '/report',
            'templateUrl': path["base"]+'/report.html',
            'controller': 'reportsController',
            'data': { 'requireLogin': False },

            'children' : [
                {'name': 'home',
                    'url': '/',
                    'templateUrl': path["report"]+'/report.home.html',
                    'ncyBreadcrumb': {
                        'label': 'Reports'
                    }
                },
                {'name': 'supplement',
                    'url': '/supplement',
                    'controller': 'reportSupplementController',
                    'templateUrl': path["report"]+'/report.supplement.html',
                    'ncyBreadcrumb': {
                        'parent': 'report.home',
                        'label': 'Supplement'
                    },
                },
                {'name': 'checklist',
                    'url': '/checklist',
                    'templateUrl': path["report"]+'/report.checklist.html', 
                    'ncyBreadcrumb': {
                        'parent': 'report.home',
                        'label': 'Checklist'
                    }
                },
                {'name': 'user',
                    'url': '/userprojects',
                    'templateUrl': path["report"]+'/report.user_projects.html', 
                    'data': { 'requireLogin': requireLocalLogin },
                    'ncyBreadcrumb': {
                        'parent': 'report.home',
                        'label': 'User Projects'
                    }
                },
                {'name': 'power',
                    'url': '/power',
                    'templateUrl': path["report"]+'/report.tools.html', 
                    'data': { 'requireLogin': requireLocalLogin },
                    'ncyBreadcrumb': {
                        'parent': 'report.home',
                        'label': 'Sample Size and Power'
                    }
                }
            ]
        },
        
        #------------ Help pages
        {'name': 'help', 
            'abstract': True,
            'url': '/help',
            'controller': 'HelpCtrl',
            'templateUrl': path["base"]+'/help.html',
            'data': { 'requireLogin': False },

            'children' : [
                {'name': 'home', 
                    'url': '/',
                    'templateUrl': path["help"]+'/help.home.html',
                    'data': { 'requireLogin': False },
                    'ncyBreadcrumb': {
                        'label': 'Help'
                    },
                    'meta_desc': 'Help on statistical basics, different types of tests, and case studies to use with our tools.'
                },
                {'name': 'faq', 
                    'url': '/faq',
                    'data': { 'requireLogin': False },
                    'templateUrl': path["help"]+'/help.faq.html', 
                    'ncyBreadcrumb': {
                        'parent': 'help.home',
                        'label': 'FAQ'
                    }
                },
                {'name': 'glossary', 
                    'url': '/glossary',
                    'templateUrl': path["help"]+'/help.glossary.html', 
                    'ncyBreadcrumb': {
                        'parent': 'help.home',
                        'label': 'Glossary'
                    }
                },
                {'name': 'case', 
                    'url': '/casestudies',
                    'templateUrl': path["help"]+'/help.case.html', 
                    'ncyBreadcrumb': {
                        'parent': 'help.home',
                        'label': 'Case Studies'
                    },
                    'meta_desc': 'Real case studies to explore our tools with.'
                },
                {'name': 'contact', 
                    'url': '/contact_us',
                    'templateUrl': path["help"]+'/help.contact.html',
                    'ncyBreadcrumb': {
                        'label': 'Contact Us'
                    },
                    'meta_desc': 'Need help or more information? Contact us!'
                },
                {'name': 'designtype', 
                    'url': '/designtypes',
                    'templateUrl': path["design_types"]+'/design.type.main.html', 
                    'ncyBreadcrumb': {
                        'parent': 'help.home',
                        'label': 'Design Types'
                    },
                    'meta_desc': 'Explore different design types (e.g. randomized, blocked, crossover)'
               },
               # tutorial, statbasics, and stattests
               {'name': 'tutorial', 
                    'url': '/tutorial',
                    'abstract': True,
                    'template': "<div ui-view autoscroll='True'></div>",
                    'ncyBreadcrumb': {
                        'parent': 'help.home',
                        'label': 'Tutorial'
                    },
                    'meta_desc': 'A tutorial on how to use all the tools on our site'
                },
                {'name': 'stattests', 
                    'url': '/stattests',
                    'abstract': True,
                    'template': "<div ui-view autoscroll='True'></div>",
                    'ncyBreadcrumb': {
                        'parent': 'help.home',
                        'label': 'Statistical Tests'
                    },
                    'meta_desc': 'Explore the difference between different tests, like T-Test, ANOVAs, and Repeated Measures.'
                },
                {'name': 'statbasics',
                    'url': '/statbasics',
                    'abstract': True,
                    'template': "<div ui-view autoscroll='True'></div>",
                    'controller': "basicsPlotCtrl",
                    'ncyBreadcrumb': {
                        'parent': 'help.home',
                        'label': 'Statistical Basics'
                    },
                    'meta_desc': 'Statistical basics with an emphasis on effect size, sample size, and power'
                }
            ]
        }
    ];
    return routes;
    
def write_route_and_meta_info(route_fid, meta_fid, route_name, meta_desc=None):
    write_route(route_fid, route_name, meta_desc);
    
    if route_name == '/' or route_name == '/auth/logout.html' or route_name == '/404.html':
        stripped_route_name = 'webPage'
    else:
        stripped_route_name = re.sub('/', '.', route_name[1:])
        if stripped_route_name.endswith('.'):
            stripped_route_name = stripped_route_name[:-1]
    
    #copyfile('app/structured_data/outline.html', 'app/structured_data/'+stripped_route_name+'.html')
    
    meta_fid.write("{%% if request.path == '%s' %%}\n" %(route_name));
    meta_fid.write("    {%% include 'structured_data/%s.html' %%}\n" % (stripped_route_name) )
    meta_fid.write("{% endif %}\n\n");
    
def write_route(fid, route_name, meta_desc=None):
    #fid.write('@app.route(\'%s\')\n' % (route_name) );
    
    fid.write('@app.route(\'%s\'' %(route_name));
    
    if meta_desc is not None:
        fid.write(', defaults={\'meta_desc\': \'%s\'}' % (meta_desc) );
        
    fid.write(')\n');
    
def write_sitemap_line(fid, str):
    fid.write('<url><loc>%s'  % (BASE_URL + str));
    fid.write('</loc><lastmod>%s</lastmod>' % BASE_DATE);
    #fid.write('<changefreq>weekly</changefreq> <priority>0.8</priority>');
    fid.write('</url>\n');
    
def is_abstract(dict):
    isAbstract = False;
    
    if 'abstract' in dict.keys() and ( dict["abstract"] is True ):
        isAbstract = True;
    
    return isAbstract

def write_js_state(single_state_dict, stateName, url):
    isAbstract = is_abstract(single_state_dict)
    
    stateData = ('data' in single_state_dict.keys())
    
    # if requireLogin, add the templateProvider
    templateProvider = '';
    
    # this block writes a template for "noauth" to the routes
    # these pages are meant to be viewed when someone not logged in sees the page
    if stateData:
        if single_state_dict["data"]["requireLogin"]:
            tp  = ', "resolve": {\n'
            tp +='"promise1": [\'authService\', function(authService){\n'
            tp +='    return authService.hasHandledInfo();\n'
            tp +='}],\n },\n'
            templateProvider = tp
            
            if not isAbstract:
                templateUrl = single_state_dict["templateUrl"]
                templateNoAuth = re.sub('.html', '.noauth.html', templateUrl)
                
                tp += "\n \"templateProvider\":  function($templateRequest, $rootScope) { "
                tp += 'if( $rootScope.has_access() ){ return $templateRequest(\'%s\') } ' % (templateUrl)
                tp += 'else{ return $templateRequest(\'%s\') } }' % (templateNoAuth);
                
                templateProvider = tp
                
                single_state_dict.pop("templateUrl", None)
    
    dict2str = json.dumps(single_state_dict, sort_keys=True)    # convert dict to string, preserve key sorting
    dict2str = dict2str[:-1]                                    # remove last element from string, '}'
    dict2str += templateProvider + '}'
    
    # write AngularJS route
    js_routes_file.write( '.state(\'%s\', \n' % stateName )
    js_routes_file.write( dict2str )
    js_routes_file.write( ')\n' );
    js_routes_file.write('\n //---------------------- \n');
    
    meta_desc = None
    try:
        meta_desc = single_state_dict["meta_desc"]
        single_state_dict.pop("meta_desc", None)
    except:
        pass
    
    if isAbstract is False:
        # write sitemap.xml route
        write_sitemap_line(sitemap_file, url);
        
        # write route to html5routes.py
        write_route_and_meta_info(py_routes_file, meta_data_file, url, meta_desc);
    
    return
    
def make_routes():
    
    routes = define_routes()
    
    # begin sitemap.xml syntax
    sitemap_file.write('<?xml version="1.0" encoding="UTF-8"?>\n\n');
    sitemap_file.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n');
    
    # begin AngularJS syntax
    js_routes_file.write( 'app.config([\'$stateProvider\', \n' + 
               ' function ($stateProvider) { $stateProvider \n'
    );
    
    py_routes_file.write('from flask import render_template \n' + 
        'from app_context import app, json \n\n'
    );
    
    # write out app.routes.js as well as sitemap.xml
    ind = 0;
    for parent in routes:
        ind = ind + 1;
        
        # extract any child data
        children = parent.pop("children", None);
        name = parent["name"];
        parent.pop("name", None);
        
        # write the parent data
        write_js_state(parent, name, parent["url"])
        
        # if child states exist
        if children is not None:
            for tmp in children:
                
                isAbstract = is_abstract(tmp)

                stateName   = tmp["name"]
                tmp.pop("name", None)
                
                write_js_state(tmp, name +'.' + stateName, parent["url"] + tmp["url"])
    
    #---------------------------
    # write out the child states for stattests, tutorial, and statbasics    
    #---------------------------
    # help > tutorial > home
    js_routes_file.write('.state(\'help.tutorial.home\', { ' + 
            '"url": \'/\',' + 
            '"templateUrl": \'%s\', \n' % (path["tutorial"]+'/tutorial.main.html') +  
            '"ncyBreadcrumb": {' + 
                '"parent": \'help.home\',' + 
                '"label": \'Tutorial\'} ' + 
            '}) \n' 
    )
    tutStates = [
        {'name': 'overview',    'url': 'overview',      'template': 'overview',     'bcLabel': 'Overview'},
        {'name': 'designguide', 'url': 'designguide',   'template': 'designguide',  'bcLabel': 'Design Guide'},
        {'name': 'tools',       'url': 'tools',         'template': 'tools',        'bcLabel': 'Tools'},
        {'name': 'reports',     'url': 'reports',       'template': 'reports',      'bcLabel': 'Reports'},        
    ];
    parent_url = '/help/tutorial/';
    write_sitemap_line(sitemap_file, parent_url);
    write_route_and_meta_info(py_routes_file, meta_data_file, parent_url, "Tutorial Home");
    
    for tmp in tutStates:
        js_routes_file.write('.state(\'help.tutorial.%s\', {' % tmp["name"] + 
            '"url": \'/%s\',' % tmp["url"] + 
            '"templateUrl": \'%s\', \n' % (path["tutorial"]+'/tutorial.' + tmp["template"]+ '.html') + 
            '"ncyBreadcrumb": { \n' + 
            '    "parent": \'help.tutorial.home\', \n' + 
            '    "label": \'%s\'} \n' % tmp["bcLabel"] + 
            '}) \n '
        )
        
        meta_desc = "Tutorial - " + tmp["bcLabel"]
        full_url   = parent_url + tmp["url"]
        write_sitemap_line(sitemap_file, parent_url + tmp["url"]);
        write_route_and_meta_info(py_routes_file, meta_data_file, full_url, meta_desc);
        
    #---------------------------
    # help > stattests > home
    js_routes_file.write('.state(\'help.stattests.home\', { ' + 
            '"url": \'/\',' + 
            '"templateUrl": \'%s\', \n' % (path["stat_tests"]+'/stat.test.main.html') +  
            '"ncyBreadcrumb": {' + 
                '"parent": \'help.home\',' + 
                '"label": \'Statistical Tests\'} ' + 
            '}) \n' 
    )
    statTestsStates = [
        {'name': 'overview',  'url': 'overview',    'template': 'overview',   'bcLabel': 'Overview'},
        {'name': 'sig',       'url': 'significance','template': 'sig',        'bcLabel': 'Significance and Power'},
        {'name': 'mean_std_es',     'url': 'mean_std_es',       'template': 'mean_std_es','bcLabel': 'Mean, Standard Deviation, and Effect Size'},
        
        {'name': 'ttest_def',     'url': 'ttest_def',       'template': 'ttest_def',      'bcLabel': 'Definitions'},
        {'name': 't1',    'url': 't1',      'template': 't1',     'bcLabel': 'One-Sample T-Test'},
        {'name': 't2',  'url': 't2',  'template': 't2', 'bcLabel': 'Paired T-Test'},
        {'name': 'tI',    'url': 'tI',      'template': 'tI',     'bcLabel': 'Independent-Sample T-Test'},
        
        {'name': 'anova_def',     'url': 'anova_def',       'template': 'anova_def',      'bcLabel': 'Definitions'},
        {'name': 'anova',     'url': 'anova',       'template': 'anova',      'bcLabel': 'ANOVA'},
        {'name': '2anova',     'url': '2anova',       'template': '2anova',      'bcLabel': '2-Way ANOVA'},
        {'name': '3anova',    'url': '3anova',      'template': '3anova',     'bcLabel': '3-Way ANOVA'},
        {'name': 'anova_rep',    'url': 'anova_rep',      'template': 'anova_rep',     'bcLabel': 'Repeated Measures ANOVA'},
    ];
    
    parent_url = '/help/stattests/';
    write_sitemap_line(sitemap_file, parent_url);
    write_route_and_meta_info(py_routes_file, meta_data_file, parent_url, "Statistical Tests");

    for tmp in statTestsStates:
        js_routes_file.write('.state(\'help.stattests.%s\', {' % tmp["name"] + 
            '"url": \'/%s\',' % tmp["url"] + 
            '"templateUrl": \'%s\', \n' % (path["stat_tests"]+'/stat.test.' + tmp["template"]+ '.html') + 
            '"ncyBreadcrumb": { \n' + 
            '    "parent": \'help.stattests.home\', \n' + 
            '    "label": \'%s\'} \n' % tmp["bcLabel"] + 
            '}) \n '
        )
        
        full_url = parent_url + tmp["url"]
        meta_desc = 'Statistical Tests - ' + tmp["bcLabel"]
        write_sitemap_line(sitemap_file, parent_url + tmp["url"]);
        write_route_and_meta_info(py_routes_file, meta_data_file, full_url, meta_desc);
    
    #---------------------------
    # help > statbasics > home
    js_routes_file.write('.state(\'help.statbasics.home\', { ' + 
            '"url": \'/\',' + 
            '"templateUrl": \'%s\', \n' % (path["stat_basics"]+'/basics.main.html') +  
            '"ncyBreadcrumb": {' + 
                '"parent": \'help.home\',' + 
                '"label": \'Statistical Basics\'} ' + 
            '}) \n' 
    )
    
    statBasicsStates = [
        {'name': 'overview',  'url': 'overview',    'template': 'overview',   'bcLabel': 'Overview'},
        {'name': 'sig',       'url': 'significance','template': 'sig',        'bcLabel': 'Significance'},
        {'name': 'stdev',     'url': 'stdev',       'template': 'stdev',      'bcLabel': 'Standard Deviation'},
        {'name': 'groups',    'url': 'groups',      'template': 'groups',     'bcLabel': 'Groups and Factors'},
        {'name': 'samplesize','url': 'samplesize',  'template': 'samplesize', 'bcLabel': 'Sample Size'},
        {'name': 'effect',    'url': 'effect',      'template': 'effect',     'bcLabel': 'Effect Size'},
        {'name': 'power',     'url': 'power',       'template': 'power',      'bcLabel': 'power'},
        {'name': 'effect_anova',    'url': 'effect_anova',      'template': 'effect_anova',     'bcLabel': 'Effect Size in ANOVA'},
        {'name': 'effect_cohen',    'url': 'effect_cohen',      'template': 'effect_cohen',     'bcLabel': 'Cohen`s d and f Values'},
    ];
    
    parent_url = '/help/statbasics/';
    write_sitemap_line(sitemap_file, parent_url);
    write_route_and_meta_info(py_routes_file, meta_data_file, parent_url, "Statistical Basics");

    js_routes_file.write('\n\n.state(\'standalone\', {"url": \'/standalone\', "template": "<div ui-view autoscroll=\'True\'></div>", "abstract": true, "controller": "basicsPlotCtrl"})\n\n');
    
    for tmp in statBasicsStates:
        js_routes_file.write('.state(\'help.statbasics.%s\', {' % tmp["name"] + 
            '"url": \'/%s\',' % tmp["url"] + 
            '"templateUrl": \'%s\', \n' % (path["stat_basics"]+'/basics.' + tmp["template"]+ '.html') + 
            '"ncyBreadcrumb": { \n' + 
            '    "parent": \'help.statbasics.home\', \n' + 
            '    "label": \'%s\'} \n' % tmp["bcLabel"] + 
            '}) \n '
        )

        # taking care of standalone states
        js_routes_file.write('.state(\'standalone.%s\', {' % tmp["name"] + 
            '"url": \'/%s\',' % tmp["url"] + 
            '"templateUrl": \'%s\', \n' % (path["stat_basics"]+'/basics.' + tmp["template"]+ '.html') + 
            '"ncyBreadcrumb": { \n' + 
            '    "label": \'%s\'} \n' % tmp["bcLabel"] + 
            '}) \n '
        )
        
        full_url = parent_url + tmp["url"]
        meta_desc = "Statistical Basics - " + tmp["bcLabel"]
        write_sitemap_line(sitemap_file, parent_url + tmp["url"]);
        write_route_and_meta_info(py_routes_file, meta_data_file, full_url, meta_desc);
        write_route(py_routes_file, '/standalone/' + tmp["url"]);
        
    #---------------------------
    #'''
    
    # finish AngularJS syntax
    js_routes_file.write('}]); \n');
    
    # finish sitemap.xml syntax
    sitemap_file.write('</urlset>\n');
    
    py_routes_file.write('def index_js_route(meta_desc=None): \n');
    py_routes_file.write('    import sys \n');
    py_routes_file.write('    \n');
    py_routes_file.write('    json_data = [0,0]\n');
    py_routes_file.write('    with open(\'static/module_tools/tools_labels_power.json\') as json_file:\n');
    py_routes_file.write('        json_data[0] = json.load(json_file)\n');
    py_routes_file.write('    with open(\'static/module_tools/tools_labels_sample.json\') as json_file:\n');
    py_routes_file.write('        json_data[1] = json.load(json_file)\n');
    py_routes_file.write('    \n');
    py_routes_file.write('    return render_template(\'index.html\', os_type=sys.platform, json_data=json_data, meta_desc=meta_desc) \n');
    py_routes_file.write('\n');

    return;

# run the function
make_routes();

# close all files
js_routes_file.close();
py_routes_file.close();
sitemap_file.close();
meta_data_file.close();
