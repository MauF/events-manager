'use strict';

// Declare app level module which depends on views, and components
angular.module('app-controllers', [
    'ngMaterial',
    'ngMessages',
    'ui.bootstrap',
    'mdDateTime',
    'ngAutocomplete',
    'ngMap'
]).
controller('AppController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$filter', '$mdDialog', function($log, $mdSidenav, $mdBottomSheet, $location, $filter, $mdDialog) {
    var that = this;

    var dateFormat = "EEEE, MMMM d, y h:mm:ss a"

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
            template: '<md-dialog aria-label="Mango (Fruit)"><time-date-picker data-ng-model="app.event.when" on-save="save($value)" on-cancel="cancel($value)" data-display-mode="full"></time-date-picker></md-dialog>',
            targetEvent: ev,
        }).then(function(answer) {
            if (answer) {
                that.event.when = new Date(answer).getTime();
            }
        }, function() {
            $log.info("You cancelled the dialog.");
        });
    };

    this.createEvent = function() {
        $log.info("Event created!", angular.toJson(that.event, true));
    };

    this.resetEvent = function() {
        this.event = {};
        this.event.limitTo = 18;
        // $filter("date")(Date.now(), dateFormat);
        this.event.when = new Date().getTime();
    };

    this.resetEvent();

}]).
controller('EventController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', function($log, $mdSidenav, $mdBottomSheet, $location, $mdDialog) {

}]).
controller('EventListController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', '$mdDialog', function($log, $mdSidenav, $mdBottomSheet, $location, $mdDialog) {
    this.events = [];

    for (var i = 1; i <= 10; i++) {
        this.events.push({
            "what": "event - " + i,
            "where": "somewhere" + i,
            "when": 1288323623006,
            "description": "This paragraph contains a very long word: thisisaveryveryveryveryveryverylongword. The long word will break and wrap to the next line." + i,
            "limitTo": 18,
            "attendees": [{"name": "tizio"}, {"name": "caio"}, {"name": "sempronio"}]
        });
    }

}]);
