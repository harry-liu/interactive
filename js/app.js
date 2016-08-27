var app = angular.module('hudongquan', ['interactiveControllers','ngRoute','ngAnimate','ui.bootstrap','ngTouch','ngFileUpload','hmTouchEvents','localStorageService','APIService','DataService']);

app.directive('focusMe', function($timeout) {
	return {
	scope: { trigger: '@focusMe' },
		link: function(scope, element) {
			scope.$watch('trigger', function(value) {
				if(value === "true") { 
					$timeout(function() {
					element[0].focus(); 
					});
				}
			});
		}
	};
});

app.service('OpenAlertBox',function($uibModal,$q){
  this.openAlert = function(msg){
    var modalInstance = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      templateUrl: 'myModalAlertContent.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
      resolve: {
        item: function () {
          return msg;
        }
      }
    });
    return $q(function(resolve,reject){
    	modalInstance.result.then(function () {
    	  resolve('ok');
    	});
    })
  };
  
  this.openConfirm = function(msg){
  	var modalInstance = $uibModal.open({
  	  animation: true,
  	  ariaLabelledBy: 'modal-title',
  	  templateUrl: 'myModalConfirmContent.html',
  	  controller: 'ModalInstanceCtrl',
  	  controllerAs: '$ctrl',
  	  resolve: {
  	    item: function () {
  	      return msg;
  	    }
  	  }
  	});
  	return $q(function(resolve,reject){
  		modalInstance.result.then(function () {
  		  resolve('ok');
  		}, function () {
  		  resolve('cancle');
  		});
  	})
  }
})

app.constant('ProductContImageReplace', 'http://192.168.1.16');
//app.constant('ProductContImageReplace', 'http://hdq.hudongcn.com');

app.factory('NewOrder', [function(){
	var order = {};
	return {
		saveOrderData:function(data){
			order = data;
		},
		getOrderData:function(){
			return order;
		},
		checkOrderData:function(){
			if(Object.keys(order).length == 0){
				return false;
			}
			else{
				return true;
			}
		}
	}
}])

app.run(['$rootScope', '$location','locals','AuthenticationService','FetchData','$anchorScroll','NewOrder',function($rootScope,$location,locals,AuthenticationService,FetchData,$anchorScroll,NewOrder){
	$anchorScroll.yOffset = 44;   // always scroll by 50 extra pixels

	$rootScope.$on('$routeChangeStart', function(evt, next, current){
	//console.log('route begin change');
	//check black cover is opern
	if(!$rootScope.hideBlackCover){
		if(next.originalPath == "/search_list/:id"||next.originalPath == "/product_list/:id"){
			$rootScope.loadingData = true;
		}
		else{
			evt.preventDefault();
		}
	}
	else{
		$rootScope.loadingData = true;

		//判断是否有填写订单数据
		if(next.originalPath != "/product_buy/:id"||next.originalPath != "/insert_user"){
			var ob = {};
			NewOrder.saveOrderData(ob);
		}

		//判断是否第一次打开app
		if(!locals.get('alreadyLogIn',false)){
			evt.preventDefault();
			$location.path('/new_user');
			locals.set('alreadyLogIn',true)
		}
	}
	});
}]);

app.service('SaveToken', ['AuthenticationService', function(AuthenticationService){
	function saveData(data){
		AuthenticationService.setAccessToken(data.access_token);
		AuthenticationService.setTokenType(data.token_type);
		AuthenticationService.setRefreshToken(data.refresh_token);
	}
	return saveData;
}])

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/home', {                                          //首页
		templateUrl: 'home.html',
		controller: 'HomeCtrl',
		resolve:{
			menuData: function (FetchData) {
				var url = "categories";
				return FetchData.getPublicAPI(url);
			},
			listData:function(FetchData){
				var url = "categories/get?id=5";
				return FetchData.getPublicAPI(url);
			}
		}
	}).
	when('/new_user', {                                      //
		templateUrl: 'new_user_intro.html',
		controller: 'NewUserCtrl'
	}).
	when('/home/discount', {
		templateUrl: 'discount.html',
		controller: 'DiscountCtrl'
	}).
	when('/home/discount/:id', {
		templateUrl: 'discount_detail.html',
		controller: 'DiscountDetailCtrl'
	}).
	when('/community', {
		templateUrl: 'community.html',
		controller: 'CommunityCtrl',
		resolve:{
			communityList:function(FetchData){
				return FetchData.getPublicAPI('community/articles');
			}
		}
	}).
	when('/community/:id', {
		templateUrl: 'community_detail.html',
		controller: 'CommunityDetailCtrl',
		resolve:{
			communityDetail:function(FetchData,$route){
				var id = $route.current.params.id;
				var url = "community/view?id="+id;
				return FetchData.getPublicAPI(url);
			}
		}
	}).
	when('/product/:id', {
		templateUrl: 'product_detail.html',
		controller: 'ProductDetailCtrl',
		resolve:{
			productDetail:function(FetchData,$route){
				var id = $route.current.params.id;
				var url = "productions/detail?id="+id;
				return FetchData.getPublicAPI(url);
			}
		}
	}).
	when('/product_buy/:id', {
		templateUrl: 'product_buy_detail.html',
		controller: 'ProductBuyDetailCtrl',
		data:{
			requireUserlogin:true
		},
		resolve:{
			productBuyDetailData:function(FetchData,AuthenticationService,NewOrder,$route,ConfirmToken,$location,$rootScope){
				return ConfirmToken.confirm().then(function(data){
					if(data){
						if(NewOrder.checkOrderData()){
							return NewOrder.getOrderData();
						}
						else{
							var url = "orders/create?id="+$route.current.params.id;
							var token = AuthenticationService.getAccessToken();
							return FetchData.getData(url,token);
						}
					}
					else{
						$rootScope.nextUrl = $location.path();
						$location.path('/login');
					}
				})
			}
		}
	}).
	when('/insert_user', {
		templateUrl: 'insert_user.html',
		controller: 'InsertUserCtrl',
		resolve:{
			userListData:function(FetchData,AuthenticationService){
				var url = 'customers/my-customers';
				var token = AuthenticationService.getAccessToken();
				return FetchData.getData(url,token);
			}
		}
	}).
	when('/teach', {
		templateUrl: 'teach.html',
		controller: 'TeachCtrl'
	}).
	when('/search', {
		templateUrl: 'search.html',
		controller: 'SearchCtrl'
	}).
	when('/search_list', {
		templateUrl: 'search_list.html',
		controller: 'SearchListCtrl',
		resolve:{
			productList:function(FetchData,$route){
				var url = "productions";
				return FetchData.getPublicAPI(url);
			}
		}
	}).
	when('/search_list/:id', {
		templateUrl: 'search_list.html',
		controller: 'SearchListCtrl',
		resolve:{
			productList:function(FetchData,$route){
				var id = $route.current.params.id;
				var url = "productions?keyword="+id;
				return FetchData.getPublicAPI(url);
			}
		}
	}).
	when('/product_list/:id', {
		templateUrl: 'search_list.html',
		controller: 'SearchListCtrl',
		resolve:{
			productList:function(FetchData,$route){
				var id = $route.current.params.id;
				var url = "categories/get?id="+id;
				return FetchData.getPublicAPI(url);
			}
		}
	}).
	when('/example/:id', {
		templateUrl: 'example.html',
		controller: 'ExampleCtrl',
		resolve:{
			exampleData:function(FetchData,AuthenticationService,$route){
				var id = $route.current.params.id;
				var url = "productions/orders?id="+id;
				var token = AuthenticationService.getAccessToken();
				return FetchData.getData(url,token);
			}
		}
	}).
	when('/example_detail/:id', {
		templateUrl: 'example_detail.html',
		controller: 'ExampleDetailCtrl'
	}).
	when('/us', {
		templateUrl: 'us.html',
		controller: 'UsCtrl',
		data:{
			requireUserlogin:true
		},
		resolve:{
			checkUserLogin:function(ConfirmToken,$location){
				return ConfirmToken.confirm().then(function(data){
					if(!data){
						$location.path('/login');
					}
				})
			}
		}
	}).
	when('/client_list', {
		templateUrl: 'client_list.html',
		controller: 'ClientListCtrl',
		reloadOnSearch: false,
		resolve:{
			clientListData:function(FetchData,AuthenticationService){
				var url = 'customers/my-customers';
				var token = AuthenticationService.getAccessToken();
				return FetchData.getData(url,token);
			}
		}
	}).
	when('/client_add', {
		templateUrl: 'client_add.html',
		controller: 'ClientAddCtrl',
		resolve:{
			fieldsData:function(FetchData,AuthenticationService){
				var url = "customers/create";
				var token = AuthenticationService.getAccessToken();
				return FetchData.getData(url,token);
			}
		}
	}).
	when('/client_add/:id', {
		templateUrl: 'client_add.html',
		controller: 'ClientChangeCtrl',
		resolve:{
			clientData:function(FetchData,AuthenticationService,$route){
				var id = $route.current.params.id;
				var url = 'customers/edit?id='+id;
				var token = AuthenticationService.getAccessToken();
				return FetchData.getData(url,token);
			}
		}
	}).
	when('/client_history/:id', {
		templateUrl: 'client_history.html',
		controller: 'ClientHistoryCtrl',
		resolve:{
			historyData:function(FetchData,AuthenticationService,$route){
				var id = $route.current.params.id;
				var url = 'customers/orders?id='+id;
				var token = AuthenticationService.getAccessToken();
				return FetchData.getData(url,token);
			}
		}
	}).
	when('/client_detail/:id', {
		templateUrl: 'client_detail.html',
		controller: 'ClientDetailCtrl',
		resolve:{
			clientData:function($route,FetchData,AuthenticationService){
				var id = $route.current.params.id;
				var url = 'customers/view?id='+id;
				var token = AuthenticationService.getAccessToken();
				return FetchData.getData(url,token);
			}
		}
	}).
	when('/personal_detail', {
		templateUrl: 'personal_detail.html',
		controller: 'PersonalDetailCtrl'
	}).
	when('/add_alipay', {
		templateUrl: 'add_alipay.html',
		controller: 'AddAliPayCtrl'
	}).
	when('/withdraw', {
		templateUrl: 'withdraw.html',
		controller: 'WithdrawCtrl'
	}).
	when('/withdraw_complete', {
		templateUrl: 'withdraw_complete.html',
		controller: 'WithdrawCompleteCtrl'
	}).
	when('/login', {
		templateUrl: 'login.html',
		controller: 'LoginCtrl'
	}).
	when('/my_discount', {
		templateUrl: 'my_discount.html',
		controller: 'MyDiscountCtrl'
	}).
	when('/booking_list', {
		templateUrl: 'booking_list.html',
		controller: 'BookingListCtrl',
		resolve:{
			bookingListData:function(FetchData,AuthenticationService){
				var url = "orders/my-orders";
				var token = AuthenticationService.getAccessToken();
				return FetchData.getData(url,token);
			}
		}
	}).
	when('/booking_detail/:id/:type', {
		templateUrl: 'booking_detail.html',
		controller: 'BookingDetailCtrl',
		resolve:{
			bookingDetailData:function(FetchData,AuthenticationService,$route){
				var url = 'orders/edit?id='+$route.current.params.id;
				var token = AuthenticationService.getAccessToken();
				return FetchData.getData(url,token);
			}
		}
	}).
	when('/qr_payment/:id', {
		templateUrl: 'qr_payment.html',
		controller: 'QRPaymentCtrl'
	}).
	when('/offline_payment/:id', {
		templateUrl: 'offline_payment.html',
		controller: 'OfflinePaymentCtrl',
		resolve:{
			paymentData:function(FetchData,AuthenticationService,$route){
				var url = 'orders/detail?id='+$route.current.params.id;
				var token = AuthenticationService.getAccessToken();
				return FetchData.getData(url,token);
			}
		}
	}).
	when('/settings', {
		templateUrl: 'settings.html',
		controller: 'SettingsCtrl'
	}).
	when('/test_list', {
		templateUrl: 'test_list.html',
		controller: 'TestListCtrl'
	}).
	when('/test_detail/:id', {
		templateUrl: 'test_detail.html',
		controller: 'TestDetailCtrl'
	}).
	when('/disconnect', {
		templateUrl: 'disconnect.html',
		controller: 'DisconnectCtrl'
	}).
	otherwise({
		redirectTo: '/home'
	});
}]);
