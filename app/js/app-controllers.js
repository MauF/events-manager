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
controller('AppController', ['Auth','$log', '$mdSidenav', '$mdBottomSheet', '$location', '$filter', '$mdDialog', '$sce', 'events-api', function(Auth, $log, $mdSidenav, $mdBottomSheet, $location, $filter, $mdDialog, $sce, eventsApi) {
    var that = this;

    this.title = "Event Planner";

    this.auth = Auth;

    this.authData = undefined;

    this.userLoggedIn = {};

    this.auth.$onAuth(function(authData) {
        if(authData) {
            that.authData = authData;
            $log.info("logged in!!", angular.toJson(authData, true));
            $location.path("/event-list");
            if(authData.google) {
                that.userLoggedIn.name = authData.google.displayName;
                that.userLoggedIn.img = $sce.trustAsResourceUrl(authData.google.cachedUserProfile.picture);
                that.userLoggedIn.url = authData.google.cachedUserProfile.link;
            } else if(authData.facebook) {
                that.userLoggedIn.name = authData.facebook.displayName;
                that.userLoggedIn.img = $sce.trustAsResourceUrl(authData.facebook.cachedUserProfile.picture.data.url);
                that.userLoggedIn.url = authData.facebook.cachedUserProfile.link;
            }
            that.userLoggedIn.uid = authData.uid;
        } else {
            $location.path("/login");
            $log.info("authentication required!!");
            that.userLoggedIn.name = undefined;
            that.userLoggedIn.img = undefined;
            that.userLoggedIn.url = undefined;
            that.userLoggedIn.uid = undefined;
        }

        eventsApi.setUserLoggedIn(that.userLoggedIn);

    });

    var dateFormat = "EEEE, MMMM d, y h:mm:ss a";

    this.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    };

    this.toggleMenu = function() {
    $mdSidenav('menu').toggle()
        .then(function(){
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

}]).
controller('BottomSheetController', ['Auth', '$scope', '$mdBottomSheet', '$log', '$location', function(Auth,$scope, $mdBottomSheet, $log, $location) {
    $scope.logout = function() {
        $mdBottomSheet.hide();
        Auth.$unauth();
        $scope.goTo("login");
    };

    $scope.goTo = function(route) {
        if(route) {
            $mdBottomSheet.hide();
            $location.path("/"+route);
        }
    };

    $scope.isLocation = function(path) {
        return '/' + path == $location.path();
    };
}]).
controller('EventController', ['Auth', '$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', 'events-api', function(Auth, $log, $mdSidenav, $mdBottomSheet, $location, $mdDialog, eventsApi) {
    
    var that = this;

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

    this.createEvent = function(dataEvent) {
        eventsApi.addEvent(dataEvent);
        $log.info("Event created!", angular.toJson(dataEvent, true));
        $location.path("/event-list");
    };

    this.resetEvent = function() {
        this.data = {};
        this.data.limitTo = 18;
        // $filter("date")(Date.now(), dateFormat);
        this.data.when = new Date().getTime();
    };

    this.resetEvent();
}]).
controller('EventListController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', 'events-api', function($log, $mdSidenav, $mdBottomSheet, $location, $mdDialog, eventsApi) {
    var that = this;


    this.events = eventsApi.getAll();

    this.openMap = function(whereDetails) {
        $location.path('/map/'+whereDetails.geometry.location.k+'/'+whereDetails.geometry.location.D+'/'+whereDetails.formatted_address);
    };

    this.isEditBtnVisible = function(event) {
        return event.organizer.uid == eventsApi.getUserLoggedIn().uid;
    };

    this.isJoinBtnVisible = function(event) {
        return !that.isLeftBtnVisible(event);
    };

    this.isLeftBtnVisible = function(event) {
        var userLoggedIn = eventsApi.getUserLoggedIn();
        if(!event.attendees) {
            return false;
        }
        return event.attendees[userLoggedIn.uid];
    };

    this.isLeftWaitingListBtnVisible = function(event) {
        return event.organizer.uid == eventsApi.getUserLoggedIn().uid;
    };

    this.isAttendeesBtnVisible = function(event) {
        return mapLength(event.attendees) > 0;
    };

    var mapLength = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    this.isTheAttendeesListFull = function(event) {
        if(!event.attendees) {
            return false;
        } else {
            var placeLeft = event.limitTo - mapLength(event.attendees);
            return placeLeft == 0;
        }
    };

    this.calculatePlaceLeft = function(event) {
        return event.limitTo - mapLength(event.attendees);
    };

    this.showAttendees = function(event, ev) {
        $mdDialog.show({
            controller: ['$scope', '$mdDialog', 'attendees', function($scope, $mdDialog, attendees) {
                $scope.ok = function() {
                    $mdDialog.hide();
                };
                $scope.attendees = [];
                for (var attendee in attendees) {
                    $scope.attendees.push(attendees[attendee]);
                }
            }],
            templateUrl: 'partials/show-attendees.html',
            targetEvent: ev,
            resolve: {attendees: function() {
                         return event.attendees;
                    }
            }
        }).then(function() {
            $log.info("showAttendees closed!");
        }, function() {
            $log.info("You cancelled the dialog.");
        });
    };

    this.partecipate = function(event, isWaitingList) {
        eventsApi.partecipate(event, isWaitingList);
    };

    this.left = function(event, isWaitingList) {
        eventsApi.left(event, isWaitingList);
    };

}]).
controller('MapController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', '$routeParams', function($log, $mdSidenav, $mdBottomSheet, $location, $mdDialog, $routeParams) {
    this.params = $routeParams;
}]).
controller('LoginController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', function($log, $mdSidenav, $mdBottomSheet, $location, $mdDialog) {

}]);
