//Error check for whole numbers
function errorWholeNumber(number)
{
    if (number == 'undefined'){
        return false; //pass undefined variables, handled elsewhere
    } else if(number % 1 == 0) {
        return false;
    } else if (number % 1 != 0){
        return true;
    } 
};

function generateCombinations(n)
{
    function getPermutations(array, size) {
        function p(t, i) {
            if (t.length === size) {
                result.push(t);
                return;
            }
            if (i + 1 > array.length) {
                return;
            }
            p(t.concat(array[i]), i + 1);
            p(t, i + 1);
        }

        var result = [];
        p([], 0);
        return result;
    }
    
    var array = Array(n);
    for(var ii=0; ii<n; ii++)
        array[ii] = ii+1;
    
    var combVec = [];
    for(var ii=0; ii<n; ii++)
    {
        var tmp = getPermutations(array, ii+1);
        
        combVec.push(tmp);
    }
    
    return combVec;
};

(function() {
    'use strict';

    angular
        .module('tempestApp')
        .service('calculatorService', ['designService', calculatorService]);

function calculatorService(designService) {
    
    this.calculateComplete = true;
    
    this.calcData = {},		// this variable is ONLY for DG reporting purposes; used in toolsController and dgController
    
    this.data = {
        tool: null,
        test: null,
        sig: 0.05,
        pow: 0.80,
        samplesize: 20,
        es: null,
        groups: 2,
        
        esRel: 0.50,
        esR2: 0.5,          // helper for SLM
        esMean: 2.5,
        esSD: 5,
        esSD_AOV: 5,
        
        esComb: {index: [], effect: [5]},
        
        treatmentsTotal: 2,
        
        // Repeated measure defaults
        treatmentsTotalRM: 1,
        wsSD_RM: 5,
        bsSD_RM: 5
    }

    this.arraySum = function(arr) {
        var s = 0;
        for(var ii=0; ii<arr.length; ii++){
            s += arr[ii];
        }
        return s;
    };
    
    this.treatments = [ 
        {treatment: 1, levels: 2, description: null, es: 5},
        {treatment: 2, levels: 3, description: null, es: 6},
        {treatment: 3, levels: 4, description: null, es: 7},
    ],

    this.AOV2 = {
        tool: null,
        test: null,
        sig: null,
        df2: null,
        lambda: null,
        dfM: null,
        dfS: null,
        dfI: null,
        pow: null,
        k: null,
        es:null,
    };

    this.RMPS1 = {
        tool: null,
        test: null,
        sig: null,
        df1: null,
        df2: null,
        lambda: null,
        pow: null,
        es:null,
        esMultiple: 0,
        k:null
    };
    
    this.RMCS1 = {
        tool: null,
        test: null,
        sig: null,
        df1: null,
        df2: null,
        lambda: null,
        pow: null,
        es:null,
        k:null,
    };
    
    this.AOVmulti={
        tool: null,
        test: null,
        sig: null,
        df2: null,
        k:null,
        es:null,
        lambda: [],
        df1: []
    };

    // Below are helper functions used in toolsController
    this.AOV2calc = function()
    {
        this.AOV2.esSD_AOV  = this.data.esSD_AOV;   // assignment is only for display in report
        this.AOV2.esMean    = this.data.esMean;     // assignment is only for display in report
        this.AOV2.groups    = this.data.groups;     // assignment is only for display in report
        
        this.AOV2.tool      = this.data.tool;
        this.AOV2.sig       = this.data.sig;

        this.AOV2.k         = this.treatments[0].levels * this.treatments[1].levels;
        this.AOV2.dfM       = this.treatments[0].levels-1;
        this.AOV2.dfS       = this.treatments[1].levels-1;
        this.AOV2.dfI       = (this.treatments[0].levels-1)*(this.treatments[1].levels-1);

        var es2             = Math.pow(this.data.es,2);
        this.AOV2.lambda    = [0,0,0];
        this.AOV2.lambda[0] = es2 * this.AOV2.dfM * this.treatments[1].levels;
        this.AOV2.lambda[1] = es2 * this.AOV2.dfS * this.treatments[0].levels;
        this.AOV2.lambda[2] = es2 * this.AOV2.dfM * this.AOV2.dfS;
        
        if(this.AOV2.tool=='samplesize'){
            this.AOV2.pow = this.data.pow;
            this.AOV2.es = this.data.es;                
        } 
        
        else if(this.AOV2.tool=='power')
        {
            this.AOV2.df2 = (this.data.samplesize-1) * this.AOV2.k;
            for(var ii=0; ii<this.AOV2.lambda.length; ii++){
                this.AOV2.lambda[ii] = this.AOV2.lambda[ii]*this.data.samplesize;
            }
        }
    };
    
    this.AOVmultiCalc = function(combValues)
    {
        this.AOVmulti.esSD_AOV  = this.data.esSD_AOV;   // assignment is only for display in report
        this.AOVmulti.esMean    = this.data.esMean;     // assignment is only for display in report
        this.AOVmulti.groups    = this.data.groups;     // assignment is only for display in report
        
        this.AOVmulti.tool = this.data.tool;
        this.AOVmulti.sig = this.data.sig;
        var df1 = combValues;
        
        this.AOVmulti.k = this.treatments[0].levels;
        for(var ii=1; ii<this.data.treatmentsTotal; ii++){
            this.AOVmulti.k = this.AOVmulti.k * this.treatments[ii].levels;
        }
        var es2_k = Math.pow(this.data.es,2) * this.AOVmulti.k;

        var df1wk  = new Array( df1.length );
        var lambda = new Array( df1.length );
        
        for(var ii=0; ii<df1.length; ii++)
        {
            var tmp = 1, tmp2 = 1;
            for(var jj=0; jj<df1[ii].length; jj++)
            {
                var ind = df1[ii][jj] - 1;
                tmp     = tmp * (this.treatments[ind].levels-1)
                tmp2    = tmp2 * (this.treatments[ind].levels)
            }
            df1wk[ii]  = tmp;
            lambda[ii] = es2_k * df1wk[ii] / tmp2;
        }

        this.AOVmulti.df1 = df1wk;
        this.AOVmulti.lambda = lambda;
        
        if(this.AOVmulti.tool=='samplesize'){
            this.AOVmulti.pow = this.data.pow;
        } 
        else if(this.AOVmulti.tool=='power')
        {
            this.AOVmulti.df2 = (this.data.samplesize-1) * this.AOVmulti.k;
            for( var ii=0; ii<lambda.length; ii++)
            {
                lambda[ii] = this.data.samplesize * lambda[ii];
            }
            this.AOVmulti.lambda = lambda;
        }
    };
    
/* Repeated Measurement Parallel Single Outcome calculations */
    this.RMPS1calc = function(effectSize, indices)
    {
        // upon entering, the Time factor has already been incorporated into the treatments table/list
        this.RMPS1.tool = this.data.tool;
        this.RMPS1.sig = this.data.sig;
        this.RMPS1.bsSD_RM = this.data.bsSD_RM;     // copy values purely for report generation
        this.RMPS1.wsSD_RM = this.data.wsSD_RM;     // copy values purely for report generation
        
        // degree of freedom on numerator in F-distribution 
        var siz     = indices.length;
        var df1     = new Array(siz);
        var df2     = new Array(siz);
        var lambda  = new Array(siz);
        var nTime   = this.treatments[0].levels;
        
        // product of levels of non-time factors
        var trtProd = 1.0;
        this.data.treatmentsTotal = this.data.treatmentsTotalRM + 1;        // need this line for database + report generation
        
		// console.log("this.data.treatmentsTotalRM = ", this.data.treatmentsTotalRM); // yw
		
/* 
	Total number of groups should exclude number of time points which is stored in the first element in the array treatments
*/
        // for(var jj=0; jj<this.data.treatmentsTotal; jj++) // yw-bugFix 6/20/21
        for(var jj=1; jj<this.data.treatmentsTotal; jj++)
            trtProd = trtProd * this.treatments[jj].levels;
        
        this.RMPS1.trtProd = trtProd;       // only used for display purposes
        
        var wsSD_2 = Math.pow(this.data.wsSD_RM,2);
        var bsSD_2 = Math.pow(this.data.bsSD_RM,2);
        
        // df1: treatment levels, products of levels for interaction terms
        for(var ii=0; ii<indices.length; ii++) {
            df1[ii] = 1.0;
            df2[ii] = trtProd/this.treatments[0].levels;  //corrected for time.
            
            var timeInter = false;
            
            lambda[ii] = trtProd;// * nTime;       // lambda is product of all treatment levels
            
            for(var jj=0; jj<indices[ii].length; jj++) { 
                var ndx     = indices[ii][jj] - 1;
                var nLevels = this.treatments[ndx].levels
                timeInter   = (timeInter) || (ndx == 0);        // time "treatment" is always index 0
                df1[ii]     = df1[ii] * (nLevels - 1);
                
                lambda[ii]  = lambda[ii] * (nLevels - 1) / nLevels;
            }
            
            var denom  = wsSD_2 + nTime*bsSD_2;
            
            if( timeInter ) {
                // if interaction involves time, multiply by: (# of time pts) - 1
//                df2[ii] = df2[ii] * (nTime-1);
                
                // if interaction involves time, denominator for lambda is different
                denom = wsSD_2;
                df2[ii] = df2[ii]*(this.treatments[0].levels-1);  //corrected for time
            }
            
            // divide lambda by correct denominator
            var ind = 0;
            if( this.RMPS1.esMultiple )
                ind = ii;
            
            lambda[ii] = lambda[ii] * Math.pow(effectSize[ind],2) / denom;
        }
		// console.log("this.data.treatmentsTotal = ", this.data.treatmentsTotal);  // yw

        if(this.RMPS1.tool=='samplesize'){
            this.RMPS1.pow = this.data.pow;
        }
        else if(this.RMPS1.tool=='power'){
            var ss  = this.data.samplesize;
            var ss1 = (this.data.samplesize-1);    

            for(var ii=0; ii<lambda.length; ii++){
                lambda[ii] = ss * lambda[ii];
                df2[ii]    = ss1 * df2[ii];
            }
        }
        
        this.RMPS1.k = df2;
        this.RMPS1.df1 = df1;
        this.RMPS1.df2 = df2;
        this.RMPS1.lambda = lambda;
        this.RMPS1.esComb = this.data.esComb;
		// console.log("this.treatments = ", this.treatments);  // yw
    };
    
/* Repeated Measurement Crossover Single Outcome, Single Treatment calculations */
    this.RMCS1calc = function()
    {
		// sconsole.log("calcService:", this.data);  // yw
		
        this.RMCS1.treatmentsTotal = this.data.treatmentsTotalRM;
        this.RMCS1.tool = this.data.tool;
        this.RMCS1.sig = this.data.sig;
        this.RMCS1.wsSD_RM = this.data.wsSD_RM;     // copy values purely for report generation
        
		// console.log("this.data:", this.data); // yw
		// console.log("this.treatments[0].levels:", this.treatments[0].levels);		// yw
		
        var nLevels = this.treatments[0].levels;
        var wsSD_2  = Math.pow(this.data.wsSD_RM,2);
        var es_2    = Math.pow( this.data.esMean,2);
        var df1     = nLevels-1;
        var lambda  = nLevels * (nLevels-1) * (es_2 / wsSD_2);
        
        if(this.RMCS1.tool=='samplesize'){
            this.RMCS1.pow = this.data.pow;
            this.RMCS1.k   = nLevels;
        }
        else if(this.RMCS1.tool=='power'){
            var ss = this.data.samplesize;
            lambda = ss * lambda;
            this.RMCS1.df2 = (nLevels-1) * (ss*nLevels-1);
        }
        this.RMCS1.df1    = df1;
        this.RMCS1.lambda = lambda;
        
        // set values for report generation
        this.RMCS1.esMean = this.data.esMean;
        this.RMCS1.groups = this.treatments[0].levels;
		// this.RMCS1.groups = this.data.groups;
		// console.log("levels & nLevels:", this.treatments[0].levels, nLevels); // yw

    };
    
    this.effectCalc2 = function(id, esMean)
    {
        var es = 1;
        if (id==3||id==8||id==4){
            // T-Tests: d
            es = esMean / this.data.esSD;
        } else if(id==7||id==2){
            // 2-Way ANOVA, Multi-Way
            es = (esMean / this.data.esSD_AOV) ;
            
        } else if(id==1){
            // ANOVAs: f
            es = esMean / this.data.esSD_AOV;

        } else if(id==6){ 
            // Simple Linear Model: f2
            es = this.data.R2 / (1-this.data.R2);
            
        } else if( id==12 ){
            // Repeated Measurement: Crossover
            es = esMean / this.data.wsSD_RM;
            
        } else if (0){ //(id==11){ 
            // Repeated Measurement
            es = 1;
        }
        return es;
    };
    this.effectCalc2_inv = function(id, es)
    {
        var esMean = es;
        if (id==3||id==8||id==4){
            // T-Tests: d
            esMean = es * this.data.esSD;
        } else if(id==7||id==2){
            // 2-Way ANOVA, Multi-Way
            esMean = es * this.data.esSD_AOV;
            
        } else if(id==1){
            // ANOVAs: f
            esMean = es * this.data.esSD_AOV;

        } else if( id==12 ){
            // Repeated Measurement: Crossover
            esMean = es * this.data.wsSD_RM;
            
        } else if (0){ //(id==11){ 
            // Repeated Measurement
            esMean = 1;
        }
        
        return esMean;
    };
    
    this.effectCalc = function(id)
    {
        this.data.es = this.effectCalc2(id, this.data.esMean);
    };
    
    this.RMcomb_reset = function()
    {
        this.data.esComb = {index: [], effect: [5]};
    };
    
    this.genCombinations = function(n)
    {
        if( typeof(n) == 'undefined' )
            n = this.data.treatmentsTotal;
        
        // Generate a vector of vectors
        var tmp = generateCombinations(n);
        
        var v = [];
        for(var ii=0; ii<tmp.length; ii++)
            v = v.concat( tmp[ii] );
		
        return v;
    };
    
    this.generateEffectCombo = function(RMcomb, n)
    {
        if( !RMcomb ){
            RMcomb = {index: [], effect: [5]};
        }
        RMcomb.index = this.genCombinations( n );
        
        var curSiz = RMcomb.effect.length;
        var newSiz = RMcomb.index.length;
        
        if( curSiz <= newSiz ) {
            // add more if necessary
            for(var ii=curSiz; ii<newSiz; ii++)
                RMcomb.effect.push( RMcomb.effect[0] );
        } else {
            // delete if necessary
            for(var ii=curSiz; ii>newSiz; ii--)
                RMcomb.effect.pop();
        }
        
        /* convert text to number */
        //for(var ii=0; ii<newSiz; ii++)
        //    RMcomb.effect[ii] = Number( RMcomb.effect[ii] );
        
        return RMcomb;
    };

    //------------------------------------------------------------
    this.updateTreatments = function()
    {
        var designStatSelected      = designService.stat.selectedOption;
        this.data.treatmentsTotal   = Number( this.data.treatmentsTotal );
        this.data.treatmentsTotalRM = Number( this.data.treatmentsTotalRM );
        
        var treatmentsTotal = this.data.treatmentsTotal;
        
        var RMflag = ( designService.isRMPS1() );    //RMPS1
        if( RMflag )
        {
            treatmentsTotal = this.data.treatmentsTotalRM+1;
        }
		
        var treatmentError = errorWholeNumber(treatmentsTotal);
        
        if( treatmentError )
            return treatmentError;
        
        treatmentError = false;
        
        //-------------------------------------------------
        //if( RMflag || (designStatSelected.id == 2) )   // Multi-Way ANOVA or RM
        //if( RMflag )
        if( RMflag || designService.isANOVAm() )
        {
            var tmp = [];
            if( this.data.tool=='samplesize' )
            {
                tmp = designStatSelected.sample_items;
            }else //if( this.data.tool=='power' )
            {
                tmp = designStatSelected.power_items;
            }
            
            tmp = tmp[tmp.length - 1].treatments;   // use last index to get treatments
            
            var nFactors = tmp.length;
            var toAdd    = treatmentsTotal - nFactors;
            
            var disabled = tmp[0].disabled;
            
            if( toAdd < 0 ){
                for(var ii=toAdd; ii<0; ii ++)
                    tmp.pop();
            }
            else if (toAdd > 0) {
                for(var ii=0; ii<toAdd; ii++)
                {
                    var ndx = nFactors + ii;

                    var newEl = {"label": "No. of Levels in Factor "+ (ndx+1),
                                "min":2,    "max":20,   "step":1, "click":"", 
                                "model": "calculator.treatments["+ndx+"].levels",
                                "disabled":disabled,
                                "tooltip":"'Select the total number of groups in each Effect (a Treatment or Factor).'",
                                "tooltip_link": "standalone.groups"};
                    tmp.push( newEl );
                }
            }
		
			for(var ii=0; ii<treatmentsTotal; ii++)
			{
				tmp[ii].label = "No. of Levels in Factor " + (ii+1);
			} 
			
			//-------------------------------------------------
			if( RMflag )
			{
				this.data.esComb = this.generateEffectCombo(this.data.esComb, treatmentsTotal );
				
				tmp[0].label = "Number of Time Points"
				for(var ii=1; ii<treatmentsTotal; ii++)
				{
					tmp[ii].label = "No. of Levels in Factor " + ii;
				}
			}
        }

        //-------------------------------------------------
        // changeTreatmentTable()
        var nGroups_old = this.treatments.length;
        var nGroups_new = treatmentsTotal;
        var change = nGroups_new - nGroups_old;
        
        if (change > 0){
            for (var i=1; i<=change; i++){
                var newGroup = {treatment: nGroups_old+i, levels: 2, description: null};
                this.treatments.push( newGroup );
            }
            
        } else if (change < 0){
            if( nGroups_old == 3 )
                return;
            if(nGroups_old - change < 3)
                return;
            
            this.treatments.splice(nGroups_new, Math.abs(change));
        }
        
        return treatmentError;
    };

    //------------------------------------------------------------
    this.resetDG = function()
    {
        var formData    = designService.formData;
        var effectSize  = Number( formData.effectSize );
        var stdev       = Number( formData.stdev );
        
        if( !( effectSize==null || effectSize=='') ) {
            this.data.esMean = effectSize;
            
            if( designService.isRMPS1() ){
                //this.data.esComb.effect[0] = effectSize;
            }
        }
        
        if( !(stdev==null || stdev=='') )
        {
            if( designService.isANOVA1() || designService.isANOVA2() || designService.isANOVAm() ) { // ANOVA 
                this.data.esSD_AOV = stdev;
            } else {
                this.data.esSD = stdev;
            }
        }
        
        var repMeas                 = Number( formData.repMeas.checked );
        var nTreatments             = formData.treatments.length;
        var nFactors                = formData.factors.length;
        this.data.groups            = designService.numGroups;
        this.data.treatmentsTotal   = nTreatments + nFactors + repMeas;
        this.data.treatmentsTotalRM = this.data.treatmentsTotal - 1;
        
        var treatmentError = this.updateTreatments();
        
        if( repMeas ) {
            if( designService.isRMPS1() )
            {
                this.data.treatmentsTotalRM = this.data.treatmentsTotal - 1;
                //this.data.esComb.effect[0]  = effectSize;

                this.treatments[0].levels = Number( formData.repMeas.timePts );
                this.treatments[0].description = 'Time';
                this.treatments[0].es = Number( formData.repMeas.checkboxes.measDiffOverTime.esSm );

                this.data.wsSD_RM = Number( formData.repMeas.withinSD );
                this.data.bsSD_RM = Number( formData.repMeas.betweenSD );
            } 
            else if( designService.isRMCS1() )
            {
                this.treatments[0].levels = Number( formData.treatments[0].level.length+1 );
                this.treatments[0].description = formData.treatments[0].description;

                this.data.wsSD_RM = Number( formData.repMeas.withinSD );
                this.data.bsSD_RM = Number( formData.repMeas.betweenSD );
            }
        }
        
        for (var i=0; i<nTreatments; i++){
            var ndx      = i + repMeas;
            var newLevel = formData.treatments[i].level.length+1;
            var desc     = formData.treatments[i].description;

            var trt_tmp  = this.treatments[ndx];
            
            trt_tmp.levels      = newLevel;
            trt_tmp.description = desc;
            trt_tmp.es          = Number( 5+i );
        }

        for (var i=0; i<nFactors; i++){
            var newLevel = formData.factors[i].level.length;
            var ndx      = i + repMeas + nTreatments;
            var trt_tmp  = this.treatments[ndx];
            
            trt_tmp.levels      = newLevel;
            trt_tmp.description = formData.factors[i].description;
        }
        
        return treatmentError;
    };
 }    
})();