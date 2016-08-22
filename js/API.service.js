var APIService = angular.module('APIService', []);

APIService.factory('PublicURL', function(){
  return 'http://192.168.1.16/api/';
  //return 'http://io52.com/api/';
  //return 'http://192.168.40.27/api/';
  //return 'http://hdq.hudongcn.com/api/';
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


APIService.factory('FetchData', function FetchData($http,PublicURL) {  
    return {  
      getUserInfo: function getUserInfo(token) {  
        return $http({
               url:PublicURL+'user',
               method:"post",
               headers: {
                'Authorization': 'Bearer '+token,
                'Content-Type': 'application/x-www-form-urlencoded'
               }
          })
      },
      getPublicAPI:function getPublicAPI(url,callback){
        $http.get(PublicURL+url)
        .success(function(data){
          callback(null,data);
        })
        .error(function(e){
          callback(e);
        });
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
      }

    };  
});

APIService.factory('PushData', ['$http','PublicURL',function($http,PublicURL){
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
    } 
  } 
}])

APIService.factory('LogService', function LogService($http,PublicURL) {  
    return {  
      login: function (phone,code) {  
        //return $http.post('http://192.168.1.16/api/access_token',info,{'headers':{'Content-Type': 'application/x-www-form-urlencoded'}});
        return $http({
          url:PublicURL+'access_token',
          method:"POST",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: 'grant_type=password&client_id=hdq&client_secret=hdq&username='+phone+'&code='+code+'&password='
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
      },
      refreshToken:function(info){
        return $http({
          url:PublicURL+'access_token',
          method:"POST",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: 'grant_type=refresh_token&client_id=hdq&client_secret=hdq&refresh_token='+info
        });
      },
      checkToken:function(){
        return $http({
          url:PublicURL+'check_token',
          method:"POST",
          headers:{
            'Authorization':'Bearer '+token
          }
        })
      }
    };  
});

APIService.service('GetDataFromAPI', ['AuthenticationService', function(AuthenticationService){
	this.getData = function(url,token,type){
    return 'test';
  }
  
}])