app.service("authService", [
  "$http",
  "$q",
  "$state",
  "$uibModal",
  function ($http, $q, $state, $uibModal) {
    var AUTH_IS_RESOLVED = false; // this is used to tell app.routes.js if it's ok to call has_access
    this.user_id = null;
    this.authenticated = false;
    this.email = null;
    this.customer_id = null;
    this.subProjectSelected = null;

    this.stripeInfo = null;

    this.payment = {
      delinquent: false,
      ended: false,
    };

    // This function is purely for app.routes.js RESOLVE
    this.hasHandledInfo = function () {
      var def = $q.defer();

      //console.log('AUTH IS RESOLVED call:', AUTH_IS_RESOLVED);

      if (!AUTH_IS_RESOLVED) {
        return this.checkAuth();
      } else {
        def.resolve();
      }
      return def.promise;
    };

    this.sqlprojects = {
      selected: 0,
      options: [
        { id: 0, name: "Login to Select a Project.", created: null, subs: [] },
      ],
    };

    this.getAccountInfo = function () {
      var authServ = this;
      AUTH_IS_RESOLVED = false;

      // pass user_id to Python to check if new user
      return $http
        .get("/get_stripe_account_info?user_id=" + authServ.user_id)
        .then(
          function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            AUTH_IS_RESOLVED = true;

            var data = response.data;

            // set Stripe ID
            authServ.customer_id = data.message.id;

            var subscriptions = data.message.subscriptions;
            //console.log( data );

            authServ.payment = { delinquent: false, ended: false };

            if (data.error == false) {
              //   if (
              //     angular.equals(subscriptions, {}) ||
              //     angular.equals(subscriptions.data, [])
              //   ) {
              //     data.error = true;
              //     data.message = "You don't have an associated subscription";
              //     authServ.payment.ended = true;
              //     return;
              //   }
              authServ.stripeInfo = subscriptions.data[0];
              authServ.stripeInfo.delinquent = data.message.delinquent;
              authServ.stripeInfo.email = data.message.email;
              authServ.stripeInfo.name = data.auth0.name;

              // this is for identifying account owners
              authServ.stripeInfo.coupon = data.message.coupon;

              // update delinquent payments to authService
              //   authServ.payment.delinquent = authServ.stripeInfo.delinquent;

              authServ.plan = authServ.stripeInfo.plan;
              authServ.plan.billing = authServ.stripeInfo.billing.replace(
                "_",
                " "
              );

              authServ.plan.trialing = authServ.stripeInfo.status == "trialing";
            } else {
              data.error = true;
              data.message = data.message;
              //   authServ.payment.ended = true;
              authServ.stripeInfo = {
                email: authServ.email,
              };
              AUTH_IS_RESOLVED = true;
            }
          },
          function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log(response);
          }
        );
    };

    this.handleGetProjects = function (projDict) {
      var authServ = this;

      authServ.sqlprojects.options = projDict;

      for (var ii = 0; ii < projDict.length; ii++)
        authServ.sqlprojects.options[ii].id = ii;

      // select the first one by default
      authServ.sqlprojects.selected = authServ.sqlprojects.options[0];

      authServ.sqlprojects.options.sort(function (a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });

      if (authServ.sqlprojects.selected)
        authServ.subProjectSelected = authServ.sqlprojects.selected.subs[0];
    };

    this.getProjects = function () {
      var authServ = this;

      // get user information from database
      return $http
        .get("/sqlprojects?user_id=" + authServ.user_id)
        .then(function (response) {
          var projDict = response.data;
          authServ.handleGetProjects(projDict);
        });
    };

    this.updateProfile = function (user_id, email) {
      var deferred = $q.defer();

      this.user_id = null;
      this.email = "webmaster@tempest-tech.com";

      if (user_id != null) {
        this.authenticated = true;
        this.email = email;
        this.user_id = user_id;

        //this.checkNewUser();  // should already be added to database through signup / Python backend
        this.getProjects();

        return this.getAccountInfo().then(function () {
          //console.log('account info retrieved');
          deferred.resolve();
          return deferred.promise;
        });
      }

      if (user_id == null) {
        this.user_id = 1;

        //this.email = "Guest";
        this.sqlprojects = {
          selected: 0,
          options: [
            { id: 0, name: "Login to Select a Project", created: null },
          ],
        };

        deferred.resolve();
      }

      return deferred.promise;
    };

    this.login = function () {
      window.location.href = "/login";
    };

    this.checkAuth = function () {
      var authServ = this;
      var def = $q.defer();

      $http({
        method: "GET",
        url: "/check_auth",
        headers: { "Content-Type": "application/json" },
      }).then(
        function successCallback(response) {
          var data = response.data;
          //console.log(data);

          authServ.authenticated = data.authenticated;

          if (authServ.authenticated) {
            data = data.user_info;
            authServ.user_id = data.user_id;
            authServ.email = data.email;

            return authServ
              .updateProfile(data.user_id, data.email)
              .then(function () {
                def.resolve();
                return def.promise;
              });
          } else {
            def.resolve();
            return def.promise;
          }
        },
        function errorCallback(response) {
          // called asynchronously if an error occurs
          def.resolve();
          console.log(response);
        }
      );

      return def.promise;
    };

    this.logOut = function () {
      this.authenticated = false;

      //$state.go('auth.logout');

      window.location.href = "/logout";
    };

    this.showEULA = function () {
      var EULA_modal = $uibModal.open({
        templateUrl: mpath + "EULA.html",
        size: "lg",
        controller: "ModalInstanceCtrl",
        backdrop: "static",
        keyboard: true,
      });
    };
  },
]);
