'use strict';

app.directive('tooltip', [function() {
  return {
    restrict: 'E',
    scope: {
        content: '=',
    },
    
    template: '<span class="fa-stack" uib-tooltip="{{content}}" ' + 
              '         tooltip-placement="top-right" ' + 
              '         tooltip-class="customClass"> ' + 
              '     <i class="fa fa-circle fa-stack-2x"></i>' + 
              '     <i class="fa fa-question fa-stack-1x"></i>' + 
              '</span>'
  };
}]);

app.directive('tooltipModal', ['$uibModal', function($uibModal) {
  return {
    restrict: 'E',
    controller: designGuide_modals,
    transclude: true,
    
    scope: {
        content: '@',
        modal: '='
    },
    link: function(scope, elem, attrs, ctrl) {
        //console.log( scope );
    },    
    template: '<span ng-controller="designGuide_modals" class="fa-stack" ' + 
              '         uib-tooltip-html="{{content}}" ' + 
              '         ng-click="open(modal)" ' + 
              '         tooltip-placement="top-right" tooltip-class="customClass">' + 
              '     <i class="fa fa-circle fa-stack-2x"></i>' + 
              '     <i class="fa fa-question fa-stack-1x"></i>' + 
              '</span>'
  };
}]);

app.directive('tooltipLink', ['$uibModal', function($uibModal) {
  return {
    restrict: 'E',
    controller: ['$scope', '$rootScope', '$uibModal', function ($scope, $rootScope, $uibModal) {
        $scope.tooltip = {};
        
        function init()
        {
            $scope.tooltip = {
                std: 'Enter the Standard Deviation (between 0.01 and 500).',
                sig: 'A common value is 0.05.',
                effect: 'Enter a number for the effect size.',
                effectAbs: 'The effect size in terms of your units as entered in the DesignGuide.',
                sample: 'Select a whole number between 2 and 500.',
                power: 'A power of 0.8 or higher is often used.',
                groups: 'Select the total number of levels in one factor (a Treatment or Nontreatment) in your design. Go through our DesignGuide for a recommendation.',
                factors: 'Enter the number of factors. (Default 3.  If more than 3, consult a statistician.)',  
            };
            
            var moreInfo = "<hr> Click for more detailed help.";
            for(var ii in $scope.tooltip)
            {
                $scope.tooltip[ii] = $rootScope.trustHTML($scope.tooltip[ii] + moreInfo);
            }
        };
        init();
    }],
    
    scope: {
        content: '=',
        url: '@'
    },
    
    template: '<a ui-sref="{{url}}" target="_blank">' + 
              '  <span class="text-black fa-stack" ' + 
              '         uib-tooltip-html="{{content}}" '+
              '         tooltip-placement="top-right" ' + 
              '         tooltip-class="customClass">' + 
              '     <i class="fa fa-circle fa-stack-2x"></i>' + 
              '     <i class="fa fa-question fa-stack-1x"></i>' + 
              '  </span>'+
              '</a>'
  };
}]);

app.directive('tooltipWarn', [function() {
  return {
    restrict: 'E',
    scope: {
        content: '=',
    },
    
    template: '<span ng-controller="designGuide_modals" class="fa-stack" ' + 
              '         uib-tooltip="{{content}}" tooltip-placement="top-right" ' + 
              '         tooltip-class="customClass"> ' + 
              '     <i style="color:red;" class="fa fa-circle fa-stack-2x"></i>' + 
              '     <i class="fa fa-exclamation fa-stack-1x"></i>' + 
              '</span>'
  };
}]);

app.directive('rLogo', [function() {
  return {
    restrict: 'E',
    scope: true,
    template: '<img ng-src="{{imgPath}}/logos/Rlogo.png"></img>'
  };
}]);

app.directive('katex', [function() {
    function render(katex, text, element) {
        try {
            katex.render(text, element[0]);
        }
        catch(err) {
            element.html("<div class='alert alert-danger' role='alert'>" + err + "</div>");
        }
    };

    return {
        restrict: 'AE',

        link: function (scope, element) {
            var text = element.html();
            
            // '&' is converted to '&amp;' when passed to directive. Change it back to an ampersand.
            text = text.replace(/&amp;/g, '&');
            
            if (element[0].tagName === 'DIV') {
                element.addClass('text-center');
                text = '\\displaystyle {' + text + '}';
                element.addClass('katex-outer').html();
            }
            if (typeof(katex) === 'undefined')
                require(['katex'], function (katex) {
                    render(katex, text, element);
                });
            else
                render(katex, text, element);
        }
    };
}]);

app.directive('spinnerImgLoad', function() {
    return {
        restrict: 'A',
        
        link: function(scope, element) {
            //console.log( element );
            // add spinner
            //  Options: fa-circle-o-notch, fa-spinner
            element.after('<span class="loading"> <i class="fa fa-circle-o-notch fa-spin text-grey fa-2x"></i> </span>');
            
            element.on('load', function() {
                //console.log( 'LOADED' );
                // Remove spinner <span> element
                element.parent().find('span').remove();
            });
            
            scope.$watch('ngSrc', function() {
                //console.log('here');
            });
        }
    };
});

app.directive('spinnerDivLoad', function() {
    return {
        restrict: 'A',
        
        link: function (scope, element, attrs) {
            var originalContent = element.html();

            element.after('<div class="row text-center padding-2em"><span class="loading"> <i class="fa fa-circle-o-notch fa-spin text-grey fa-3x"></i> </span></div>');
            
            element.addClass('hidden');
            
            element.ready( function() {
                element.removeClass('hidden');          // un-hide div
                element.parent().find('span').remove(); // remove spinner
            });
        }
    };
});

app.directive('uibHeadingWithIcon', [function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: { 
            title: '=', 
            active:'='
        },
        // adding the <p style...> makes the entire heading element clickable
        template: '<uib-accordion-heading> <p style="margin-bottom: 0;"> {{title}} <i class="pull-right fa" ng-class="{\'fa-minus\': active, \'fa-plus\': !active }"></i></p>  </uib-accordion-heading>'
    };
}]);
