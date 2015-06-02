describe('Divona Angular Tempo module', function () {
  var $rootScope, $httpBackend, $q;
  var Tempo, API_URL, FROM_MONTH, FROM_DAY, COUNT_BLUE, COUNT_WHITE, COUNT_RED;
  var APIKEY = 'MOCK_VALID_KEY';
  var fixtures, saveFixture;

  var escapeUrl = function (url) {
    return url.replace(/[-[\]{}()*+?.\\^$|\/]/g, "\\$&");
  };

  // Set up the module
  beforeEach(module('divonaNgEdf'));

  beforeEach(inject(function ($injector) {
    $rootScope = $injector.get('$rootScope');
    $q = $injector.get('$q');

    Tempo = $injector.get('divonaNgEdf.Tempo');
    API_URL = $injector.get('TEMPO_API_URL');
    FROM_MONTH = $injector.get('TEMPO_API_FROM_MONTH');
    FROM_DAY= $injector.get('TEMPO_API_FROM_DAY');
    COUNT_BLUE = $injector.get('TEMPO_API_COUNT_BLUE');
    COUNT_WHITE = $injector.get('TEMPO_API_COUNT_WHITE');
    COUNT_RED = $injector.get('TEMPO_API_COUNT_RED');

    if (moment().isLeapYear()) {
      COUNT_BLUE = COUNT_BLUE + 1;
    }

    fixtures = [
      { color: "blue", date: {day: 1, month: 1, year: 1985 } },
      { color: "white", date: {day: 2, month: 1, year: 1985 } },
      { color: "red", date: {day: 3, month: 1, year: 1985 } },
      { color: "red", date: {day: 4, month: 1, year: 1985 } },
      { color: "white", date: {day: 5, month: 1, year: 1985 } },
      { color: "white", date: {day: 6, month: 1, year: 1985 } },
      { color: "white", date: {day: 7, month: 1, year: 1985 } },
      { color: "white", date: {day: 8, month: 1, year: 1985 } },
      { color: "red", date: {day: 9, month: 1, year: 1985 } },
      { color: "red", date: {day: 10, month: 1, year: 1985 } },
      { color: "blue", date: {day: 11, month: 1, year: 1985 } },
      { color: "blue", date: {day: 12, month: 1, year: 1985 } },
      { color: "blue", date: {day: 13, month: 1, year: 1985 } },
      { color: "blue", date: {day: 14, month: 1, year: 1985 } },
      { color: "blue", date: {day: 15, month: 1, year: 1985 } },
      { color: "red", date: {day: 16, month: 1, year: 1985 } },
      { color: "white", date: {day: 17, month: 1, year: 1985 } },
      { color: "blue", date: {day: 18, month: 1, year: 1985 } }
    ];

    saveFixture = { year: '1985', month: '1', day: '18', color: 'red' };

    // Set up the mock http service responses
    $httpBackend = $injector.get('$httpBackend');

    // backend definition
    // Count response.
    var countURL = new RegExp('^' + escapeUrl(API_URL) + 'count\/[0-9]{4}-[0-9]{2}-[0-9]{2}\\\?[0-9]{10}');
    $httpBackend.when('GET', countURL).respond({'blue': 30, 'white': 10, 'red': 8 });

    // Month fetch response.
    $httpBackend.when('GET', new RegExp('^' + escapeUrl(API_URL) + '[0-9]{4}-[0-9]{2}\\\?[0-9]{10}')).respond(fixtures);

    // Year fetch response.
    $httpBackend.when('GET', new RegExp('^' + escapeUrl(API_URL) + '[0-9]{4}\\\?[0-9]{10}')).respond(fixtures);

    // Save reponse.
    $httpBackend.when('POST', API_URL + '?apikey=' + APIKEY, saveFixture).respond(200);

    // Delete reponse.
    var deleteUrl = new RegExp('^' + escapeUrl(API_URL) + '[0-9]{4}-[0-9]{2}-[0-9]{2}\\\?apikey\=' + APIKEY);
    $httpBackend.when('DELETE', deleteUrl).respond(200);
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should format color', function () {
    expect(Tempo.formatColor('blue')).toEqual("Bleu");
    expect(Tempo.formatColor('white')).toEqual("Blanc");
    expect(Tempo.formatColor('red')).toEqual("Rouge");
  });

  it('should have a method to get start date', function () {
    expect(Tempo.getStartDate()).toBeDefined();
  });

  it('should return the number of remaining days of each colors', function () {
    $httpBackend.expectGET(API_URL + 'count/' + Tempo.getStartDate().format('YYYY-MM-DD') + '?' + moment().unix());
    Tempo.getCounter().then(function (response) {
      expect(response.blue).toEqual(COUNT_BLUE - 30);
      expect(response.white).toEqual(COUNT_WHITE - 10);
      expect(response.red).toEqual(COUNT_RED - 8);
    });
    $httpBackend.flush();
  });

  var checkList = function(format, method) {
    var date = moment('1985-01-18');
    var url = API_URL + date.format(format) + '?' + moment().unix();
    $httpBackend.expectGET(url);
    Tempo[method](date).then(function (response) {
      expect(Object.keys(response).length).toEqual(18);
      expect(response['1985-01-01']).toEqual({raw: 'blue', formated: 'Bleu'});
      expect(response['1985-01-02']).toEqual({raw: 'white', formated: 'Blanc'});
      expect(response['1985-01-03']).toEqual({raw: 'red', formated: 'Rouge'});
      expect(response['1985-01-18']).toEqual({raw: 'blue', formated: 'Bleu'});
    });
    $httpBackend.flush();

    // check cache.
    Tempo[method](date, false).then(function (response) {
      expect(Object.keys(response).length).toEqual(18);
    });
    $httpBackend.expectGET(url);
    Tempo[method](date, true).then(function (response) {
      expect(Object.keys(response).length).toEqual(18);
    });
    $httpBackend.flush();
  };

  it('should get a list of all days of a month', function () {
    checkList('YYYY-MM', 'getMonth');
  });

  it('should get a list of all days of a year', function () {
    checkList('YYYY', 'getYear');
  });

  it('should save a Tempo object', function () {
    $httpBackend.expectPOST(API_URL + '?apikey=' + APIKEY, saveFixture);
    Tempo.save(APIKEY, moment('1985-01-18'), saveFixture.color).then(function (response) {
      expect(response.status).toEqual(200);
    });
    $httpBackend.flush();

    Tempo.save(APIKEY, moment('1985-01-18'), 'purple').then(function (response) {
      expect(response).toBeFalsy();
    });

    Tempo.save(APIKEY, '18-01-1985', 'white').then(function (response) {
      expect(response).toBeFalsy();
    });
  });

  it('should delete a Tempo object', function () {
    $httpBackend.expectDELETE(API_URL + '1985-01-18?apikey=' + APIKEY);
    Tempo.delete(APIKEY, moment('1985-01-18')).then(function (response) {
      expect(response.status).toEqual(200);
    });
    $httpBackend.flush();

    Tempo.delete(APIKEY, '18-01-1985').then(function (response) {
      expect(response).toBeFalsy();
    });
  });
});