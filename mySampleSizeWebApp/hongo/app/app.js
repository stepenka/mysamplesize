/* Main AngularJS Web Application */
var app = angular.module('tempestApp', [
    // Angular modules
    'ngAnimate',                                        // for bootstrap css
    // 3rd Party Modules
    'ui.router',                                        // a better router to $routeProvider
    'ui.bootstrap',                                     // bootstrap css module
    'ncy-angular-breadcrumb',                           // breadcrumb for navigation menu
    'bm.uiTour', 
    'nvd3', 'rzModule',                                 // for graphics, plotting
]).
config(['$stateProvider', '$urlRouterProvider', '$breadcrumbProvider', '$sceDelegateProvider','$uiViewScrollProvider', 'TourConfigProvider', '$compileProvider', '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $breadcrumbProvider, $sceDelegateProvider, $uiViewScrollProvider, TourConfigProvider, $compileProvider, $locationProvider) {
    
    $uiViewScrollProvider.useAnchorScroll();

    // The next group is for performance boost
    $compileProvider.debugInfoEnabled(false);
    $compileProvider.commentDirectivesEnabled(false);
    $compileProvider.cssClassDirectivesEnabled(false);
    
    $locationProvider.html5Mode({
        enabled: true                          // false: use "#/", true: use "/"
    });
    
    $breadcrumbProvider.setOptions({
        prefixStateName: 'home',
        template: 'bootstrap2'
    });
    
    $urlRouterProvider.rule(function($injector, $location) {
        var $rootScope = $injector.get("$rootScope");
        var currentUrl = $location.url().toLowerCase();
        var searchUrl = currentUrl.search("standalone");
        
        $rootScope.standalone = 0;
        
        // if 'standalone' is in the url, then set the variable $rootScope.standalone to 1
        if( searchUrl == 1)
            $rootScope.standalone = 1;
    });
    
    $urlRouterProvider.otherwise( function($injector, $location)
    {
        if( $location.url() === '')
            return $location.path('/');
        
        if( ($location.url()).length > 200)  //assume it's an auth0 call. need something better for this later?
        {
            console.log( $location.url() )
            return;
        }
        
        return $location.path('/404.html');
    });
    
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'https://localhost:1028/#/**',
    ]);

    // The blacklist overrides the whitelist so the open redirect here is blocked.
    $sceDelegateProvider.resourceUrlBlacklist([
    ]);
    
    // this line needed for Single-Page Apps
    TourConfigProvider.enableNavigationInterceptors();
}]).
run(['$rootScope', '$location', '$transitions', '$state', 'authService', '$q', '$sce', '$window', '$timeout', '$anchorScroll', 
function($rootScope, $location, $transitions, $state, authService, $q, $sce, $window, $timeout, $anchorScroll)
{
    $rootScope.$state = $state;
    
    $rootScope.design_report_url = '/design_report';
    $rootScope.imgPath       = './static/img';
    
    $rootScope.standalone    = 0;
    $rootScope.loginMessage  = '';
    
    $rootScope.trustSrc      = function(src){ return $sce.trustAsResourceUrl(src);};
    $rootScope.trustHTML     = function(src){ return $sce.trustAsHtml(src);};
    
    $rootScope.has_access = function(){
        var isAuthenticated = authService.authenticated;
        var isDelinquent    = authService.payment.delinquent;
        var isPaymentEnded  = authService.payment.ended;
        //console.log("hasacces?, auth,delinq,end", isAuthenticated, isDelinquent, isPaymentEnded);
        return isAuthenticated && !(isDelinquent || isPaymentEnded);
    };
    
    // grabToken to see if login required again.
    // This should already be handled by app.routes.js when requireLogin is true, 
    // but for local testing we are keeping this function here since only called once.
    $timeout( function(){
        authService.hasHandledInfo();
    }, 3000);
    
    $transitions.onSuccess({}, function (trans) {
        // scroll to top of page, id is defined in index.html
        $timeout( function(){
            $location.hash("topLevel"); // set this as the hash URL
            $anchorScroll();            // scroll to the hash
            $location.hash("");         // unset hash in URL
        }, 500);
        
        if( trans.to().name =="auth.logout" ) {
            $timeout(function(){ $state.go("auth.home"); }, 2000);
        }
    });
    
    $transitions.onBefore({}, function(trans)
    {
        var toState = trans.$to();
        var requireLogin = false;
        
        // if trying to go to account page with login/signup, but already signed in, reroute to "my Account" page
        if( toState.name == "auth.home" ){
            if( authService.authenticated )
                return trans.router.stateService.target('account.home');
        }
        
        /*  Adding this messes up login
        // If navigate to any account page but not logged in, go to auth home page
        if( toState.parent.name == "account" ){
            if( !authService.authenticated )
                return trans.router.stateService.target('auth.home');
        }
        */
        
        //$window.document.title = toState.self.ncyBreadcrumbLabel;
        var breadcrumb = toState.self.ncyBreadcrumb;
        if( breadcrumb) {
            $window.document.title = breadcrumb.label;  // use AngularJS to change page title after initial page load
        }
        
        // get requireLogin variable, if it exists, from the state parameter data
        try {
            requireLogin = toState.data.requireLogin;
        } catch(e) {
        }
        
        // Send info to Google Analytics about the pageview (for SPA)
        try {
            ga('send', 'pageview', $location.path());
        } catch (error) {
            //console.log("Porblem sending pageview", error);
        }
    });
}]);
