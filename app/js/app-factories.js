'use strict';

// Declare app level module which depends on views, and components
angular.module('app-factories', ['firebase','ngMaterial']).
constant('firebase-url', 'https://event-manager.firebaseio.com/').
factory('Auth', ['$firebaseAuth', 'firebase-url', function($firebaseAuth, firebaseUrl) {
    var ref = new Firebase(firebaseUrl);
    return $firebaseAuth(ref);
  }
]).
factory('events-api', ['$firebaseArray', 'firebase-url', '$log', '$rootScope', '$mdToast', function($firebaseArray, firebaseUrl, $log, $rootScope, $mdToast) {
    var ref = new Firebase(firebaseUrl+'events');

    var userLoggedIn = undefined;

    var events = $firebaseArray(ref);

    // var events = [];

    function showToast(msg) {
        $mdToast.show(
            $mdToast.simple()
                .content(msg)
                .hideDelay(2000)
        );
    }
    

    function getAll () {
    	return events;
    };

    function addEvent (event) {
    	event['organizer'] = {name: userLoggedIn.name, img: userLoggedIn.img, url: userLoggedIn.url, uid:userLoggedIn.uid};
    	events.$add(event).
            then(function(ref) {
              var id = ref.key();
              $log.info("added record with id " + id);
              return ref;
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

    	var attendee = {name: userLoggedIn.name, img: userLoggedIn.img, url: userLoggedIn.url.toString(), uid:userLoggedIn.uid, timeStamp: new Date().getTime()};
    	event[queue][attendee.uid] = attendee;

        saveEvent(event);
    }

    function getFirstElement(obj) {
        var elem = undefined;
        for (var key in obj) {
            if(!elem) {
                elem = obj[key];
            } else if(elem.timeStamp > obj[key].timeStamp){
                elem = obj[key];
            }
        }
        return elem;
    }

    function left(event) {
    	if(event['attendees'][userLoggedIn.uid]) {
            // if the list is full and someone left, the first in the waitingList will join the attendees
            if(mapLength(event['attendees']) == event.limitTo && event['waitingList'] && mapLength(event['attendees']) >= 1 ) {
                var attendee = getFirstElement(event['waitingList']);
                event['attendees'][attendee.uid] = attendee;
                delete event['waitingList'][attendee.uid];
            }
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

    function mapLength(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
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
        saveEvent:saveEvent,
        showToast:showToast,
        mapLength: mapLength
    };

  }
]);