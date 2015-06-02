describe('Divona Angular EJP module', function () {
  var $rootScope, $httpBackend, $q;
  var Ejp, API_URL, FROM_MONTH, FROM_DAY, COUNT;
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

    Ejp = $injector.get('divonaNgEdf.Ejp');
    API_URL = $injector.get('EJP_API_URL');
    FROM_MONTH = $injector.get('EJP_API_FROM_MONTH');
    FROM_DAY= $injector.get('EJP_API_FROM_DAY');
    COUNT = $injector.get('EJP_API_COUNT');

    if (moment().isLeapYear()) {
      COUNT = COUNT + 1;
    }

    fixtures = [
      { zones: { south: false, west: false, paca: false, north: false }, date: { day: 1, month: 1, year: 1985 } },
      { zones: { south: true, west: false, paca: false, north: false }, date: { day: 2, month: 1, year: 1985 } },
      { zones: { south: true, west: true, paca: false, north: false }, date: { day: 3, month: 1, year: 1985 } },
      { zones: { south: true, west: true, paca: true, north: false }, date: { day: 4, month: 1, year: 1985 } },
      { zones: { south: true, west: true, paca: true, north: true }, date: { day: 5, month: 1, year: 1985 } },
      { zones: { south: false, west: true, paca: false, north: false }, date: { day: 6, month: 1, year: 1985 } },
      { zones: { south: false, west: false, paca: true, north: false }, date: { day: 7, month: 1, year: 1985 } },
      { zones: { south: false, west: false, paca: false, north: true }, date: { day: 8, month: 1, year: 1985 } },
      { zones: { south: true, west: true, paca: false, north: false }, date: { day: 9, month: 1, year: 1985 } },
      { zones: { south: false, west: true, paca: true, north: false }, date: { day: 10, month: 1, year: 1985 } },
      { zones: { south: false, west: false, paca: true, north: true }, date: { day: 11, month: 1, year: 1985 } },
      { zones: { south: true, west: false, paca: true, north: false }, date: { day: 12, month: 1, year: 1985 } },
      { zones: { south: false, west: true, paca: false, north: true }, date: { day: 13, month: 1, year: 1985 } },
      { zones: { south: false, west: true, paca: true, north: true }, date: { day: 14, month: 1, year: 1985 } },
      { zones: { south: false, west: false, paca: false, north: false }, date: { day: 15, month: 1, year: 1985 } },
      { zones: { south: false, west: true, paca: true, north: false }, date: { day: 16, month: 1, year: 1985 } },
      { zones: { south: false, west: false, paca: false, north: false }, date: { day: 17, month: 1, year: 1985 } },
      { zones: { south: false, west: false, paca: false, north: false }, date: { day: 18, month: 1, year: 1985 } }
    ];

    saveFixture = {
      year: '1985',
      month: '1',
      day: '18',
      zones: { south: true, west: true, paca: false, north: false }
    };

    // Set up the mock http service responses
    $httpBackend = $injector.get('$httpBackend');

    // backend definition
    // Count response.
    var countURL = new RegExp('^' + escapeUrl(API_URL) + 'count\/[0-9]{4}-[0-9]{2}-[0-9]{2}\\\?[0-9]{10}');
    $httpBackend.when('GET', countURL).respond({ 'north': 30, 'paca': 10, 'west': 8, 'south': 0 });

    // Month fetch response.
    var getMonthURL = new RegExp('^' + escapeUrl(API_URL) + '[0-9]{4}-[0-9]{2}\\\?[0-9]{10}');
    $httpBackend.when('GET', getMonthURL).respond(fixtures);

    // Year fetch response.
    var getYearURL = new RegExp('^' + escapeUrl(API_URL) + '[0-9]{4}\\\?[0-9]{10}');
    $httpBackend.when('GET', getYearURL).respond(fixtures);

    // Save reponse.
    $httpBackend.when('POST', API_URL + '?apikey=' + APIKEY, saveFixture).respond(200);

    // Delete reponse.
    var deleteUrl = new RegExp('^' + escapeUrl(API_URL) + '[0-9]{4}-[0-9]{2}-[0-9]{2}\\\?apikey\=' + APIKEY)
    $httpBackend.when('DELETE', deleteUrl).respond(200);
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should format data', function () {
    expect(Ejp.format(true)).toEqual("EJP");
    expect(Ejp.format(false)).toEqual("Non EJP");
  });

  it('should have a method to get start date', function () {
    expect(Ejp.getStartDate()).toBeDefined();
  });

  it('should return the number of remaining days of each zone', function () {
    $httpBackend.expectGET(API_URL + 'count/' + Ejp.getStartDate().format('YYYY-MM-DD') + '?' + moment().unix());
    Ejp.getCounter().then(function (response) {
      expect(response.north).toEqual(COUNT - 30);
      expect(response.paca).toEqual(COUNT - 10);
      expect(response.west).toEqual(COUNT - 8);
      expect(response.south).toEqual(COUNT - 0);
    });
    $httpBackend.flush();
  });

  var checkListByZone = function (zone, format, method) {
    var date = moment('1985-01-18');
    var url = API_URL + date.format(format) + '?' + moment().unix();

    $httpBackend.expectGET(url);
    Ejp[method](zone, date).then(function (response) {
      expect(Object.keys(response).length).toEqual(18);
      expect(response['1985-01-01']).toEqual({raw: false, formated: 'Non EJP'});
      expect(response['1985-01-02']).toEqual({raw: true, formated: 'EJP'});
    });
    $httpBackend.flush();

    // check cache.
    Ejp[method](zone, date, false).then(function (response) {
      expect(Object.keys(response).length).toEqual(18);
    });
    $httpBackend.expectGET(url);
    Ejp[method](zone, date, true).then(function (response) {
      expect(Object.keys(response).length).toEqual(18);
    });
    $httpBackend.flush();
  };

  it('should get a list of all days of a month ordered by zone', function () {
    checkListByZone('south', 'YYYY-MM', 'getMonthByZone');
  });

  it('should get a list of all days of a year ordered by zone', function () {
    checkListByZone('south', 'YYYY', 'getYearByZone');
  });

  var checkListByDate = function (format, method) {
    var date = moment('1985-01-18');
    var url = API_URL + date.format(format) + '?' + moment().unix();

    $httpBackend.expectGET(url);
    Ejp[method](date).then(function (response) {
      expect(Object.keys(response).length).toEqual(18);
      expect(response['1985-01-01']).toEqual({
        south: {raw: false, formated: 'Non EJP'},
        west: {raw: false, formated: 'Non EJP'},
        paca: {raw: false, formated: 'Non EJP'},
        north: {raw: false, formated: 'Non EJP'}
      });
      expect(response['1985-01-02']).toEqual({
        south: {raw: true, formated: 'EJP'},
        west: {raw: false, formated: 'Non EJP'},
        paca: {raw: false, formated: 'Non EJP'},
        north: {raw: false, formated: 'Non EJP'}
      });
      expect(response['1985-01-05']).toEqual({
        south: {raw: true, formated: 'EJP'},
        west: {raw: true, formated: 'EJP'},
        paca: {raw: true, formated: 'EJP'},
        north: {raw: true, formated: 'EJP'}
      });
    });
    $httpBackend.flush();

    // check cache.
    Ejp[method](date, false).then(function (response) {
      expect(Object.keys(response).length).toEqual(18);
    });
    $httpBackend.expectGET(url);
    Ejp[method](date, true).then(function (response) {
      expect(Object.keys(response).length).toEqual(18);
    });
    $httpBackend.flush();
  };

  it('should get a list of all days of a month ordered by date', function () {
    checkListByDate('YYYY-MM', 'getMonthByDate');
  });

  it('should get a list of all days of a year ordered by date', function () {
    checkListByDate('YYYY', 'getYearByDate');
  });

  it('should save a Ejp object', function () {
    $httpBackend.expectPOST(API_URL + '?apikey=' + APIKEY, saveFixture);
    Ejp.save(APIKEY, moment('1985-01-18'), saveFixture.zones).then(function (response) {
      expect(response.status).toEqual(200);
    });
    $httpBackend.flush();

    var wrongZones = { south: true, west: true, east: false, north: false };
    Ejp.save(APIKEY, moment('1985-01-18'), wrongZones).then(function (response) {
      expect(response).toBeFalsy();
    });

    wrongZones = saveFixture.zones;
    wrongZones.paca = 'soleil';
    Ejp.save(APIKEY, moment('1985-01-18'), wrongZones).then(function (response) {
      expect(response).toBeFalsy();
    });

    Ejp.save(APIKEY, '18-01-1985', saveFixture.zones).then(function (response) {
      expect(response).toBeFalsy();
    });
  });

  it('should delete a Ejp object', function () {
    $httpBackend.expectDELETE(API_URL + '1985-01-18?apikey=' + APIKEY);
    Ejp.delete(APIKEY, moment('1985-01-18')).then(function (response) {
      expect(response.status).toEqual(200);
    });
    $httpBackend.flush();

    Ejp.delete(APIKEY, '18-01-1985').then(function (response) {
      expect(response).toBeFalsy();
    });
  });
});