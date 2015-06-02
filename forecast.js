'use strict';

/**
 * @ngdoc service
 * @name divonaForecast.forecast
 * @description
 * # tempo
 * Factory in the divonaForecast.
 */
angular
  .module('divonaNgEdf')
  .factory('divonaNgEdf.Forecast', ['$http', '$q', 'FORECAST_API_URL', 'divonaNgEdf.Tempo', 'divonaNgEdf.Ejp',
    function ($http, $q, API_URL, Tempo, Ejp) {

      var formatTempo = function (data) {
        return {
          raw: data.color,
          format: Tempo.formatColor(data.color)
        };
      };

      var formatEjpZone = function (data) {
        return {
          raw: data,
          format: Ejp.format(data)
        }
      };

      var formatEjp = function (data) {
        return {
          'north': formatEjpZone(data.zones.north),
          'paca': formatEjpZone(data.zones.paca),
          'west': formatEjpZone(data.zones.west),
          'south': formatEjpZone(data.zones.south)
        };
      };

      return {
        'fetch': function () {
          return $http.get(API_URL + '?' + moment().unix())
            .then(function (response) {
              var data = response.data;

              return {
                'today': {
                  'tempo': (data.today && data.today.tempo) ? formatTempo(data.today.tempo) : null,
                  'ejp': (data.today && data.today.ejp) ? formatEjp(data.today.ejp) : null
                },
                'tomorrow': {
                  'tempo': (data.tomorrow && data.tomorrow.tempo) ? formatTempo(data.tomorrow.tempo) : null,
                  'ejp': (data.tomorrow && data.tomorrow.ejp) ? formatEjp(data.tomorrow.ejp) : null
                }
              };
            });
        }
      };
    }
  ]);
