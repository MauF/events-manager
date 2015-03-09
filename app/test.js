var app = angular.module("sampleApp",["firebase"]);

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

// let's create a re-usable factory that generates the $firebaseAuth instance
app.factory("Auth", ["$firebaseAuth", function($firebaseAuth) {
  var ref = new Firebase("https://event-manager.firebaseio.com/");
  return $firebaseAuth(ref);
}]);

// and use it in our controller
app.controller("SampleCtrl", ["$scope", "Auth", "$http", function($scope, Auth, $http) {
  // any time auth status updates, add the user data to scope
  
  $scope.auth=Auth;

  Auth.$onAuth(function(authData) {
     $scope.authData = authData;
  });


  $scope.sendEmail = function() {
    $http({
        method: 'POST',
        url: "https://api.mailgun.net/v2/sandbox2c277c6207da4f0487c8ca09f6fc3c06.mailgun.org/messages",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },
        data: {
          from:'Mailgun Sandbox <postmaster@sandbox2c277c6207da4f0487c8ca09f6fc3c06.mailgun.org>'
          ,to:'event-manager <maurizio.fassone@gmail.com>'
          ,subject:'Hello event-manager'
          ,text:'Congratulations event-manager, you just sent an email with Mailgun!  You are truly awesome! \nYou can see a record of this email in your logs: https://mailgun.com/cp/log \nYou can send up to 300 emails/day from this sandbox server. Next, you should add your own domain so you can send 10,000 emails/month for free.'
        }
      })
      .success(function(data, status, headers, config) {
        alert(angular.toJson(data, true));
      }).
      error(function(data, status, headers, config) {
        alert("Error!!\n" + angular.toJson(data, true));
      });
  };

}]);