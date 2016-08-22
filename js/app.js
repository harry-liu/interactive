var app = angular.module('hudongquan', ['interactiveControllers','ngRoute','ngAnimate','ui.bootstrap','ngTouch','ngFileUpload','hmTouchEvents','localStorageService','APIService','DataService']);

app.directive('focusMe', function($timeout) {
	return {
	scope: { trigger: '@focusMe' },
		link: function(scope, element) {
			scope.$watch('trigger', function(value) {
			if(value === "true") { 
				// console.log('trigger',value);
				$timeout(function() {
				element[0].focus(); 
				});
			}
			});
		}
	};
});

//app.constant('ProductContImageReplace', 'http://192.168.1.16');
app.constant('ProductContImageReplace', 'http://hdq.hudongcn.com');

app.factory('NewOrder', [function(){
	var order;
	return {
		saveOrderData:function(data){
			order = data;
		},
		getOrderData:function(){
			return order;
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
		if(next.originalPath == "/product_buy/:id"||next.originalPath == "/insert_user"){
		}
		else{
			var ob = {};
			NewOrder.saveOrderData(ob);
		}

		//判断页面是否需要登录
		if(next.data){
		var permission = next.data.requireUserlogin;
		if (permission&&(!AuthenticationService.getAccessToken())) {
			evt.preventDefault();
			if(next.params.id){
			$rootScope.nextUrl = next.originalPath.replace(':id',next.params.id);
			console.log($rootScope.nextUrl);
			}
			else{
			$rootScope.nextUrl = next.originalPath;
			}
			$location.path('/login');
		}
		}

		//判断是否第一次打开app
		if(locals.get('alreadyLogIn',false)){
		}
		else{
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
			menuData: function ($q,$location,FetchData) {
			  var defer = $q.defer();
			  var url = "categories";
			  FetchData.getPublicAPI(url,function(error,data){
			  	if(data){
			  		defer.resolve(data.categories);
			  	}
			  })
			  return defer.promise;
			},
			listData:function($q,FetchData){
				var defer = $q.defer();
				var url = "categories/get?id=5";
				FetchData.getPublicAPI(url,function(error,data){
					if(data){
						defer.resolve(data.productions);
					}
				})
				return defer.promise;
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
		controller: 'CommunityCtrl'
	}).
	when('/community/:id', {
		templateUrl: 'community_detail.html',
		controller: 'CommunityDetailCtrl'
	}).
	when('/product/:id', {
		templateUrl: 'product_detail.html',
		controller: 'ProductDetailCtrl'
	}).
	when('/product_buy/:id', {
		templateUrl: 'product_buy_detail.html',
		controller: 'ProductBuyDetailCtrl',
		data:{
			requireUserlogin:true
		}
	}).
	when('/insert_user', {
		templateUrl: 'insert_user.html',
		controller: 'InsertUserCtrl'
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
		controller: 'SearchListCtrl'
	}).
	when('/search_list/:id', {
		templateUrl: 'search_list.html',
		controller: 'SearchListCtrl'
	}).
	when('/product_list/:id', {
		templateUrl: 'search_list.html',
		controller: 'SearchListCtrl'
	}).
	when('/example/:id', {
		templateUrl: 'example.html',
		controller: 'ExampleCtrl'
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
		}
	}).
	when('/client_list', {
		templateUrl: 'client_list.html',
		controller: 'ClientListCtrl',
		reloadOnSearch: false
	}).
	when('/client_add', {
		templateUrl: 'client_add.html',
		controller: 'ClientAddCtrl'
	}).
	when('/client_add/:id', {
		templateUrl: 'client_add.html',
		controller: 'ClientChangeCtrl'
	}).
	when('/client_history/:id', {
		templateUrl: 'client_history.html',
		controller: 'ClientHistoryCtrl'
	}).
	when('/client_detail/:id', {
		templateUrl: 'client_detail.html',
		controller: 'ClientDetailCtrl'
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
		controller: 'BookingListCtrl'
	}).
	when('/booking_detail/:id/:type', {
		templateUrl: 'booking_detail.html',
		controller: 'BookingDetailCtrl'
	}).
	when('/qr_payment/:id', {
		templateUrl: 'qr_payment.html',
		controller: 'QRPaymentCtrl'
	}).
	when('/offline_payment/:id', {
		templateUrl: 'offline_payment.html',
		controller: 'OfflinePaymentCtrl'
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
