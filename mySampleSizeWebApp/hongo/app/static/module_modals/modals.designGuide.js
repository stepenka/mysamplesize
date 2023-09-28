/* Navigation path */
var mpath = 'static/module_modals/modal_templates/';

// Modal Basic Controller //

app.controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', 'designService', function ($scope, $uibModalInstance, designService) {
    $scope.treatment_table = designService.treatment_table;
    $scope.ok = function () {
        $uibModalInstance.close('ok');
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

app.controller('ModalInstanceCtrl_designGuideExample', ['$scope', '$uibModalInstance', 'designService', '$state', function ($scope, $uibModalInstance, designService, $state) {
    $scope.ok = function () {

        // Set designService params to be consistent with case study 1
        designService.treatment_table = null;
        designService.formData.hypothesis = "Pharmacological activation of Group II metabotropic glutamate receptors with compound DCG-IV will reduce neuronal cell degeneration measured at 24 hours after experimental TBI in rats."
//        designService.formData.expUnits = "rats";
        $scope.formData.outMeas  = "degenerating cells";
        designService.formData.obsUnits = "number of cells";
        $scope.formData.effectSize = "75";
        $scope.formData.effectSizeLarge = "125";
        $scope.formData.stdev = "125";        
        designService.formData.treatments = [{
            level: [
                {id: 1, name: "20 fmol DCG-IV"},
                {id: 2, name: "100 fmol DCG-IV"},
                {id: 3, name: "500 fmol DCG-IV"},
            ],
            description: "drug",
            control: {name: "Vehicle", id: 0},
            control_desc: "Artificial CSF"
        }];
        designService.formData.factors = [];
        
        //var rootScope = $scope.$parent.$parent.$parent;
        //rootScope.designSuggest = designService;
        //rootScope.updateService();
        $state.go("design_guide")
        // close the window
        $uibModalInstance.close('ok');
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

// Modals for Design Guide
function designGuide_modals($scope, $rootScope, $uibModal) {
    $scope.animationsEnabled = true;
    $scope.moreInfo = "<hr> Click for more.";

    $scope.tooltip = {},
    
    $scope.init = function()
    {
        $scope.tooltip.hypothesis   = 'A clear statement postulating how your experimental system will behave.';
        $scope.tooltip.outcomeMeas  = 'A quantity you will measure in order to investigate your hypothesis.';
        $scope.tooltip.obsUnits     = 'Smallest unit from which to measure a response.';
        $scope.tooltip.baseline     = 'Measurements taken before the treatment is applied.';
        $scope.tooltip.ctrl         = 'Multiple control types can be used.';
        $scope.tooltip.covariates   = 'A characteristic of test subjects that varies continuously, like mass or age.';
        $scope.tooltip.factors      = 'A characteristic of test subjects that lies in discrete categories, like sex or litter.';
        $scope.tooltip.largeDiff    = 'The number you enter should be in the same units as your outcome measure (e.g. g, cm, sec). Its value is an optimistic estimate of the effect size.  The number is used as an upper bound for possible effect sizes.';
        $scope.tooltip.smallDiff    = 'The number you enter should be in the same units as your outcome measure (e.g. g, cm, sec). This value will represent a lower bound on your effect size and give you a conservative estimate for sample size. This value will be used in the calculation of power and sample size.';
        $scope.tooltip.outcomeSD    = 'Enter the subject-to-subject variability in the units of the outcome measure.';
        $scope.tooltip.listTreat    = 'List multiple treatments and levels.';
        $scope.tooltip.addTreat     = 'Add treatments by clicking the button.';
        $scope.tooltip.repMeasPSWS  = 'Enter the Standard Deviation (between 0.01 and 500).';
        $scope.tooltip.repMeasPSBS  = 'Enter the Standard Deviation (between 0.01 and 500).';
        $scope.tooltip.typeStatTest = 'Go through our DesignGuide for a recommendation.';        
        
        $scope.tooltip.csvdata      = 'You can enter data directly into the text box below or upload a CSV file. Click here for more information about data formatting.';
        $scope.tooltip.analyzedata  = '';
        
        for(var ii in $scope.tooltip)
        {
            $scope.tooltip[ii] = $rootScope.trustHTML($scope.tooltip[ii] + $scope.moreInfo);
        }
        
        // Adding these later so no "Click for more." option.
        $scope.tooltip.outcomeUnits = 'The units of measure for your outcome.';
        $scope.tooltip.pilot        = 'A pilot study is a preliminary experiment that helps refine your research.';
        $scope.tooltip.litSources   = 'Prior work on related hypotheses with similar subjects can help with experimental design.';
        $scope.tooltip.addlCtrl     = 'Additional controls may be useful when a researcher is concerned about the impact of experiment\'s steps on the outcome. Checking outcomes in the presence of incremental changes can help diagnose unexpected results and maintain adherence to procedures. Generally speaking additional control groups do not come into play for considerations of statistical power, but they will increase the sample size needed.';
    };
    $scope.init();
    
    $scope.open = function(name, size)
    {
        var filename = 'error.html';
        var ctrl     = 'ModalInstanceCtrl';
        
        switch(name)
        {
            case 'example':     filename = 'designGuide.example.html'; ctrl = 'ModalInstanceCtrl_designGuideExample'; break;
            case 'hypothesis':  filename = 'design.hypothesis.html'; break;
            case 'outcomeMeas': filename = 'design.outcomeMeas.html'; break;
            case 'obsUnits':    filename = 'design.obsUnits.html'; break;
//            case 'expUnits':    filename = 'design.expUnits.html'; break;
            case 'baseline':    filename = 'design.baseline.html'; break;
            case 'ctrl':        filename = 'design.control.html'; break;
            case 'covariates':  filename = 'design.covariates.html'; break;
            case 'factors':     filename = 'design.factors.html'; break;
            case 'largeDiff':   filename = 'design.largeDiff.html'; break;
            case 'smallDiff':   filename = 'design.smallDiff.html'; break;
            case 'outcomeSD':   filename = 'design.outcomeSD.html'; break;
            case 'sdWithinSubjects': filename = 'design.sdWithinSubjects.html'; break;
            case 'sdBetweenSubjects': filename = 'design.sdBetweenSubjects.html'; break;
            case 'listTreat':   filename = 'design.treatmentsLevels.html'; break;
            case 'addTreat':    filename = 'design.treatment.html'; break;
            case 'csvdata':     filename = 'data.analysis.html'; break;
            case 'analyzedata': filename = 'button.analyzedata.html'; break;
            default: return; break;
        }
        
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: mpath+filename,
            controller: ctrl,
            size: size
        });
    };
    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };
};
designGuide_modals.$inject = ['$scope', '$rootScope', '$uibModal'];
app.controller('designGuide_modals', designGuide_modals);


//---------------------------------------------------------------
// Modal for menu in small screen size
app.controller('menu_modal', ['$scope', '$uibModal', function ($scope, $uibModal) {
    $scope.animationsEnabled = true;
    
    $scope.open = function(size)
    {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: mpath+'mini-menu.html',
            controller: 'ModalInstanceCtrl',
            size: size
        });
    };
    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };

}]);
