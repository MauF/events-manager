'use strict';

// Declare app level module which depends on views, and components
angular.module('app-controllers', [
    'app-factories',
    'ngMaterial',
    'ngMessages',
    // 'ui.bootstrap',
    'mdDateTime',
    'ngAutocomplete',
    'ngMap'
]).
controller('AppController', ['Auth', '$log', '$mdSidenav', '$mdBottomSheet', '$location', '$filter', '$mdDialog', '$sce', 'events-api', '$rootScope', function(Auth, $log, $mdSidenav, $mdBottomSheet, $location, $filter, $mdDialog, $sce, eventsApi, $rootScope) {
    var that = this;

    this.title = "Event Planner";

    this.auth = Auth;

    this.authData = undefined;

    this.userLoggedIn = {};

    $rootScope.$on('authenticationSucced', function(event, authData) {
        that.authData = authData;
        $log.info("logged in!!", angular.toJson(authData, true));
        if (authData.google) {
            that.userLoggedIn.name = authData.google.displayName;
            that.userLoggedIn.img = authData.google.cachedUserProfile.picture;
            that.userLoggedIn.url = authData.google.cachedUserProfile.link;
        } else if (authData.facebook) {
            that.userLoggedIn.name = authData.facebook.displayName;
            that.userLoggedIn.img = authData.facebook.cachedUserProfile.picture.data.url;
            that.userLoggedIn.url = authData.facebook.cachedUserProfile.link;
        }
        that.userLoggedIn.uid = authData.uid;
        eventsApi.setUserLoggedIn(that.userLoggedIn);
    });

    $rootScope.$on('authenticationFailed', function(event) {
        $log.info("authentication required!!");
        that.userLoggedIn.name = undefined;
        that.userLoggedIn.img = undefined;
        that.userLoggedIn.url = undefined;
        that.userLoggedIn.uid = undefined;
        $location.path("/login");
        eventsApi.setUserLoggedIn(that.userLoggedIn);
    });

    // this.auth.$onAuth(function(authData) {

    //     if (authData) {
    //         that.authData = authData;
    //         $log.info("logged in!!", angular.toJson(authData, true));
    //         if (authData.google) {
    //             that.userLoggedIn.name = authData.google.displayName;
    //             that.userLoggedIn.img = authData.google.cachedUserProfile.picture;
    //             that.userLoggedIn.url = authData.google.cachedUserProfile.link;
    //         } else if (authData.facebook) {
    //             that.userLoggedIn.name = authData.facebook.displayName;
    //             that.userLoggedIn.img = authData.facebook.cachedUserProfile.picture.data.url;
    //             that.userLoggedIn.url = authData.facebook.cachedUserProfile.link;
    //         }
    //         that.userLoggedIn.uid = authData.uid;
    //         $location.path($location.path());
    //         eventsApi.showToast("Welcome " + that.userLoggedIn.name + " !");
    //     } else {
    //         $log.info("authentication required!!");
    //         that.userLoggedIn.name = undefined;
    //         that.userLoggedIn.img = undefined;
    //         that.userLoggedIn.url = undefined;
    //         that.userLoggedIn.uid = undefined;
    //         $location.path("/login");
    //     }


    //     eventsApi.setUserLoggedIn(that.userLoggedIn);

    // });

    var dateFormat = "EEEE, MMMM d, y h:mm:ss a";

    this.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    };

    this.toggleMenu = function() {
        $mdSidenav('menu').toggle()
            .then(function() {
                $log.debug("toggle Menu is done");
            });
    };

    this.showGridBottomSheet = function($event) {
        $mdBottomSheet.show({
            templateUrl: 'partials/buttons-grid.html',
            controller: 'BottomSheetController',
            targetEvent: $event
        });
    };

    eventsApi.getAll().$watch(function(eventType) {
        $log.info(angular.toJson(eventType, true));
    });

    this.logout = function() {
        Auth.$unauth();
        this.goTo("login");
    };

    this.goTo = function(route) {
        if (route) {
            $location.path("/" + route);
        }
    };

    this.isLocation = function(path) {
        return '/' + path == $location.path();
    };

}]).
controller('BottomSheetController', ['Auth', '$scope', '$mdBottomSheet', '$log', '$location', function(Auth, $scope, $mdBottomSheet, $log, $location) {
    $scope.logout = function() {
        $mdBottomSheet.hide();
        Auth.$unauth();
        $scope.goTo("login");
    };

    $scope.goTo = function(route) {
        if (route) {
            $mdBottomSheet.hide();
            $location.path("/" + route);
        }
    };

    $scope.isLocation = function(path) {
        return '/' + path == $location.path();
    };
}]).
controller('EventController', ['Auth', '$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', 'events-api', '$routeParams', function(Auth, $log, $mdSidenav, $mdBottomSheet, $location, $mdDialog, eventsApi, $routeParams) {

    var that = this;

    this.params = $routeParams;

    this.title = 'Create a new Event';
    this.saveBtnLabel = 'save';
    this.resetBtnLabel = 'reset';

    if (this.params.id != 'new') {
        eventsApi.getAll().$loaded()
            .then(function(data) {
                var eventRetrived = eventsApi.getEvent(that.params.id);
                if (eventRetrived == null) {
                    $location.path("/event-list");
                } else {
                    that.data = eventRetrived;
                    that.title = 'Edit Event \'' + that.data.what + '\'';
                    that.saveBtnLabel = 'edit';
                    that.resetBtnLabel = 'delete';
                }
            })
            .catch(function(error) {
                $log.error("Error:", error);
            });
    } else {
        this.data = {};
        this.data.limitTo = 18;
        // $filter("date")(Date.now(), dateFormat);
        this.data.when = new Date().getTime();
    }

    this.openDataTimePicker = function(ev) {
        $mdDialog.show({
            controller: ['$scope', function($scope) {
                $scope.save = function(value) {
                    $mdDialog.hide(value);
                };

                $scope.cancel = function(value) {
                    $mdDialog.hide(value);
                };
            }],
            template: '<md-dialog aria-label=""><time-date-picker data-ng-model="app.event.when" on-save="save($value)" on-cancel="cancel($value)" data-display-mode="full"></time-date-picker></md-dialog>',
            targetEvent: ev,
        }).then(function(answer) {
            if (answer) {
                that.data.when = new Date(answer).getTime();
            }
        }, function() {
            $log.info("You cancelled the dialog.");
        });
    };

    this.createOrUpdateEvent = function(dataEvent) {
        var savedEvent = undefined;
        var msg = undefined;
        var goOn = true;
        if (this.saveBtnLabel == 'save') {
            savedEvent = eventsApi.addEvent(dataEvent);
            msg = 'saved';
        } else {
            savedEvent = eventsApi.saveEvent(dataEvent);
            msg = 'edited';
        }
        if (goOn) {
            $log.info("Event " + msg + "!", angular.toJson(dataEvent, true));
            eventsApi.showToast("Event '" + dataEvent.what + "' " + msg + " !");
            $location.path("/event-list");
        }
    };

    this.resetOrDeleteEvent = function(event, ev) {
        if (this.resetBtnLabel == 'delete') {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete the event \'' + event.what + '\'?')
                .ok('Please do it!')
                .cancel('No thanks!')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                eventsApi.deleteEvent(event);
                $location.path("/event-list");
            }, function() {
                $log.info("deleteEvent cancel!");
            });
        } else {
            this.data = {};
            this.data.limitTo = 18;
            // $filter("date")(Date.now(), dateFormat);
            this.data.when = new Date().getTime();
            eventsApi.showToast("Event reseted!");
        }
    };

    function deleteEvent(event, ev) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete the event \'' + event.what + '\'?')
            .ok('Please do it!')
            .cancel('No thanks!')
            .targetEvent(ev);
        $mdDialog.show(confirm).then(function() {
            eventsApi.deleteEvent(event.$id);
            eventsApi.showToast("Event '" + event.what + "' deleted!");
        }, function() {
            $log.info("deleteEvent cancel!");
        });
    };



}]).
controller('EventListController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', 'events-api', '$filter', function($log, $mdSidenav, $mdBottomSheet, $location, $mdDialog, eventsApi, $filter) {
    var that = this;

    that.showEvents = false;
    this.events = eventsApi.getAll();


    this.events.$loaded()
        .then(function(data) {
            that.showEvents = true;
            $log.info("events loaded!");
        })
        .catch(function(error) {
            $log.error("Error:", error);
        });

}]).
controller('EventDetailsController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', 'events-api', '$filter', '$routeParams', function($log, $mdSidenav, $mdBottomSheet, $location, $mdDialog, eventsApi, $filter, $routeParams) {
    var that = this;

    this.params = $routeParams;

    this.saveBtnLabel = 'save';
    this.resetBtnLabel = 'reset';

    if (this.params.id) {
        eventsApi.getAll().$loaded()
            .then(function(data) {
                var eventRetrived = eventsApi.getEvent(that.params.id);
                that.event = eventRetrived;
                that.title = eventRetrived.what;
            })
            .catch(function(error) {
                $log.error("Error:", error);
            });
    }
}]).
controller('MapController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', '$routeParams', function($log, $mdSidenav, $mdBottomSheet, $location, $mdDialog, $routeParams) {
    this.params = $routeParams;
}]).
controller('LoginController', ['login-util', '$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', 'Auth', function(loginUtil, $log, $mdSidenav, $mdBottomSheet, $location, $mdDialog, Auth) {

    this.auth = function(authProvider) {
        Auth.$authWithOAuthPopup(authProvider).then(function(authData) {
            if (loginUtil.getRedirect()) {
                $location.path(loginUtil.getRedirect());
            } else {
                $location.path('/event-list');
            }
        }).catch(function(error) {
            $log.error("Authentication failed:", error);
        });
    };


}]);
