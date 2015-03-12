'use strict';

angular.module('app-filters', []).
filter('removeOldEvent', [function() {
    return function(events) {
        var now = new Date().getTime();
        var result = {};
        angular.forEach(events, function(value, key) {
            if (typeof value !== 'function' && value.when && value.when > now) {
                result[value.$id] = value;
            }
        });
        return result;
        // var now = new Date().getTime();
        // for (var i in  events) {
        //     var event = events[i];
        //     if(event.where && event.where > now) {
        //         filtered.push(event);
        //     }
        // }
        // return filtered;
    }
}]);
