'use strict';

// Declare app level module which depends on views, and components
angular.module('app-factories', ['firebase']).
constant('firebase-url', 'https://event-manager.firebaseio.com/').
factory('Auth', ['$firebaseAuth', 'firebase-url', function($firebaseAuth, firebaseUrl) {
    var ref = new Firebase(firebaseUrl);
    return $firebaseAuth(ref);
  }
]).
factory('events-api', ['$firebaseArray', 'firebase-url', '$log', '$rootScope', function($firebaseArray, firebaseUrl, $log, $rootScope) {
    var ref = new Firebase(firebaseUrl+"events");

    var userLoggedIn = undefined;

    var events = $firebaseArray(ref);

    events.$loaded()
    .then(function(data) {
        $log.info("data loaded!");
    })
    .catch(function(error) {
        $log.error("Error:", error);
    });

    // var events = [];

    function getAll () {
    	return events;
    };

    function addEvent (event) {
    	event['organizer'] = {name: userLoggedIn.name, img: userLoggedIn.img, url: userLoggedIn.url, uid:userLoggedIn.uid};
    	events.$add(event).
            then(function(ref) {
              var id = ref.key();
              $log.info("added record with id " + id);
            }).catch(function(error) {
                $log.error("addEvent - Error:", error);
            });
    };

    function setUserLoggedIn (user) {
    	userLoggedIn = user;
    };

    function getUserLoggedIn () {
    	return userLoggedIn;
    };

    function partecipate(event, isWaitingList) {
    	var queue = 'attendees';
    	if(isWaitingList) {
			queue = 'waitingList';
    	}


    	if(!event[queue]) {
    		event[queue] = {};
    	}

    	var attendee = {name: userLoggedIn.name, img: userLoggedIn.img, url: userLoggedIn.url.toString(), uid:userLoggedIn.uid};
    	event[queue][attendee.uid] = attendee;
        saveEvent(event);
    }

    function left(event) {
    	if(event['attendees'][userLoggedIn.uid]) {
    		delete event['attendees'][userLoggedIn.uid];
    	} else if(event['waitingList'][userLoggedIn.uid]) {
    		delete event['waitingList'][userLoggedIn.uid];
    	}
        saveEvent(event);
    }

    function saveEvent(event) {
        events.$save(event).
            then(function(ref) {
              $log.info("saved record - id:" , ref.$id);
              return ref;
            }).catch(function(error) {
                $log.error("saveEvent - Error:", error);
            });
    };

    function getEvent(idEvent) {
        var event = events.$getRecord(idEvent);
        $log.info("event retrived: " + event);
        return event;
    };

    function deleteEvent(event) {
        var event = events.$remove(event)
        .then(function(ref) {
            $log.info("event deleted: " + ref);
            return ref;
        }).catch(function(error) {
            $log.error("deleteEvent - Error:", error);
        });
    };

    return {
    	getAll : getAll,
        getEvent: getEvent,
    	addEvent : addEvent,
    	setUserLoggedIn: setUserLoggedIn,
    	getUserLoggedIn: getUserLoggedIn,
    	partecipate: partecipate,
    	left: left,
        deleteEvent: deleteEvent,
        saveEvent:saveEvent

    };

  }
]);