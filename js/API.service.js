var APIService = angular.module('APIService', []);

APIService.factory('PublicURL', function(){
  //return 'http://192.168.1.16/api/';
  return 'http://hdq.hudongcn.com/api/';
  //return 'http://192.168.40.27/api/';
})

//save token into localstorage
APIService.factory('AuthenticationService', function(locals) {
    return{
        setAccessToken:function(value){
            locals.set('access_token',value);
        },
        getAccessToken:function(){
            return locals.get('access_token','');
        },
        setTokenType:function(value){
            locals.set('token_type',value);
        },
        getTokenType:function(){
            return locals.get('token_type','');
        },
        setRefreshToken:function(value){
            locals.set('refresh_token',value);
        },
        getRefreshToken:function(){
            return locals.get('refresh_token','');
        },
        logOut:function(){
            locals.remove('access_token');
            locals.remove('refresh_token');
            locals.remove('token_type');
        }
    }
});

APIService.factory('FetchData', function FetchData($http,PublicURL,$location) {  
    return {
        getPublicAPI:function getPublicAPI(url){
            return $http.get(PublicURL+url)
            .then(function successCallback(response){
                return response;
            }, function errorCallback(response){
                console.log(response);
                $location.path('/disconnect');
            })
        },
        getData:function getData(url,token){
            return $http({
                url:PublicURL+url,
                method:'post',
                headers: {
                    'Authorization': 'Bearer '+token,
                    'Content-Type': 'application/json'
                }
            })
            .then(function successCallback(response){
                return response;
            }, function errorCallback(response) {
                console.log(response);
                if(response.status == -1){
                    $location.path('/disconnect');
                }
                else{
                    $location.path('/login');
                }
            })
        },
        getImageData:function getImageData(url,token){
            return $http({
                url:PublicURL+url,
                method:'post',
                headers: {
                    'Authorization': 'Bearer '+token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(function successCallback(response){
                return response;
            }, function errorCallback(response) {
                console.log(response);
                if(response.status == -1){
                    $location.path('/disconnect');
                }
                else{
                    $location.path('/login');
                }
            })
        }
    };  
});

APIService.factory('PushData', ['$http','PublicURL','Upload',function($http,PublicURL,Upload){
    return {
        push:function push(url,data,token){
            return $http({
                url:PublicURL+url,
                method:'post',
                headers: {
                    'Authorization': 'Bearer '+token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data:data
            })
            .then(function successCallback(response){
                return response;
            }, function errorCallback(response) {
                return response;
            })
        },
        uploadImage:function uploadImage(file,token){
            return Upload.upload({
                url: PublicURL+'upload',
                method:"post",
                headers: {
                    'Authorization': 'Bearer '+token
                },
                file:file
            }).then(function (response) {
                return response;
            }, function (response) {
                //if (response.status > 0)
                    //$scope.errorMsg = response.status + ': ' + response.data;
                console.log(response);
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                console.log(file.progress);
            });
        }
    } 
}])

APIService.factory('LogService', function LogService($http,PublicURL,$location) {  
    return {  
        login: function (phone,code) {
            return $http({
                url:PublicURL+'access_token',
                method:"POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: 'grant_type=password&client_id=hdq&client_secret=hdq&username='+phone+'&code='+code+'&password='
            })
            .then(function successCallback(response){
                return response;
            }, function errorCallback(response) {
                console.log(response);
                if(response.status == -1){
                    $location.path('/disconnect');
                }
                else{
                    $location.path('/login');
                }
            });
        },
        sms:function(info){
            return $http({
                url:PublicURL+'sms/verify-code',
                method:"POST",
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data:info
            })
            .then(function successCallback(response){
                return response;
            }, function errorCallback(response) {
                console.log(response);
                if(response.status == -1){
                    $location.path('/disconnect');
                }
            });
        },
        refreshToken:function(info){
            return $http({
                url:PublicURL+'access_token',
                method:"POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: 'grant_type=refresh_token&client_id=hdq&client_secret=hdq&refresh_token='+info
            })
            .then(function successCallback(response){
                console.log(response);
                return response;
            }, function errorCallback(response) {
                if(response.status == -1){
                    $location.path('/disconnect');
                }
                else{
                    return response;
                }
            });
        },
        checkToken:function(token){
            return $http({
                url:PublicURL+'check_token',
                method:"POST",
                headers:{
                    'Authorization':'Bearer '+token
                }
            }).then(function successCallback(response){
                console.log(response);
                return response;
            }, function errorCallback(response) {
                if(response.status == -1){
                    $location.path('/disconnect');
                }
                else{
                    return response;
                }
            })
        }
    };  
});

APIService.factory('ConfirmToken', ['AuthenticationService','$q','LogService','$http','PublicURL','$location','SaveToken',function(AuthenticationService,$q,LogService,$http,PublicURL,$location,SaveToken){
    return {  
        confirm:function confirm(){
            var deferred = $q.defer();

            function checkToken(){
                var token = AuthenticationService.getAccessToken();
                return LogService.checkToken(token);
            }
            function refreshToken(){
                var token = AuthenticationService.getRefreshToken();
                return LogService.refreshToken(token);
            }

            if(!AuthenticationService.getAccessToken()){
                deferred.resolve(false);
            }
            else{
                checkToken().then(function(data){
                    if(data){
                        if(data.data.message){
                            deferred.resolve(true);
                        }
                        else{
                            refreshToken().then(function(data){
                                console.log(data);
                                SaveToken(data.data);
                                deferred.resolve(true);
                            })
                        }
                    }
                });
            }
            return deferred.promise;
        }
    }
}])