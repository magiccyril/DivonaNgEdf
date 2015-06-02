'use strict';

/**
 * @ngdoc service
 * @name divonaEjp.tempo
 * @description
 * # tempo
 * Factory in the divonaEjp.
 */
angular
  .module('divonaNgEdf')
  .factory('divonaNgEdf.Ejp', [
    '$http',
    '$q',
    'EJP_API_URL',
    'EJP_API_FROM_MONTH',
    'EJP_API_FROM_DAY',
    'EJP_API_COUNT',
    function ($http, $q, API_URL, FROM_MONTH, FROM_DAY, COUNT) {
      var cacheByZone = {};
      var cacheByDate = {};

      var getStartDate = function () {
        var date = moment();
        date.month(FROM_MONTH - 1);
        date.date(FROM_DAY);
        date.subtract(1, 'year');

        if (moment().month() + 1 >= FROM_MONTH) {
          date.add(1, 'year');
        }

        return date;
      };

      var getCounter = function () {
        var fromDate = getStartDate();

        return $http.get(API_URL + 'count/' + fromDate.format('YYYY-MM-DD') + '?' + moment().unix())
          .then(function (response) {
            return {
              'north': COUNT - response.data.north,
              'paca': COUNT - response.data.paca,
              'west': COUNT - response.data.west,
              'south': COUNT - response.data.south
            };
          });
      };

      var formatEjp = function (data) {
        return data ? 'EJP' : 'Non EJP';
      };

      var formatDataByZone = function (response) {
        var data = response.data;

        var formatedData = {};
        for (var i = 0; i < data.length; i++) {
          var day = data[i];
          var dayDate = moment(day.date.year + '-' + day.date.month + '-' + day.date.day, 'YYYY-M-D');

          for (var zone in day.zones) {
            if (!formatedData[zone]) {
              formatedData[zone] = {};
            }

            formatedData[zone][dayDate.format('YYYY-MM-DD')] = {
              'raw': day.zones[zone],
              'formated': formatEjp(day.zones[zone])
            };
          }
        }

        return formatedData;
      };

      var formatDataByDate = function (response) {
        var data = response.data;

        var formatedData = {};
        for (var i = 0; i < data.length; i++) {
          var day = data[i];
          var dayDate = moment(day.date.year + '-' + day.date.month + '-' + day.date.day, 'YYYY-M-D');

          var dateFormat = dayDate.format('YYYY-MM-DD');

          if (!formatedData[dateFormat]) {
            formatedData[dateFormat] = {};
          }

          for (var zone in day.zones) {
            if (!formatedData[dateFormat][zone]) {
              formatedData[dateFormat][zone] = {};
            }

            formatedData[dateFormat][zone] = {
              'raw': day.zones[zone],
              'formated': formatEjp(day.zones[zone])
            };
          }
        }

        return formatedData;
      };

      var fetchByZone = function (zone, date, noCache) {
        if (angular.isUndefined(noCache)) {
          noCache = false;
        }

        if (cacheByZone[date] && cacheByZone[date][zone] && !noCache) {
          var deferred = $q.defer();
          deferred.resolve(cacheByZone[date][zone]);
          return deferred.promise;
        }
        else {
          return $http.get(API_URL + date + '?' + moment().unix())
            .then(function (response) {
              cacheByZone[date] = formatDataByZone(response);

              return cacheByZone[date][zone];
            });
        }
      };

      var fetchByDate = function (date, noCache) {
        if (angular.isUndefined(noCache)) {
          noCache = false;
        }

        if (cacheByDate[date] && !noCache) {
          var deferred = $q.defer();
          deferred.resolve(cacheByDate[date]);
          return deferred.promise;
        }
        else {
          return $http.get(API_URL + date + '?' + moment().unix())
            .then(function (response) {
              cacheByDate[date] = formatDataByDate(response);

              return cacheByDate[date];
            });
        }
      };

      var save = function (apikey, date, zones) {
        if (!moment.isMoment(date)) {
          date = moment(date);
        }

        if (!date.isValid()) {
          return $q.reject('Invalid date');
        }

        var zonesValid = 'object' === typeof zones && 'boolean' === typeof zones.north && 'boolean' === typeof zones.paca && 'boolean' === typeof zones.west && 'boolean' === typeof zones.south;

        if (!zonesValid) {
          return $q.reject('Invalid zones');
        }

        var data = {
          'year': date.format('YYYY'),
          'month': date.format('M'),
          'day': date.format('D'),
          'zones': zones
        };

        return $http.post(API_URL + '?apikey=' + apikey, data);
      };

      var remove = function (apikey, date) {
        if (!moment.isMoment(date)) {
          date = moment(date);
        }

        if (!date.isValid()) {
          return $q.reject('Invalid date');
        }

        return $http.delete(API_URL + date.format('YYYY-MM-DD') + '?apikey=' + apikey);
      };

      return {
        'format': formatEjp,
        'getStartDate': getStartDate,
        'getCounter': getCounter,
        'getMonthByZone': function (zone, date, noCache) {
          return fetchByZone(zone, date.format('YYYY-MM'), noCache);
        },
        'getYearByZone': function (zone, date, noCache) {
          return fetchByZone(zone, date.format('YYYY'), noCache);
        },
        'getMonthByDate': function (date, noCache) {
          return fetchByDate(date.format('YYYY-MM'), noCache);
        },
        'getYearByDate': function (date, noCache) {
          return fetchByDate(date.format('YYYY'), noCache);
        },
        'save': save,
        'delete': remove
      };
    }
  ]);
