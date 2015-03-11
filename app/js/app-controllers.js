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
            if(authData.google) {
                that.userLoggedIn.name = authData.google.displayName;
                that.userLoggedIn.img = authData.google.cachedUserProfile.picture;
                that.userLoggedIn.url = authData.google.cachedUserProfile.link;
            } else if(authData.facebook) {
                that.userLoggedIn.name = authData.facebook.displayName;
                that.userLoggedIn.img = authData.facebook.cachedUserProfile.picture.data.url;
                that.userLoggedIn.url = authData.facebook.cachedUserProfile.link;
            }
            that.userLoggedIn.uid = authData.uid;
            $location.path("/event-list");
            eventsApi.showToast("Welcome " + that.userLoggedIn.name +" !");
        } else {
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

    eventsApi.getAll().$watch(function(eventType) {
        $log.info(angular.toJson(eventType, true));
    });

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
controller('EventController', ['Auth', '$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', 'events-api', '$routeParams', function(Auth, $log, $mdSidenav, $mdBottomSheet, $location, $mdDialog, eventsApi, $routeParams) {
    
    var that = this;

    this.params = $routeParams;

    this.title = 'Create a new Event';
    this.saveBtnLabel = 'save';
    this.resetBtnLabel = 'reset';

    if(this.params.id != 'new') {
        var eventRetrived = eventsApi.getEvent(this.params.id);
        if(eventRetrived == null) {
            $location.path("/event-list");
        } else {
            this.data = eventRetrived;
            this.title = 'Edit Event \'' + this.data.what+'\'';
            this.saveBtnLabel = 'edit';
            this.resetBtnLabel = 'delete';
        }
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
        if(this.saveBtnLabel == 'save') {
            savedEvent = eventsApi.addEvent(dataEvent);
            msg='saved';
        } else {
            savedEvent = eventsApi.saveEvent(dataEvent);
            msg='edited';
        }
        $log.info("Event "+msg+"!", angular.toJson(dataEvent, true));
        eventsApi.showToast("Event '"+dataEvent.what+"' " + msg +" !");
        $location.path("/event-list");
    };

    this.resetOrDeleteEvent = function(event, ev) {
        if(this.resetBtnLabel == 'delete') {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete the event \''+event.what+'\'?')
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
            .title('Are you sure you want to delete the event \''+event.what+'\'?')
            .ok('Please do it!')
            .cancel('No thanks!')
            .targetEvent(ev);
        $mdDialog.show(confirm).then(function() {
              eventsApi.deleteEvent(event.$id);
              eventsApi.showToast("Event '"+event.what+"' deleted!");
        }, function() {
              $log.info("deleteEvent cancel!");
        });
    };

    

}]).
controller('EventListController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', 'events-api', function($log, $mdSidenav, $mdBottomSheet, $location, $mdDialog, eventsApi) {
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
        return (event.attendees && event.attendees[userLoggedIn.uid]) || (event.waitingList && event.waitingList[userLoggedIn.uid]);
    };

    this.isLeftWaitingListBtnVisible = function(event) {
        return event.organizer.uid == eventsApi.getUserLoggedIn().uid;
    };

    this.isAttendeesBtnVisible = function(event) {
        return mapLength(event.attendees) > 0;
    };

    this.isTheUserInTheWaitingList = function(event) {
        var userLoggedIn = eventsApi.getUserLoggedIn();
        if(!event.waitingList) {
            return false;
        }
        return event.waitingList[userLoggedIn.uid];
    };

    this.writeStatus = function(event) {
        var userLoggedIn = eventsApi.getUserLoggedIn();
        if(event.attendees && event.attendees[userLoggedIn.uid]) {
            return "You are in the attendees list!";
        }
        if(event.waitingList && event.waitingList[userLoggedIn.uid]) {
            return "You are in the waiting list!";
        }
        return "";
    };


    var mapLength = function(obj) {
        return eventsApi.mapLength(obj);
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
            controller: ['$scope', '$mdDialog', 'attendees', 'waitingList', function($scope, $mdDialog, attendees, waitingList) {
                $scope.ok = function() {
                    $mdDialog.hide();
                };
                $scope.attendees = [];
                for (var attendee in attendees) {
                    $scope.attendees.push(attendees[attendee]);
                }
                $scope.waitingList = [];
                for (var attendee in waitingList) {
                    $scope.waitingList.push(waitingList[attendee]);
                }
            }],
            templateUrl: 'partials/show-attendees.html',
            targetEvent: ev,
            resolve: {
                attendees: function(){
                    return event.attendees;
                },
                waitingList: function(){
                    return event.waitingList;
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
        if(isWaitingList) {
            eventsApi.showToast("You are in the waiting-list of the '"+event.what+"' event!");
        } else {
            eventsApi.showToast("You will partecipate at the '"+event.what+"' event!");
        }
    };

    this.left = function(event, isWaitingList) {
        eventsApi.left(event, isWaitingList);
        if(isWaitingList) {
            eventsApi.showToast("You left the waiting-list of the '"+event.what+"' event!");
        } else {
            eventsApi.showToast("You won't partecipate at the '"+event.what+"' event!");
        }
    };

    this.edit = function(event) {
        $location.path("/event/"+event.$id);
    };

}]).
controller('MapController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', '$routeParams', function($log, $mdSidenav, $mdBottomSheet, $location, $mdDialog, $routeParams) {
    this.params = $routeParams;
}]).
controller('LoginController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', function($log, $mdSidenav, $mdBottomSheet, $location, $mdDialog) {

}]);
