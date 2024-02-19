'use strict';

app.controller('designGuideWalkthroughController', [
        '$scope', '$rootScope', 'uiTourService', 'designService',   
function designGuideWalkthroughController($scope, $rootScope, TourService, designService)
{
    // Walkthrough
    designService.tourCreated = [0, 0, 0, 0, 0, 0];
    $scope.tourInit = function(step)
    {
        var designPages = ['start', 'treatments', 'factors', 'outcome', 'calc', 'end'];
        var tour = TourService.getTourByName( designPages[step] );
        
        if(step === 0 && !designService.tourCreated[step])
        {
            designService.tourCreated[step] = 1;
            
            tour.createStep({
                elementId: 'pageIntro0',  // Ids are defined in quiz.*.html files
                order: 0,
                orphan: true,
                title: 'Welcome!',
                trustedContent: $rootScope.trustHTML('Welcome to DesignGuide. We will walk you through an example, Case 1 in Case Studies under HELP.<br><br>' + 'You will be prompted to enter data to each field.'),
            });
            tour.createStep({
                elementId: 'dg-hypoth',
                order: 10,
                title: 'Hypothesis',
                trustedContent: $rootScope.trustHTML('Enter your hypothesis here.  Case 1 hypothesis: <br><br> <b>Pharmacological activation of Group II metabotropic glutamate receptors with compound DCG-IV will reduce neuronal cell degeneration measured at 24 hours after experimental TBI in rats.</b> <br><br>  Tip: you can simply copy and paste the above.'),
            });
            tour.createStep({
                elementId: 'dg-outMeas',
                order: 20,
                title: 'Outcome Measure',
                trustedContent: $rootScope.trustHTML('Case 1 outcome measure: <b>Degenerating cells </b>'),
            });
            tour.createStep({
                elementId: 'dg-outUnits',
                order: 30,
                title: 'Outcome Measurement Units',
                trustedContent: $rootScope.trustHTML('Case 1 outcome measure unit: <b>Number of cells</b>'),
            });
        } else if (step === 1 && !designService.tourCreated[step] )
        {
            designService.tourCreated[step] = 1;
            
            tour.createStep({
                elementId: 'pageIntro1',
                order: 0,
                orphan: true,
                title: 'Treatments',
                trustedContent: $rootScope.trustHTML('This case has <b>one</b> treatment and <b>three</b> levels.'),
            });
/*            tour.createStep({
                elementId: 'case1-treatment1',
                order: 10,
                title: 'Treatment 1',
                trustedContent: $rootScope.trustHTML('Name: <b>drug</b>' + '<br>Number of Levels: <b>3</b>' 
                    + '<br>Control Type: <b>Vehicle</b>' + '<br>Control Name: <b>Artificial CSF</b>'),
            }); */
            tour.createStep({
                elementId: 'case1-t1Name',
                order: 10,
                title: 'Treatment 1 Name',
                trustedContent: $rootScope.trustHTML('Case 1: <b>drug</b>'),
            });
            tour.createStep({
                elementId: 'case1-t1nLevel',
                order: 20,
                title: 'Treatment 1 No. of Levels',
                trustedContent: $rootScope.trustHTML('Case 1: <b>3</b>'),
            });
            tour.createStep({
                elementId: 'case1-t1cType',
                order: 30,
                title: 'Treatment 1 Control Type',
                trustedContent: $rootScope.trustHTML('Case 1: <b>Vehicle</b>'),
            });
            tour.createStep({
                elementId: 'case1-t1cName',
                order: 30,
                title: 'Treatment 1 Control Name',
                trustedContent: $rootScope.trustHTML('Case 1: <b>Artificial CSF</b>'),
            });
            tour.createStep({
                elementId: 'case1-t1Levels',
                order: 30,
                title: 'Treatment 1 Levels',
                trustedContent: $rootScope.trustHTML('Case 1:'
                        + '<br>Setting 1: <b>  20 fmol DCG-IV</b>'
                        + '<br>Setting 2: <b> 100 fmol DCG-IV</b>'
                        + '<br>Setting 3: <b> 500 fmol DCG-IV</b>'),
            });                
            tour.createStep({
                elementId: 'additional-control',
                order: 40,
                title: 'Additional Control',
                trustedContent: $rootScope.trustHTML('Case 1 has no additional controls.'),
            });
        } else if (step === 2 && !designService.tourCreated[step] )
        {
            designService.tourCreated[step] = 1;
            
            tour.createStep({
                elementId: 'pageIntro2',
                order: 0,
                orphan: true,
                title: 'Factors',
                trustedContent: $rootScope.trustHTML('No additional information.'),
            });
            tour.createStep({
                elementId: 'fct-dg-check',
                order: 10,
                title: 'Check Your Design',
                trustedContent: $rootScope.trustHTML('Click this button to check your current design again!'),
            });
        } else if (step === 3 && !designService.tourCreated[step] )
        {
            designService.tourCreated[step] = 1;
            
            tour.createStep({
                elementId: 'pageIntro3',
                order: 0,
                orphan: true,
                title: 'Outcome Measure',
                trustedContent: $rootScope.trustHTML('We will enter information about effect size.'),
            });
            tour.createStep({
                elementId: 'outMeas-largediff',
                order: 10,
                title: 'Largest possible effect size',
                trustedContent: $rootScope.trustHTML('125'),
            });
            tour.createStep({
                elementId: 'outMeas-smalldiff',
                order: 20,
                title: 'Smallest possible effect size',
                trustedContent: $rootScope.trustHTML('75'),
            });
            tour.createStep({
                elementId: 'outMeas-SD',
                order: 30,
                title: 'Standard Deviation',
                trustedContent: $rootScope.trustHTML('125'),
            });
        } else if (step === 4 && !designService.tourCreated[step] )
        {
            designService.tourCreated[step] = 1;
            
            tour.createStep({
                elementId: 'pageIntro4',
                order: 0,
                orphan: true,
                title: 'Sample Size',
                trustedContent: $rootScope.trustHTML('No additional information.'),
            });
            tour.createStep({
                elementId: 'sim-your-design',
                order: 10,
                title: 'Sample Size',
                trustedContent: $rootScope.trustHTML('Click this button to simulate your design.'),
			});
            tour.createStep({
                elementId: 'dg-genReport',
                order: 20,
                title: 'Sample Size',
                trustedContent: $rootScope.trustHTML('Click this button to generate report.'),
			});
			
        }
        tour.start();
    };
    
}
]);
