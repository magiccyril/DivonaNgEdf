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
  .factory('divonaNgEdf.Forecast', ['$http', '$q', 'FORECAST_API_URL',
    function ($http, $q, API_URL) {
      var formatTempoData = function (data) {
        switch (data) {
          case 'blue':
            return 'Bleu';

          case 'white':
            return 'Blanc';

          case 'red':
            return 'Rouge';
        }
      };

      var fetch = function () {
        return $http.get(API_URL)
          .then(function (response) {
            var data = response.data;

            var formatedData = {
              'today': {
                'tempo': null,
                'ejp': {
                  'north': null,
                  'paca': null,
                  'west': null,
                  'south': null
                }
              },
              'tomorrow': {
                'tempo': null,
                'ejp': {
                  'north': null,
                  'paca': null,
                  'west': null,
                  'south': null
                }
              }
            };

            if (data.today && data.today.tempo) {
              formatedData.today.tempo = {
                raw: data.today.tempo.color,
                format: formatTempoData(data.today.tempo.color)
              };
            }

            if (data.today && data.today.ejp) {
              formatedData.today.ejp.north = {
                raw: data.today.ejp.zones.north,
                format: data.today.ejp.zones.north ? 'EJP' : 'non EJP'
              };

              formatedData.today.ejp.paca = {
                raw: data.today.ejp.zones.paca,
                format: data.today.ejp.zones.paca ? 'EJP' : 'non EJP'
              };

              formatedData.today.ejp.west = {
                raw: data.today.ejp.zones.west,
                format: data.today.ejp.zones.west ? 'EJP' : 'non EJP'
              };

              formatedData.today.ejp.south = {
                raw: data.today.ejp.zones.south,
                format: data.today.ejp.zones.south ? 'EJP' : 'non EJP'
              };
            }

            if (data.tomorrow && data.tomorrow.tempo) {
              formatedData.tomorrow.tempo = {
                raw: data.tomorrow.tempo.color,
                format: formatTempoData(data.tomorrow.tempo.color)
              };
            }

            if (data.tomorrow && data.tomorrow.ejp) {
              formatedData.tomorrow.ejp.north = {
                raw: data.tomorrow.ejp.zones.north,
                format: data.tomorrow.ejp.zones.north ? 'EJP' : 'non EJP'
              };

              formatedData.tomorrow.ejp.paca = {
                raw: data.tomorrow.ejp.zones.paca,
                format: data.tomorrow.ejp.zones.paca ? 'EJP' : 'non EJP'
              };

              formatedData.tomorrow.ejp.west = {
                raw: data.tomorrow.ejp.zones.west,
                format: data.tomorrow.ejp.zones.west ? 'EJP' : 'non EJP'
              };

              formatedData.tomorrow.ejp.south = {
                raw: data.tomorrow.ejp.zones.south,
                format: data.tomorrow.ejp.zones.south ? 'EJP' : 'non EJP'
              };
            }

            return formatedData;
          });
      };

      return {
        'fetch': fetch
      };
    }
  ]);
