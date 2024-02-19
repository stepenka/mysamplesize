"use strict";

app.controller("toolsController", [
  "$scope",
  "designService",
  "calculatorService",
  "$http",
  "$q",
  "$uibModal",
  "$timeout",
  toolsController
]);
function toolsController(
  $scope,
  designService,
  calculatorService,
  $http,
  $q,
  $uibModal,
  $timeout
) {
  $scope.toolsPath = "/static/partials/webpage_tools/";

  $scope.esTooltip = {
    content:
      "This is <u>NOT</u> Cohen's D effect size. Click the help (?) for more details.",
    enabled: function (item_label) {
      var isEffectSizeInp = (item_label == "Effect Size");
      return isEffectSizeInp;
    },
  };

  $scope.design = designService;

  $scope.$watch("design.stat.selectedOption", function() {
    $scope.reset($scope.calculator.data.tool, "selected option change reset");
  });

  $scope.calculator       = calculatorService;
  $scope.anyError         = {tf: false};
  $scope.groupError       = false;
  $scope.treatmentError   = false;
  $scope.anyError.msg     = "";

  /* Calculator Tools */
  //Set up helper variables

  $scope.AOVMcomb = {values: [], display: []};

  // add a function to call from a child controller
  $scope.empty = function() {};
  $scope.childFunction = $scope.empty;
  $scope.register = function(tmp) {
    //console.log( "registering function"); console.log(tmp);
    $scope.childFunction = tmp;

    $scope.reset();
  };

  designService.notEmbedded = true;

  //Reset all values when new Statistical Test is selected
  $scope.reset = function(toolType, tmp)   // input is used for when embedded in DG
  {
    if (tmp) {
      //console.log(tmp);
    }

    $scope.calculator = calculatorService;  // reset to calculatorService defaults

    if (typeof(toolType) !== "undefined")
      $scope.calculator.data.tool = toolType;

    // change tool type base on current state
    //if (typeof $scope.state!="undefined") {
    if ($scope.state.current.name == "tools.powersize") {
      $scope.calculator.data.tool = "power";
    } else if ($scope.state.current.name == "tools.samplesize") {
      $scope.calculator.data.tool = "samplesize";
    } else {
      $scope.childFunction(); //error for page change??
    }
    //}

    if ($scope.design.isANOVAm()) {
      $scope.calculator.data.treatmentsTotal = 3;
      $scope.calculator.data.groups          = 3;
    } else if ($scope.design.isANOVA2()) {
      $scope.calculator.data.treatmentsTotal = 2;
      $scope.calculator.data.groups          = 2;
    } else if ($scope.design.isRMPS1() || $scope.design.isRMCS1()) {
      $scope.calculator.data.treatmentsTotal = 1;
    }

    //Use DesignGuide Results instead, if DG completed
    if ($scope.design.DGcompleted==true) {
      calculatorService.resetDG();
    } else {
      calculatorService.data.esComb = {index: [], effect: [5]};
    }

    // $scope.calculator.data.tool has been set by this point
    if ($scope.calculator.data.tool == "power") {
      $scope.calculator.data.samplesize = 10;
    } else if ($scope.calculator.data.tool == "samplesize") {
      $scope.calculator.data.pow = 0.8;
    }

    $scope.anyError.tf = false;
    return $scope.calculate();
  };

  $scope.resetToDG = function() {
    console.log("resetting to DG data");
    calculatorService.resetDG();
  };

  //*
  //force reset when user switches over from DesignGuide page
  $scope.$watch("design.statMethod", function () {
    if (designService.DGcompleted==true) {
      calculatorService.resetDG();
    } else {
      return;
    }
  });
  //*/

  //Calculate Rows for Treatments and Groups
  function updateGroups() {
    var isgroupError = errorWholeNumber($scope.calculator.data.groups);
    if (isgroupError==true) {
      $scope.groupError = true;
    } else if (isgroupError==false) {
      $scope.groupError = false;
    }
  };
  $scope.$watch("calculator.data.groups", function (newVal, oldVal) {
    updateGroups();
  });

  /* Calculate Power/Sample Size and Save */
  function doCalc(data) {
    return $http({
      method: "POST",
      url: "/calculate",
      headers: {"Content-Type": "application/json"},
      data: data
    }).then(
	  function successCallback(response) {
        if (response.data.error) {
          $scope.anyError.tf = true;
          $scope.anyError.msg = response.data.msg;
          return;
        }

        if (data.tool=="samplesize") {
          // console.log("in toolsController.js: ", data);  // yw

          $scope.calculator.data.totalNGroups = $scope.nGroupsForCalcDisplay;

          $scope.calculator.data.samplesize   = response.data.value;
          $scope.calculator.data.samplesizePD = response.data.valueDunnett;
          $scope.calculator.data.samplesizePT = response.data.valueTukey;
          $scope.calculator.data.power = response.data.power;
          $scope.calculator.data.powerPD = response.data.powerDunnett;
          $scope.calculator.data.powerPT = response.data.powerTukey;
          $scope.calculator.data.warn = response.data.warning;
          //console.log(response.data.warning)
          $scope.calculator.data.warnPD = response.data.warnDunnett;
          $scope.calculator.data.warnPT = response.data.warnTukey;
        } else if (data.tool=="power") {
          $scope.calculator.data.pow   = response.data.value;
          $scope.calculator.data.powPD = response.data.valueDunnett;
          $scope.calculator.data.powPT = response.data.valueTukey;
        }
      }, 
	  function errorCallback(response) {}
	);
  };

  $scope.calculate = function() {
    var deferred = $q.defer();

    if ($scope.design.isNone()) {    // nothing selected
      deferred.resolve();
      return deferred.promise;
    }

    $scope.anyError.tf = false;

    // change tool type
    if ($scope.state.current.name == "tools.powersize") {
      $scope.calculator.data.tool = "power";

      // check Sample Size is a whole number
      if (errorWholeNumber($scope.calculator.data.samplesize)) {
        $scope.anyError.tf = true;
        $scope.anyError.msg = "Sample size must be a whole number";
        //return;
      }
    } else if ($scope.state.current.name == "tools.samplesize") {
      $scope.calculator.data.tool = "samplesize";
    }

    $scope.treatmentError = $scope.calculator.updateTreatments();
    updateGroups();
    $scope.calculator.effectCalc($scope.design.stat.selectedOption.id);

    var isError = false;
    var data    = $scope.calculator.data;

    if ($scope.design.isNone()) {
      return;
    } else if ($scope.design.isANOVA2()) {
      $scope.calculator.AOV2calc();
      $scope.AOVMcomb.values = calculatorService.genCombinations();	// added for sample size display purposes

      data = $scope.calculator.AOV2;
      //data.totalNGroups = data.k; / somehow pass this to saveController??

      if (
	    $scope.groupError==true ||
	    $scope.treatmentError==true ||
		!data.tool ||
		!data.dfM ||
		!data.dfI ||
		!data.dfS ||
		!data.sig
      ) {
        isError = true;
        console.log("err1");
      }

      if (
	    $scope.calculator.data.tool=="samplesize" && 
		(!data.k || !data.es || !data.pow)
	  ) {
        isError = true;
        console.log("err2");
      }

      if (
	    $scope.calculator.data.tool=="power" && (!data.df2 || !data.lambda)
      ) {
        isError = true;
        console.log("err3");
      }
            
    } else if ($scope.design.isANOVAm()) {
      $scope.AOVMcomb.values = calculatorService.genCombinations();
      $scope.calculator.AOVmultiCalc($scope.AOVMcomb.values);

      data = $scope.calculator.AOVmulti;
      //data.totalNGroups = data.k;

      if (
	    $scope.groupError==true ||
		$scope.treatmentError==true ||
		!data.tool ||
		!data.df1
      ) {
        isError = true;
        console.log("err1");
        console.log(data);
      }

      if ($scope.calculator.data.tool=="samplesize" && !data.pow) {
        isError = true;
        console.log("err2");
      }

      if (
	    $scope.calculator.data.tool=="power" && 
		(!data.df2 || !data.lambda)
      ) {
        isError = true;
        console.log("err3");
      }

    } else if ($scope.design.isRMPS1()) {
      $scope.calculator.RMPS1calc(
	    $scope.calculator.data.esComb.effect, 
		$scope.calculator.data.esComb.index
      );

      data = $scope.calculator.RMPS1;
      data.groups = $scope.calculator.data.groups;

      for (var ii = 0; ii<$scope.calculator.data.esComb.effect.length; ii++) {
        var tmp = $scope.calculator.data.esComb.effect[ii];
        if (!tmp) {
          console.log("RM effect size error");
          isError = true;
          break;
        }
      }

      if (
        $scope.groupError == true ||
        $scope.treatmentError == true ||
        !data.tool || !data.df1 ||
        !data.df2 || !data.lambda
      ) {
        isError = true;
        console.log("err1");
      }

      if ($scope.calculator.data.tool == ("samplesize" && !data.pow)) {
        isError = true;
        console.log("err2");
      }

      if (
        $scope.calculator.data.tool == "power" &&
        (!data.df2 || !data.lambda)
      ) {
        isError = true;
        console.log("err3");
      }

    } else if ($scope.design.isRMCS1()) {
      $scope.calculator.RMCS1calc();

      data = $scope.calculator.RMCS1;
      data.groups = $scope.calculator.data.groups;

      if (
        $scope.groupError == true ||
        $scope.treatmentError == true ||
        !data.tool || !data.sig ||
        !data.df1 || !data.lambda
      ) {
        isError = true;
        console.log("err1");
      }

      if (
        $scope.calculator.data.tool == "samplesize" && 
        (!data.pow || !data.k)
      ) {
        isError = true;
        console.log("err2");
      }

      if ($scope.calculator.data.tool == "power" && !data.df2) {
        isError = true;
        console.log("err3");
      }
            
    } else {
      data = $scope.calculator.data;

      if (
        $scope.groupError == true ||
        $scope.treatmentError == true ||
        !data.tool || !data.es ||
        !data.sig || !data.groups
      ) {
        isError = true;
        console.log("err1");
      }
			
	  // if sample size calc, but power not entered
      if ($scope.calculator.data.tool == "samplesize" && !data.pow) {
        isError = true;
        console.log("err2");
      }
      // if power calc and samplesize not entered
      if ($scope.calculator.data.tool == "power" && !data.samplesize) {
        isError = true;
        console.log("err3");
      }
    };

    data.treatmentsTotal = $scope.calculator.data.treatmentsTotal;

    data.test = $scope.design.stat.selectedOption.name;
    calculatorService.calcData = data;

    /* Created false errors
    // if sample size calc, but power not entered
    if ($scope.calculator.data.tool=="samplesize" && !data.pow){
      isError = true;
      console.log("err2");
    }
    // if power calc and samplesize not entered
    if ($scope.calculator.data.tool=="power" && !data.samplesize) {
      isError = true;
      console.log("err3");
    }
    if (
      $scope.groupError==true ||
	  $scope.treatmentError==true ||
	  !data.tool || !data.es ||
	  !data.sig || !data.groups
	) {
      isError = true;
      console.log("err1");
    }
    */
    if (isError) {
      $scope.anyError.tf = true;
      $scope.anyError.msg = "Invalid input value";
      console.log("ERROR: invalid input value");

      deferred.resolve(false);
    } else {
      data.samplesize = $scope.calculator.data.samplesize;
      data.pow = $scope.calculator.data.pow;
      data.es = $scope.calculator.data.es;

      var nGroups =
        !designService.notEmbedded *
        designService.formData.nControlAdditionalSelected;

      if (designService.isANOVA2())
        nGroups += calculatorService.AOV2.k;
      else if (designService.isANOVAm())
        nGroups += calculatorService.AOVmulti.k;
      else if (designService.isRMPS1())
        nGroups += calculatorService.RMPS1.trtProd;
      else if (designService.isRMCS1())
        nGroups += calculatorService.RMCS1.k;

      $scope.nGroupsForCalcDisplay = nGroups;

      calculatorService.calculateComplete = false;
      doCalc(data).then(function() {
        data.samplesize = $scope.calculator.data.samplesize;
        data.pow = $scope.calculator.data.pow;

        calculatorService.calcData = Object.assign(
          {},
          $scope.calculator.data,
          data
        ); // copy for DG report

        // console.log("Concatenate: ", $scope.calculator.data, data, calculatorService.calcData);
        calculatorService.calculateComplete = true;
        deferred.resolve(true);
      });
    }
    return deferred.promise;
  };
}
