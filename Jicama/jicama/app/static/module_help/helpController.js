'use strict';

app
    .run(['$anchorScroll', function($anchorScroll) {
        $anchorScroll.yOffset = 150;   // always scroll by 150 extra pixels
    }])
    .controller('HelpCtrl', [
        '$scope', '$location', '$anchorScroll', '$timeout', '$state',
        HelpCtrl
    ]);
  
function HelpCtrl($scope, $location, $anchorScroll, $timeout, $state)
{
    var rootPath      = 'static/partials/webpage_help/';
    $scope.statPath     = rootPath + 'stattests/stat.test.';
    $scope.basicsPath   = rootPath + 'statbasics/basics.';
    $scope.typePath     = rootPath + 'designtype/design.type.';
    $scope.casePath     = rootPath + 'casestudies/example_';
    
    $scope.statBasics = 
    [
        {   title: "Basics",
            groups : [
                {title: "Overview",             ui_sref: "overview"},
                {title: "Groups, Factors, Levels, Settings",               ui_sref: "groups"},
                {title: "Power",                ui_sref: "power"},
                {title: "Sample Size",          ui_sref: "samplesize"},
                {title: "Significance",         ui_sref: "sig"},
                {title: "Standard Deviation",   ui_sref: "stdev"}
            ]
        },
        {   title: "Effect Size",
            groups : [
                {title: "Effect Size",              ui_sref: "effect"},
                {title: "Effect Size in ANOVA",     ui_sref: "effect_anova"},
                {title: "Cohen's d and f Values",   ui_sref: "effect_cohen"},
            ]
        },
    ];
    
    $scope.statTests = 
    [
        {  title: "Background",
            groups : [
                {title: "Overview",                 ui_sref: "overview"},
                {title: "Significance and Power",   ui_sref: "sig"},
                {title: "Mean, Standard Deviation, and Effect Size",    ui_sref: "mean_std_es"}
            ]
        },
        {  title: "T-Test",
            groups : [
                {title: "Definitions",               ui_sref: "ttest_def"},
                {title: "One-Sample T-Test",         ui_sref: "t1"},
                {title: "Paired T-Test",             ui_sref: "t2"},
                {title: "Independent-Sample T-Test", ui_sref: "tI"}
            ]
        },
        {   title: "ANOVA",
            groups : [
                {title: "Definitions",              ui_sref: "anova_def"},
                {title: "1-Way ANOVA",              ui_sref: "anova"},
                {title: "2-Way ANOVA",              ui_sref: "2anova"},
                {title: "3-Way ANOVA",              ui_sref: "3anova"},
                {title: "Repeated Measures ANOVA",  ui_sref: "anova_rep"}
            ]
        }
    ];
    
    $scope.caseStudiesContents = 
    [
        {  title: "Contents",
            groups : [
                {title: "Case 1: Completely Randomized",        html: "1.html",  active: false},
                {title: "Case 2: Longitudinal Study",           html: "2.html",  active: false},
                {title: "Case 3: Repeated Measures 1",          html: "3.html",  active: false},
                {title: "Case 4: Repeated Measures 2",          html: "4.html",  active: false},
            ]
        },
    ];
    
    $scope.tutorialContents = 
    [
        {  title: "Overview", ui_sref: "help.tutorial.overview", groups:[] },
        {  title: "Design Guide", ui_sref: "help.tutorial.designguide",
            groups : [
                {title: "Getting Started",      active: false},
                {title: "Treatment Factors",    active: false},
                {title: "Nontreatment Factors", active: false},
                {title: "Outcome Measures",     active: false},
                {title: "Sample Size",          active: false},
                {title: "Report",               active: false},
            ]
        },
        {  title: "Statistical Tools", ui_sref: "help.tutorial.tools",
            groups : [
                {title: "Sample Size Calculator",       active: false},
                {title: "Statistical Power Calculator", active: false},
                {title: "Power Plot",                   active: false},
                {title: "Random Number Generator",      active: false},
                {title: "Simulations",                  active: false},
                {title: "Data Analysis",                active: false},
            ]
        },
        {  title: "Reports", ui_sref: "help.tutorial.reports",
            groups : [
                {title: "Design Guide",                 active: false},
                {title: "Statistical Tools",            active: false},
                {title: "ARRIVE Supplement Form",       active: false},
                {title: "ARRIVE Supplement Checklist",  active: false},
            ]
        }
    ];
    
    $scope.designTypeContents = 
    [
        {   title: "Random Designs",
            groups : [
                {title: "Completely Randomized",                html: "random.html",        active: false}
            ]
        },
        {  title: "Block Designs",
            groups : [
                {title: "Randomized Block",                     html: "block_random.html",  active: false},
                {title: "Incomplete Block",                     html: "block_incomplete.html",  active: false},
                {title: "Crossover",                            html: "crossover.html",     active: false},
                {title: "Latin Square",                         html: "latin.html",         active: false},
                {title: "Matched Pair",                         html: "match_pair.html",    active: false}
            ]
        },
        {   title: "Factorial Designs",
            groups : [
                {title: "Factorial",                            html: "factorial.html",     active: false},
                {title: "Dose Response",                        html: "dose.html",          active: false},
                {title: "Dose Escalation",                      html: "escalation.html",    active: false}
            ]
        },
        {   title: "Hierarchical Designs",
            groups : [
                {title: "Nested",                               html: "nested.html",        active: false},
                {title: "Split Plot",                           html: "split.html",         active: false}
            ]
        },
        {   title: "Other Designs",
            groups : [
                {title: "Repeated Measures",                    html: "repeated.html",      active: false},
                {title: "Sequential",                           html: "sequential.html",    active: false}
            ]
        },
    ];
    
    function init()
    {
        // This function assigns HTML id names to each object (uib-accordion) for anchor scrolling
        var tot_obj = [$scope.designTypeContents, $scope.caseStudiesContents, $scope.tutorialContents];
        var obj_ids = ['types-', 'cases-', 'tut-'];
        
        for(var kk=0; kk<tot_obj.length; kk++)
        {
            var tmp = 0;
            var obj = tot_obj[kk];
            
            for(var ii=0; ii<obj.length; ii++)
            {
                for(var jj=0; jj<obj[ii].groups.length; jj++){
                    tmp ++;
                    obj[ii].groups[jj].id = obj_ids[kk] + tmp;
                }
            }
        }
    };
    init();
    
    $scope.clearAllActive = function(parent)
    {
        for(var ii=0; ii<parent.length; ii++){
            for(var jj=0; jj<parent[ii].groups.length; jj++){
                parent[ii].groups[jj].active = false;
            }
        }
    };
    
    $scope.openAndMakeActive = function(group,parent)
    {
        // $scope.clearAllActive(
        $scope.makeActive(group,parent);
    };
    
    $scope.makeActive = function(group,parent)
    {
        var isActive = group.active;
        
        for(var ii=0; ii<parent.length; ii++)
        {
            for(var jj=0; jj<parent[ii].groups.length; jj++){
                var g = parent[ii].groups[jj];
                g.active = false;
            }
        }
        
        group.active = !isActive;
        
        var ID_NAME = group.id;
        if( !group.active )
            ID_NAME = "topLevel";
        
        $timeout( function(){
            var old = $location.hash();
            
            $location.hash(ID_NAME);
            $anchorScroll();
            $location.hash(old);
        }, 500);
    };
};

