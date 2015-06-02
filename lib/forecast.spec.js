describe('Divona Angular Forecast module', function () {
  var $rootScope, $httpBackend, $q;
  var Forecast, API_URL;
  var fixtures;

  var escapeUrl = function (url) {
    return url.replace(/[-[\]{}()*+?.\\^$|\/]/g, "\\$&");
  };

  // Set up the module
  beforeEach(module('divonaNgEdf'));

  beforeEach(inject(function ($injector) {
    $rootScope = $injector.get('$rootScope');
    $q = $injector.get('$q');

    Forecast = $injector.get('divonaNgEdf.Forecast');
    API_URL = $injector.get('FORECAST_API_URL');

    fixtures = {
      today: {
        tempo: {
          color: 'blue',
          date: { day: 18, month: 1, year: 1985 }
        },
        ejp: {
          zones: { south: false, west: false, paca: true, north: true },
          date: { day: 18, month: 1, year: 1985}
        }
      },
      tomorrow: {
        tempo: {
          color: 'red',
          date: { day: 19, month: 1, year: 1985 }
        },
        ejp: {
          zones: { south: true, west: true, paca: false, north: false },
          date: { day: 19, month: 1, year: 1985 }
        }
      }
    };

    // Set up the mock http service responses
    $httpBackend = $injector.get('$httpBackend');

    // backend definition
    var fetchURL = new RegExp('^' + escapeUrl(API_URL) + '\\\?[0-9]{10}');
    $httpBackend.when('GET', fetchURL).respond(fixtures);
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should get forecast', function () {
    $httpBackend.expectGET(API_URL + '?' + moment().unix());
    Forecast.fetch().then(function (response) {
      expect(response).toEqual({
        'today': {
          'tempo': { 'raw': 'blue', 'format': 'Bleu' },
          'ejp': {
            'north': { 'raw': true, 'format': 'EJP' },
            'paca': { 'raw': true, 'format': 'EJP' },
            'west': { 'raw': false, 'format': 'Non EJP' },
            'south': { 'raw': false, 'format': 'Non EJP' }
          }
        },
        'tomorrow': {
          'tempo': { 'raw': 'red', 'format': 'Rouge' },
          'ejp': {
            'north': { 'raw': false, 'format': 'Non EJP' },
            'paca': { 'raw': false, 'format': 'Non EJP' },
            'west': { 'raw': true, 'format': 'EJP' },
            'south': { 'raw': true, 'format': 'EJP' }
          }
        }
      });
    });
    $httpBackend.flush();
  });

});