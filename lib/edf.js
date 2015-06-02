'use strict';

/**
 * @ngdoc Module
 * @name divonaEdf
 * @description
 * # tempo
 * Factory in the divonaEjp.
 */
angular
  .module('divonaNgEdf', [])
  .constant('EJP_API_URL', 'http://api.tempo.18ruedivona.eu/ejp/')
  .constant('FORECAST_API_URL', 'http://api.tempo.18ruedivona.eu/forecast')
  .constant('TEMPO_API_URL', 'http://api.tempo.18ruedivona.eu/tempo/')
  .constant('EJP_API_FROM_MONTH', 10)
  .constant('EJP_API_FROM_DAY', 1)
  .constant('EJP_API_COUNT', 22)
  .constant('TEMPO_API_FROM_MONTH', 9)
  .constant('TEMPO_API_FROM_DAY', 1)
  .constant('TEMPO_API_COUNT_BLUE', 300)
  .constant('TEMPO_API_COUNT_WHITE', 43)
  .constant('TEMPO_API_COUNT_RED', 22);
