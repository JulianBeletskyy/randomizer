(function () {
    'use strict';

    angular.module('app').factory('langs', ['$http', '$cookies', '$window', langs]);

    function langs($http, $cookies, $window) {
        var list = {'langs': {}};
        var language = $cookies.get('langs');
        var languages = ['uk'];
        
        if ( ! language) {
            language = $window.navigator.language || $window.navigator.userLanguage;
        }
        
        var chooseLanguage = function() {
            if (languages.indexOf(language) == -1) {
                list = {'langs': {}};
                language = 'en';
                $cookies.remove('langs');
                $cookies.put('langs', 'en');
            } else {
                $http.get('/langs/'+ language + '.json').then(function(response) {
                    list.langs = response.data;
                    $cookies.remove('langs');
                    $cookies.put('langs', language);
                });
            }
        };
        
        chooseLanguage();

        return {
            get: function(key, vars) {
                vars = vars || false;
                
                if (vars) {
                   for (var i in vars) {
                        key = key.replace(":" + i, vars[i]);
                    } 
                }
                var text = key;
                
                for (var i in list.langs) {
                    if (i.toLowerCase() == key.toLowerCase() && list.langs[i] != '') {
                        text = list.langs[i];
                    }
                }

                return text;
           },
           getLanguage: function() {
                return language;
           },
           putLanguage: function(lan) {
                language = lan;
                chooseLanguage();
           }
        };
    };
})();

;

(function () {
    'use strict';

    angular.module('app').factory('logger', ['langs', logger]);

    function logger(langs) {

        toastr.options = {
            "closeButton": true,
            "positionClass": "toast-bottom-right",
            "timeOut": "2000",
            "newestOnTop": true
        };

        var logIt = function(message, vars, type) {
            return toastr[type](langs.get(message, vars));
        };

        return {
            log: function(message, vars) {
                logIt(message, vars, 'info');
            },
            logWarning: function(message, vars) {
                logIt(message, vars, 'warning');
            },
            logSuccess: function(message, vars) {
                logIt(message, vars, 'success');
            },
            logError: function(message, vars) {
                logIt(message, vars, 'error');
            },
            check: function(data) {
                if (data.messages) {
                    for (var key in data.messages) {
                        var message = data.messages[key];
                        this[this.method(message.type)](message.text);
                    }
                }

                var data = typeof(data.data) == "string" ? JSON.parse(data.data) : data.data;
                if (data) {
                    return data;
                } else {
                    return false;
                }
            },
            method: function(type) {
                return 'log' + type.charAt(0).toUpperCase() + type.slice(1);
            }
        };
    };
})();

;

(function () {
    'use strict';

    angular.module('app').factory('request', ['$http', '$rootScope', 'logger', '$cookies', request]);

    function request($http, $rootScope, logger, $cookies) {
        //var api_url = "http://db.da4.info/api/v1/";
        var api_url = "http://dereban-api.da/api/v1/";

        return {
            send: function (adrress, post_mas, callback, method) {
                callback = callback || false;
                method = method || 'post';

                var data = $.param(post_mas);
                var req = {
                    method: method,
                    url: api_url + adrress,
                    data: data,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
                if ($cookies.get('token')) {
                    req.headers.Authorization = 'Bearer ' + $cookies.get('token')
                }

                $http(req).then(function(response) {
                    var data = logger.check(response.data);
                    if (response.data.message) {
                        logger.logSuccess(response.data.message);
                    }
                    
                    if (callback) {
                        (callback)(data);
                    }
                }).catch(function(reason) {
                    if (reason.data) {
                        if (reason.data.validate) {
                            for (var k in reason.data.validate) {
                                for (var j in reason.data.validate[k]) {
                                    logger.logError(reason.data.validate[k][j]);
                                }
                            }
                        }
                        
                        if (reason.data.message) {
                            logger.logError(reason.data.message);
                        }
                    }
                });
            }

            /*sendWithFiles: function (adrress, post_mas, callback, percentsCallback, method) {
                callback = callback || false;
                percentsCallback = percentsCallback || false;
                method = method || 'post';

                Upload.upload({
                    url: (api_url + adrress),
                    data: post_mas
                }).then(function (response) {
                    var data = logger.check(response.data);
                    if (callback) {
                        (callback)(data);
                    }
                }, function (response) {
                    
                }, function (event) {
                    var progress = parseInt(100.0 * event.loaded / event.total);
                    if (percentsCallback) {
                        (percentsCallback)(progress);
                    }
                });
            }*/
        };
    };
})();

;

(function () {
    'use strict';

    angular.module('app').factory('validate', ['logger', validate])
    
    function validate(logger) {     
        return {
            check: function(field, name, object_field, zero) {
                zero = zero || false;
                object_field = object_field || false;
                if (object_field && typeof(field.$viewValue) == 'object') {
                    if (field.$viewValue[object_field] == '0') {
                        logger.logError(':name is required', {'name': name});
                        return false;
                    }
                }

                if (field.$valid) {
                    if ((field.$$element["0"].localName == 'select' || zero) && field.$viewValue == '0') {
                        logger.logError('Choose :name first', {'name': name});
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    if ( field.$viewValue == '' || field.$viewValue == undefined ) {
                        logger.logError(':name is required', {'name': name});
                    } else {
                        logger.logError(':name is incorrect', {'name': name});
                    }
                    return false;
                }
            }
        };
    };
})();

;

(function () {
    'use strict';

    angular.module('app').service('resultsService', function() {
        var result = {
            'type': '',
            'list': []
        };
        
        var addList = function(list, type) {
            result.list = list;
            result.type = type;
        };

        var getList = function(){
            return result;
        };

        return {
            addList: addList,
            getList: getList
        };
    });
})();

;

(function () {
    'use strict';

    angular.module('app').service('playersService', function() {
        var result = [];
        
        var addPlayer = function(user) {
            result.push(user);
        };

        var removePlayer = function(id) {
            for (var k in result) {
                if (result[k].id == id) {
                    result.splice(k, 1);
                }
            }
        };

        var getPlayer = function(id) {
            for (var k in result) {
                if (result[k].id == id) {
                    return true;
                }
            }
            return false;
        };

        var getPlayers = function() {
            return result;
        };

        return {
            addPlayer: addPlayer,
            removePlayer: removePlayer,
            getPlayer: getPlayer,
            getPlayers: getPlayers
        };
    });
})();

;