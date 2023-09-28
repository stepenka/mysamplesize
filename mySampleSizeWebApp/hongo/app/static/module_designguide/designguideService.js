/****************************************************************************/
/* This service is designed to keep the suggestions from the Design Guide in persistent-like memory */
/****************************************************************************/
(function() {
    'use strict';

    angular
        .module('tempestApp')
        .service('designService', [designService]);

function designService() {
    
    this.DGcompleted = false;
    this.designType = 'Randomized';
    this.statMethod = '1-Way ANOVA';
    this.notEmbedded = true;
    
    // for DG walkthrough
    this.tourCreated = [0, 0, 0, 0, 0, 0];
    
    this.stat = {
        selectedOption: {},
        selected: 0,
        options: [ 
            {id: 10, name: '-- Select type of statistical test for analysis:',  ui_sref: '', items: [] },
            {id: 3,  name: 'T-Test - One Sample', ui_sref: 'help.stattests.t1'},
            {id: 8,  name: 'T-Test - Two Sample', ui_sref: 'help.stattests.tI'},
            {id: 4,  name: 'Paired T-Test', ui_sref: 'help.stattests.t2'},
            {id: 1,  name: '1-Way ANOVA', ui_sref: 'help.stattests.anova'},
            {id: 7,  name: '2-Way ANOVA', ui_sref: 'help.stattests.2anova'},
            {id: 2,  name: 'Multi-Way ANOVA', ui_sref: 'help.stattests.3anova'},
            {id: 6,  name: 'Simple Linear Model', ui_sref: 'help.stattests.home'},
            {id: 11, name: 'Repeated Measures ANOVA', ui_sref: 'help.stattests.anova_rep'},
            {id: 12, name: 'Crossover', ui_sref: 'help.stattests.anova_rep'},
           // {id: 0, name: 'General Linear Model',   url: 'glm'},
           // {id: 5, name: 'Other',                  url: 'other'},
        ],
    };
    
    // checks to call instead of remembering ID # for each test type
    this.checkSelectedId = function( id ) {
        return (this.stat.selectedOption.id == id);
    };
    
    this.isNone         = function(){ return this.checkSelectedId(10) };
    this.isTTest1       = function(){ return this.checkSelectedId(3) };
    this.isTTest2       = function(){ return this.checkSelectedId(8) };
    this.isTTestPaired  = function(){ return this.checkSelectedId(4) };
    
    this.isANOVA1       = function(){ return this.checkSelectedId(1) };
    this.isANOVA2       = function(){ return this.checkSelectedId(7) };
    this.isANOVAm       = function(){ return this.checkSelectedId(2) };
    
    this.isSLM          = function(){ return this.checkSelectedId(6) };
    this.isRMPS1        = function(){ return this.checkSelectedId(11) };
    this.isRMCS1        = function(){ return this.checkSelectedId(12) };
    
    // get the test type from the id
    this.getTest = function(id) {
        var testStr = '';
        var statOpts = this.stat.options;
        for(var ii=0; ii<statOpts.length; ii++){
            if(statOpts[ii].id == id){
                testStr = statOpts[ii].name;
                break;
            }
        };
        return testStr;
    };
    
    var rng_url = 'https://www.mysamplesize.com:3838/ShinyApps/random/';
    this.type = {
        selected: 0,
        options: [ 
            {id: 100, name: '-- Select design type:',    url: ''},
            {id: 0, name: 'Completely Randomized',  url: rng_url+'complete_rand'},
            
            {id: 1, name: 'Randomized Block',       url: rng_url+'block_rand'},
            {id: 2, name: 'Incomplete Block',       url: rng_url+'block_incomplete'},
            {id: 3, name: 'Crossover',              url: rng_url+'crossover'},
            {id: 4, name: 'Latin Square',           url: rng_url+'latin_square'},
            {id: 5, name: 'Matched Pair',           url: rng_url+'matched_pair'},
            
            {id: 6, name: 'Factorial',              url: rng_url+'factorial'},
            {id: 7, name: 'Dose Response',          url: rng_url+'dose_response'},
            {id: 8, name: 'Dose Escalation',        url: rng_url+'dose_escalation'},
            
            {id: 9, name: 'Nested',                 url: rng_url+'nested'},
            {id:10, name: 'Split Plot',             url: rng_url+'split_plot'},

            {id:11, name: 'Repeated Measures',      url: rng_url+'repeat'},
            {id:12, name: 'Sequential',             url: rng_url+'sequential'},
            {id:13, name: 'Simple Regression',      url: rng_url+'simple_regression'},
        ],
    };
    
    this.stat.selectedOption = this.stat.options[this.stat.selected];
    this.type.selectedOption = this.type.options[this.type.selected];
    
    this.numGroups = null;

    this.change = function(type_id, stat_id)
    {
        var stat_ndx = -1;
        var type_ndx = -1;
        
        for(var ii=0; ii<this.stat.options.length; ii++)
        {
            var opt = this.stat.options[ii];
            if( stat_id == opt.id )
            {
                stat_ndx = ii;
                break;
            }
        }
        for(var ii=0; ii<this.type.options.length; ii++)
        {
            var opt = this.type.options[ii];
            if( type_id == opt.id )
            {
                type_ndx = ii;
                break;
            }
        }
        
        this.stat.selected  = stat_ndx;
        this.type.selected  = type_ndx;
        
        if( stat_ndx < 0 || stat_ndx > this.stat.options.length )
            this.statMethod = 'unable to calculate at this time';
        else
            this.statMethod = this.stat.options[this.stat.selected].name;
            this.stat.selectedOption = this.stat.options[this.stat.selected];
        
        
        if( type_ndx < 0 || type_ndx > this.type.options.length )
            this.designType = 'unable to calculate at this time';
        else
            this.designType = this.type.options[this.type.selected].name;
        
    };
    
    this.treatment_table = null;
    this.graphsText = '',     // this will be needed for the summary report

    this.formData = {
        step: 0,
        hypothesis: null,
        
        responseTypes : {
            selected: 0,
            options: [
                {name: "Continuous",    id: 0},
                {name: "Discrete",      id: 1},
                {name: "Binary",        id: 2},
                ],
            },
            
        takeBaseline : 0,
    
        // =============================================================================
        // TREATMENTS
        // =============================================================================
        controlTypes : [
            {name: "Negative",      id: 0},
            {name: "Positive",      id: 1},
        ],
        nControlAdditionalSelected: 0,
        
        litResource:  0,
        
        treatments: [
            {
                level: [
                    {id:1,name:null}
                ],
                description: null,
                control: {},
                control_desc: null
            },
        ],
            
        // =============================================================================
        // STANDARD DEVIATION & EFFECT SIZE
        // =============================================================================
        stdev:           null,
        effectSize:      null,
        effectSizeLarge: null,
        
        // =============================================================================
        // UNITS
        // =============================================================================
//        expUnits: null,
        obsUnits: null,
        outMeas:  null,
        
        // =============================================================================
        // EFFECTS / FACTORS
        // =============================================================================

        factors: [
         // {level: [{id:1, name: null}], description: null}
        ],
        
        covariates: [
            //{level: 1, description: null},
        ],
        
        repeatedMeasures : [
            {level: 1, description: null},
        ],
        
        // =============================================================================
        // REPEATED MEASUREMENTS
        // =============================================================================
        repMeas : 
        {
            checked : 0,
            opt: 1,
            
            multipleES: 0,
            
            timePts: 5,
            withinSD: 6,
            betweenSD : 5,
            
            // Checkbox options
            checkboxes : {
                measDiffOverTrtm : {selected:true,  esLg:null, esSm:null, label:"Detecting differences in measures over treatments/manipulations/other factors?"},
                measDiffOverTime : {selected:false, esLg:null, esSm:null, label:"Detecting differences in measures over time?"},
                measDiffOverIntr : {selected:false, esLg:null, esSm:null, label:"Detecting existence of interactions between time and treatments?"}
            }
        },
        
        correlation: 0,
    };
    
    this.count_addl_controls = function() {
        var addlCtl = this.formData.controlTypes;
        this.formData.nControlAdditionalSelected = 0;
        
        for(var ii=0; ii<addlCtl.length; ii++)
        {
            var ct = addlCtl[ii];
            if( ct.selected )
            {
                this.formData.nControlAdditionalSelected ++;
                this.formData.treatment_table.push( {'group': 'Additional control: ' + ct.name, 'selected': ct.selected} )
            }
        }
    };
    
    this.count_factors_levels = function() {
        var nFactors = [];
        
        for(var ii=0; ii<this.formData.treatments.length; ii++)
            nFactors.push( this.formData.treatments[ii].level.length + 1 ); // +1 because of control
        
        for(var ii=0; ii<this.formData.factors.length; ii++)
            nFactors.push( this.formData.factors[ii].level.length );
            
        return nFactors;
    };
    
    // Function to load tools info from JSON through global JS variable, imported through Flask
    function loadJSON(tmp)
    {
        var power_data  = TOOLS_LABELS_POWER;       // defined in index.html, imported through Flask
        var sample_data = TOOLS_LABELS_SAMPLE;      // defined in index.html, imported through Flask
        
        for(var ii=0; ii<tmp.stat.options.length; ii++)
        {
            var id = tmp.stat.options[ii].id;
            
            if( id == 3 ){  // T-Test - One Sample
                tmp.stat.options[ii].power_items    = power_data.ttest_1s;
                tmp.stat.options[ii].sample_items   = sample_data.ttest_1s;
            }
            if( id == 8 ){  // T-Test - Two Sample
                tmp.stat.options[ii].power_items    = power_data.ttest_2s;
                tmp.stat.options[ii].sample_items   = sample_data.ttest_2s;
            }
            if( id == 4 ){  // Paired T-Test
                tmp.stat.options[ii].power_items    = power_data.ttest_paired;
                tmp.stat.options[ii].sample_items   = sample_data.ttest_paired;
            }
            if( id == 1 ){  // 1-Way ANOVA
                tmp.stat.options[ii].power_items    = power_data.aov1;
                tmp.stat.options[ii].sample_items   = sample_data.aov1;
            }
            if( id == 7 ){  // 2-Way Anova
                tmp.stat.options[ii].power_items    = power_data.aov2;
                tmp.stat.options[ii].sample_items   = sample_data.aov2;
            }
            if( id == 2 ){  // Multi-Way Anova
                tmp.stat.options[ii].power_items    = power_data.aovm;
                tmp.stat.options[ii].sample_items   = sample_data.aovm;   
            }
            if( id == 11 ){ // Repeated Parallel Single Outcome
                tmp.stat.options[ii].power_items    = power_data.rm_parallel;
                tmp.stat.options[ii].sample_items   = sample_data.rm_parallel;
            }
            if( id == 12 ){ // Repeated Crossover Single Outcome
                tmp.stat.options[ii].power_items    = power_data.rm_crossover;
                tmp.stat.options[ii].sample_items   = sample_data.rm_crossover;
            }
        }
    };
    loadJSON(this);
    
 }
})();
