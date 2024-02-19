'use strict';

app.controller('reportSupplementController', [
    '$scope', '$rootScope', '$state', '$http', 'designService', '$timeout', '$uibModal',
    reportSupplementController
]);

function reportSupplementController($scope, $rootScope, $state, $http, designService, $timeout, $uibModal)
{
    $scope.swipe_class = {name: 'swipe-views swipe-views-left'};
    $scope.changeSwipeClass = function(step){        
        if( step > $scope.step.current ){          // step down
            $scope.swipe_class.name = "swipe-views swipe-views-right";
        } else if (step < $scope.step.current ){   // step up
            $scope.swipe_class.name = "swipe-views swipe-views-left";
        }
    };
    
    // Step control in Supplement form
    $scope.step = {current : 0};        // needs to be a "structure"-type object to register AngularJS scope updating
    $scope.setStep = function(step){
        $scope.step.current = step;
    };
    $scope.stepUp = function(){
        $scope.setStep($scope.step.current+1);
    };
    $scope.stepDown = function(){
        $scope.setStep($scope.step.current-1);
    };

    // =============================================================================
    // VARIABLES
    // =============================================================================

    $scope.formData = {

        // =============================================================================
        // INTRO
        // =============================================================================
        abstractElements : [
            {name: "Short summary of the background highlighting the importance of this research",    id: 0, selected: 0},
            {name: "Research objective",      id: 1, selected: 0},
            {name: "Species used",       id: 2, selected: 0},
            {name: "Key methods",       id: 3, selected: 0},
            {name: "Principal findings",        id: 4, selected: 0},
            {name: "Conclusions of the study",        id: 5, selected: 0},
        ],

        title: [],
        authors: [],

    
        // =============================================================================
        // METHODS
        // =============================================================================
        
        methods: {
            ethicalStatement: [],
            
            experimentalGroups : {
                selected: 0,
                n: [1,2,3,4,5]
            },
            
            controlGroups : {
                selected: 0,
                n: [1,2,3,4,5]
            },
            
            bias: [
                {name: "Randomization", id: 0, selected: 0},
                {name: "Blinding", id: 1, selected: 0},
            ],
            
//            expUnit: designService.formData.expUnits,
            outMeas: designService.formData.outMeas,
            
            expProcedures: [
                {content: null, name:"Drug Formulation"},
                {content: null, name:"Drug Dosage"},
                {content: null, name:"Site of Drug Administration"},
                {content: null, name:"Route of Drug Administration"},
                {content: null, name:"Anesthesia and/or Analgesia used"},
                {content: null, name:"Surgical Procedure(s) used"},
                {content: null, name:"Method of Euthanasia"},
                {content: null, name:"Time of Day procedure was carried out at"},
                {content: null, name:"Location procedure was carried out at"},
                {content: null, name:"Further explanation (if necessary)"},
            ],
            
            expSubject: [
                {content: null, name: "Species Used"},
                {content: null, name: "Strain Used"},
                {content: null, name: "Sex"},
                {content: null, name: "Developmental Stage or Age"},
                {content: null, name: "Weight"},
                {content: null, name: "Source of Subjects"},
                {content: null, name: "International Strain Nomenclature"},
                {content: null, name: "Genetic Modification Status"},
                {content: null, name: "Genotype"},
                {content: null, name: "Health/Immune Status"},
                {content: null, name: "Drug or Test Naive"},
                {content: null, name: "Previous Procedures"},
                {content: null, name: "Other"},
            ],
            
            housingHusbandry: [
                {content: null, name: "Housing"},
                {content: null, name: "Breeding Program"},
                {content: null, name: "Light/Dark Cycle"},
                {content: null, name: "Temperature"},
                {content: null, name: "Food"},
                {content: null, name: "Environmental Enrichment"},
                {content: null, name: "Other"},
                {content: null, name: "Welfare Related Assessments"},
            ],
            
            sampleSize: {
                totalSubjects: null,
                totalSubjectsExpl: null,
            },
        

            allocation: {
                how: null,
                order: null,
            },
        },
        
        //{content: null, name: ""},


        // =============================================================================
        // RESULTS
        // =============================================================================
        results: {
            numbersAnalyzed: [
                {content: null, name: "How many animals were included in the final analysis?"},
                {content: null, name: "How many animals were not included?"},
                {content: null, name: "Why?"},
            ],

            outcomes: [{
                content: null,
                name: "Report the results for each analysis carried out, with a measure of precision",
                placeholder: "e.g. standard error or confidence interval",
            }],
            
            // reportTypes moved from Design Guide -- need to put this in ARRIVE form
            reportTypes : {
                selected: 0,
                options: [
                    {name: "Percentage",            id: 0},
                    {name: "Exact Number",          id: 1},
                    {name: "Standard Deviation",    id: 2},
                    {name: "Standard Error",        id: 3},
                    {name: "Sample Mean",           id: 4},
                    {name: "Median",                id: 5},
                    ],
            },

            adverseEvents: [
                {content: null, name: "Give details of all important adverse events in each experimental group"},
                {content: null, name: "Describe any modifications to the experimental protocols made to reduce adverse events"},
            ],
        },
            
        stats: [
            {content: null, placeholder: null, name: "Provide details of the statistical tests used for each analysis"},
            {content: null, name: "Specify the unit of analysis for each dataset", placeholder: "e.g. single animal, group of animals, single neuron"},
            {content: null, placeholder: null, name: "Describe any methods used to assess whether the data met the assumptions of the statistical approach"},
        ],
        
        // =============================================================================
        // DISCUSSION
        // =============================================================================

        discussion: {
            interpret: [
                {content: null, name: "Interpret the results, taking into account the study objectives and hypotheses, current theory and other relevant studies in the literature"},
                {content: null, name: "Comment on the study limitations including any potential sources of bias, any limitations of the animal model, and the imprecision associated with the results"},
                {content: null, name: "Describe any implications of your experimental methods or findings for the replacement, refinement or reduction (the 3Rs) of the use of animals in research"},
            ],
        },
        
        // =============================================================================
        // REPEATED MEASUREMENTS
        // =============================================================================
    };
    
    // Set form defaults here
    //$scope.formData.controlTypeSelected  = $scope.formData.controlTypes.options[4];
    //$scope.formData.nTreatments.selected = $scope.formData.nTreatments.options[0];
    
    $scope.buttonClick = {wait: false};
    
    $scope.genReport = function(file_extension)
    {
        $http({
            method: 'POST',
            url: '/compute_latex',
            headers: {'Content-Type': 'application/json'},
            data: $scope.formData
            
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            
            var filename = response.data.result;
            console.log(filename);
            console.log('download successful')
            
            $scope.buttonClick.wait = false;
            
            //download file
            window.location.replace('/download=ARRIVE'+file_extension);
            
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
};
