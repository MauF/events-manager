'use strict';

angular.module('app-directives', [
    'app-factories',
    'ngMaterial',
    'mdDateTime',
    'ngAutocomplete',
]).
directive('event', [function() {
    return {
        restrict: 'E',
        scope: {
            eventObj: '=',
            showBtns: '='
        },
        controllerAs: 'eventCtrl',
        templateUrl: 'partials/event-tpl.html',
        controller: ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', 'events-api', '$filter', function($log, $mdSidenav, $mdBottomSheet, $location, $mdDialog, eventsApi, $filter) {
            var that = this;

            this.isEditBtnVisible = function(event) {
                if (!event) {
                    return false;
                }
                return event.organizer.uid == eventsApi.getUserLoggedIn().uid;
            };

            this.isJoinBtnVisible = function(event) {
                return !that.isLeftBtnVisible(event);
            };

            this.isLeftBtnVisible = function(event) {
                var userLoggedIn = eventsApi.getUserLoggedIn();
                if (!event) {
                    return false;
                }
                return (event.attendees && event.attendees[userLoggedIn.uid]) || (event.waitingList && event.waitingList[userLoggedIn.uid]);
            };

            this.isLeftWaitingListBtnVisible = function(event) {
                return event.organizer.uid == eventsApi.getUserLoggedIn().uid;
            };

            this.isAttendeesBtnVisible = function(event) {
                if (!event) {
                    return false;
                }
                return this.mapLength(event.attendees) > 0;
            };

            this.isTheUserInTheWaitingList = function(event) {
                var userLoggedIn = eventsApi.getUserLoggedIn();
                if (!event) {
                    return false;
                }
                if (!event.waitingList) {
                    return false;
                }
                return event.waitingList[userLoggedIn.uid];
            };

            this.writeStatus = function(event) {
                var userLoggedIn = eventsApi.getUserLoggedIn();
                if (!event) {
                    return false;
                }
                if (event.attendees && event.attendees[userLoggedIn.uid]) {
                    return "You are in the attendees list!";
                }
                if (event.waitingList && event.waitingList[userLoggedIn.uid]) {
                    return "You are in the waiting list!";
                }
                return "";
            };


            this.mapLength = function(obj) {
                return eventsApi.mapLength(obj);
            };

            this.isTheAttendeesListFull = function(event) {
                if (!event) {
                    return false;
                }
                if (!event.attendees) {
                    return false;
                } else {
                    var placeLeft = event.limitTo - this.mapLength(event.attendees);
                    return placeLeft == 0;
                }
            };

            this.calculatePlaceLeft = function(event) {
                if (!event) {
                    return;
                }
                return event.limitTo - this.mapLength(event.attendees);
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
                        attendees: function() {
                            return event.attendees;
                        },
                        waitingList: function() {
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
                if (isWaitingList) {
                    eventsApi.showToast("You are in the waiting-list of the '" + event.what + "' event!");
                } else {
                    eventsApi.showToast("You will partecipate at the '" + event.what + "' event!");
                }
            };

            this.left = function(event, isWaitingList) {
                eventsApi.left(event, isWaitingList);
                if (isWaitingList) {
                    eventsApi.showToast("You left the waiting-list of the '" + event.what + "' event!");
                } else {
                    eventsApi.showToast("You won't partecipate at the '" + event.what + "' event!");
                }
            };

            this.edit = function(event) {
                $location.path("/event/" + event.$id);
            };

            this.getVisibleEvents = function(events) {
                var filteredEvents = $filter('removeOldEvent')(events);
                return this.mapLength(filteredEvents);
            };
        }]
    };
}]);
