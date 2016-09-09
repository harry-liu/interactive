var interactiveControllers = angular.module('interactiveControllers', []);

interactiveControllers.controller('BodyControl', function($scope,$window,locals,$location,$rootScope,FetchData,$timeout,$route) {

	$scope.showTM = true;
	$scope.showBM = true;
	$scope.$on('hideTM', function(e,data){
		$scope.showTM = data;
	});
	$scope.$on('hideBM', function(e,data){
		$scope.showBM = data;
	});	
	$scope.$on('changeTM', function(e,data){
		//top menu type 1:首页
		//top menu type 2:社区
		//top menu type 3:返回+文字
		//top menu type 4:文字
		//top menu type 5:返回+搜索+查找
		//top menu type 6:返回+搜索
		//top menu type 7:返回+文字+购买按钮
		//top menu type 8:返回+文字+添加客户按钮
		//top menu type 9:返回+文字+完成添加客户按钮
		//top menu type 9:返回+文字+完成修改客户按钮
		//top menu type 10:返回+文字+完成修改个人信息按钮
		//top menu type 11:返回+首页搜索框
		$scope.topMenuContent = data;
	});
	$scope.$on('setBottomMenuImage', function(e,data){
		$scope.activeBottomMenuImage = data;
	});

	$rootScope.tabStatus = 1;
	$rootScope.disableAllButton = false;

	$scope.goBackClicked = function(){
		if($route.current.originalPath == '/login'){
			$location.path('/home').replace();
		}
		else{
			$window.history.back();
		}
	}
	//$scope.goToSearch = function(){
		//$window.location.href = "#search";
		//$location.path('#search');
	//}

	$scope.addSearchItem = function(){
		var list = locals.getObject("searchList","")
		if($scope.searchInput){
			if(list.length){
				var findSameItem = false;
				for (var i = 0; i < list.length; i++) {
					if(list[i].content == $scope.searchInput){
						findSameItem = true;
					}
				}
				if(!findSameItem){
					var item = {
						'id':list.length,
						'content':$scope.searchInput
					}
					list.push(item);
				}
			}
			else{
				var item = {
					'id':0,
					'content':$scope.searchInput
				}
				list = [item];
			}
			locals.setObject("searchList",list);
		}
	}

	$scope.hideCity = true;
	$rootScope.hideBlackCover = true;
	$scope.hideSort = true;
	$rootScope.hideBodyOverflow = '';

	$scope.toggleCity = function(){
		if ($scope.hideCity == $scope.hideBlackCover) {
			if($scope.hideBlackCover){
				$scope.hideCity = false;
				$rootScope.hideBlackCover = false;
				//$scope.hideBodyOverflow = 'disable-overflow';
			}
			else{
				$scope.hideCity = true;
				$rootScope.hideBlackCover = true;
				//$scope.hideBodyOverflow = '';
			}
		}
	}
	$scope.toggleSort = function(){
		if ($scope.hideSort == $scope.hideBlackCover) {
			if($scope.hideBlackCover){
				$scope.hideSort = false;
				$rootScope.hideBlackCover = false;
				//$scope.hideBodyOverflow = 'disable-overflow';
			}
			else{
				$scope.hideSort = true;
				$rootScope.hideBlackCover = true;
				//$scope.hideBodyOverflow = '';
			}
		}
	}
	$scope.closeCityOrSort = function(){
		if($scope.hideCity == $scope.hideBlackCover){
			$scope.hideCity = true;
			$rootScope.hideBlackCover = true;
			//$scope.hideBodyOverflow = '';
		}
		else if ($scope.hideBlackCover == $scope.hideSort) {
			$scope.hideSort = true;
			$rootScope.hideBlackCover = true;
			//$scope.hideBodyOverflow = '';
		}
	}
	$rootScope.$watch('hideBlackCover',function(){
		if ($rootScope.hideBlackCover) {
			$rootScope.hideBodyOverflow = '';
		}
		else{
			$rootScope.hideBodyOverflow = 'disable-overflow';
		}
	})
	$scope.pushBookingForm = function(){
		$scope.$broadcast ('pushBookingForm');
	}
	$scope.pushClientInformation = function(){
		$scope.$broadcast ('pushClientInformation');
		$rootScope.disableAllButton = true;
	}
	$scope.pushClientInformationEdit = function(){
		$scope.$broadcast ('pushClientInformationEdit');
	}
	$scope.pushPersonalInformation = function(){
		$scope.$broadcast ('pushPersonalInformation');
	}

	$scope.$on('setTM',function(e,data){
		$scope.menus = data;
	})

	// $scope.goTo = function(id){
	// 	if(id){
	// 		$location.path('/product_list/'+id);
	// 		//$scope.toggleSort();
	// 		$timeout(function(){
	// 			$scope.showSubMenu = 10000;
	// 			console.log($scope.showSubMenu);
	// 			console.log('timeout');
	// 		},1000);
	// 	}
	// }

	// $scope.controlSubMenu = function(id){
	// 	$scope.showSubMenu = id;
	// }
});

interactiveControllers.controller('LoginCtrl', function(OpenAlertBox,$timeout,SaveToken,$scope,LogService,FetchData,AuthenticationService,$location,$rootScope) {
	$rootScope.loadingData = false;
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'登录'
	}

	$scope.sendSms = '发送验证码';
	$scope.disableButton = false;
	$scope.activeButton = '';

	$scope.startTimeOut = function(){
		$scope.counter = 60;
		$scope.sendSms = '重发 '+$scope.counter;
		$scope.disableButton = true;
		$scope.activeButton = 'active-button';
		$scope.onTimeout = function(){
		    $scope.counter--;
		    mytimeout = $timeout($scope.onTimeout,1000);
			$scope.sendSms = '重发 '+$scope.counter;
		    if($scope.counter == 1){
		    	$scope.stop();
		    }
		}
		var mytimeout = $timeout($scope.onTimeout,1000);

		$scope.stop = function(){
			$scope.sendSms = '发送验证码';
			$scope.disableButton = false;
			$scope.activeButton = '';
		    $timeout.cancel(mytimeout);
		}
	}

	$scope.getSms = function(){
		if($scope.phoneNumber){
			$scope.startTimeOut();
			var data = 'mobile='+$scope.phoneNumber;
			LogService.sms(data).then(function(data){
				if(data.data.success){
				}
				else{
					OpenAlertBox.openAlert('必须输入有效的号码');
				}
			})
		}
		else{
			//alert('请输入电话号码');
			OpenAlertBox.openAlert('请输入电话号码');
		}
	}

	$scope.login = function(){
		if(typeof $scope.phoneNumber == 'undefined'){
			OpenAlertBox.openAlert('请输入电话号码');
		}
		else if(typeof $scope.password == 'undefined'){
			OpenAlertBox.openAlert('请输入验证码');
		}
		else{
			var user = $scope.phoneNumber;
			var code = $scope.password;
			LogService.login(user,code).then(function(data){
				SaveToken(data.data);
				$location.path($rootScope.nextUrl||'/us').replace();
			})
		}
	}

	$scope.$emit('changeTM',change);
});

interactiveControllers.controller('NewUserCtrl', function($scope,$rootScope) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',false);
	$scope.$emit('hideBM',false);
});

interactiveControllers.controller('HomeCtrl', function(listData,$scope,$rootScope,$location) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',true);
	$scope.$emit('setBottomMenuImage','home');
	var change = {
		type:1
	}
	$scope.$emit('changeTM',change);

	$scope.myInterval = 6000;
	$scope.slides = [
	{
		id:0,
		image: 'imgs/home/1.jpg',
		text:'test',
		url:''
	},
	{
		id:1,
		image: 'imgs/home/2.jpg',
		text:'test',
		url:'#/product/25'
	}
	];

	$scope.dataList = listData.data.productions;
	$rootScope.loadingData = false;

	$scope.goLeft = function(){
		$location.path('/community');
	}
});

interactiveControllers.controller('MenuCtrl', function(menuData,$scope,$rootScope) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	$scope.$emit('setBottomMenuImage','home');
	var change = {
		type:12
	}
	$scope.$emit('changeTM',change);
	$scope.menus = menuData.data.categories;

	console.log(menuData.data.categories);

	$scope.changeSubMenu = function(subMenus,title,id){
		$scope.menuTitle = title;
		$scope.secondMenus = subMenus;
		$scope.menuID = id;
	}

	for(var menu in menuData.data.categories){
		$scope.changeSubMenu(menuData.data.categories[menu].children,menuData.data.categories[menu].name,0);
		break;
	}

	$rootScope.loadingData = false;
});

interactiveControllers.controller('MyDiscountCtrl', function($scope,$rootScope) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'我的折扣'
	}
	$scope.$emit('changeTM',change);

	$scope.$emit('setBottomMenuImage','home');
});

interactiveControllers.controller('BookingListCtrl', function(PushData,$scope,$rootScope,$filter,FetchData,AuthenticationService,bookingListData) {
	$scope.updateUnreadMessage = function(status){
		var url = "orders/has-read";
		var data = 'status='+status;
		var token = AuthenticationService.getAccessToken();

		PushData.push(url,data,token).then(function(data){
			if(data.data.message == 'success'){
				angular.forEach($filter('filter')($scope.bookingList,{'status':status,'has_read':0}),function(value,key){
					value.has_read = 1;
				})
				$scope.updateNumberUnreadMessage();
			}
		})
	}

	$scope.getUnreadMessage = function(status){
		var number = 0;
		angular.forEach($filter('filter')($scope.bookingList,{'status':status,'has_read':0}),function(){
			number++;
		})
		return number;
	}

	$scope.updateNumberUnreadMessage = function (){
		$scope.auditedUnreadMessage = $scope.getUnreadMessage('1');
		$scope.suditingUnreadMessage = $scope.getUnreadMessage('2');
		$scope.finishedUnreadMessage = $scope.getUnreadMessage('3');
		$scope.notPassUnreadMessage = $scope.getUnreadMessage('4');
	}

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',true);
	var change = {
		type:3,
		word:'我的订单'
	}
	$scope.$emit('changeTM',change);
	$scope.$emit('setBottomMenuImage','us');

	$scope.bookingList = [];

	$rootScope.loadingData = false;

	$scope.bookingList = bookingListData.data.orders;

	$scope.updateNumberUnreadMessage();
	$scope.updateUnreadMessage($rootScope.tabStatus);
});

interactiveControllers.controller('ClientListCtrl', function(clientListData,$scope,$rootScope,$filter,$anchorScroll,$location,FetchData,AuthenticationService,PushData) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:8,
		word:'我的客户'
	}
	$scope.$emit('changeTM',change);
	

	$scope.updateFirstCharList = function updateFirstCharList(list){
		if(list){
			$scope.firstCharList = [];
			//console.log(list);
			for(var i = 0; i<list.length; i++){
			    if ($scope.firstCharList.indexOf(list[i].initial) == -1) {
			        $scope.firstCharList.push(list[i].initial);
			    }
			}
			console.log($scope.firstCharList);
		}
	}
	$scope.goto = function(x){
        var newHash = x;
        if ($location.hash() !== newHash) {
			$location.hash(x).replace();
        }else {
          	$anchorScroll();
        }
	}
	$scope.goTo = function(url){
		$location.path(url);
	}

	$scope.clients = clientListData.data.customers;
	$scope.updateFirstCharList($filter('filter')($scope.clients,{'top':0}));
	$rootScope.loadingData = false;

	$scope.onHammer = function (e,client,direction) {
		e.preventDefault();
		$rootScope.hideBodyOverflow = 'disable-overflow';
		if(direction == 'top'){
			$scope.currentClient = client;
			$scope.top = 1;
		}
		else{
			$scope.currentClient = client;
			$scope.bottom = 1;
		}
	}

	$scope.pushTop = function(e){
		e.preventDefault();
		$rootScope.hideBodyOverflow = '';
		var url = 'customers/top';
		var data = 'id='+$scope.currentClient.id;
		var token = AuthenticationService.getAccessToken();
		PushData.push(url,data,token).then(function(data){
			if(data.data == 'success'){
				$scope.currentClient.top = 1;
				$scope.top = 0;
				$scope.updateFirstCharList($filter('filter')($scope.clients,{'top':0}));
			}
		})
	}

	$scope.pushBottom = function(e){
		e.preventDefault();
		$rootScope.hideBodyOverflow = '';
		var url = 'customers/top';
		var data = 'id='+$scope.currentClient.id;
		var token = AuthenticationService.getAccessToken();
		PushData.push(url,data,token).then(function(data){
			if(data.data == 'success'){
				$scope.currentClient.top = 0;
				$scope.bottom = 0;
				$scope.updateFirstCharList($filter('filter')($scope.clients,{'top':0}));
			}
		})
	}

	$scope.pullBack = function(e){
		e.preventDefault();
		$rootScope.hideBodyOverflow = '';
		$scope.top = 0;
		$scope.bottom = 0;
	}
});

interactiveControllers.controller('ClientImportCtrl', function($scope,$rootScope,mobileContacts){
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'通讯录导入'
	}
	$scope.$emit('changeTM',change);

	$scope.updateFirstCharList = function updateFirstCharList(list){
		if(list){
			$scope.firstCharList = [];
			//console.log(list);
			for(var i = 0; i<list.length; i++){
			    if ($scope.firstCharList.indexOf(list[i].initial) == -1) {
			        $scope.firstCharList.push(list[i].initial);
			    }
			}
		}
	}

	$scope.contactList = mobileContacts.data;
	$scope.updateFirstCharList($scope.contactList);

	$rootScope.loadingData = false;
});

interactiveControllers.controller('ClientAddCtrl', function(fieldsData,OpenAlertBox,FormDataService,$scope,$rootScope,PushData,$location,AuthenticationService,FetchData,$window) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:9,
		word:'添加客户'
	}
	$scope.$emit('changeTM',change);

	$scope.fields = fieldsData.data.fields;
	$rootScope.loadingData = false;

	$scope.$on('pushClientInformation',function(){
		var errorMsg = FormDataService.getAlertMsg($scope.fields);
		if(errorMsg){
			$rootScope.disableAllButton = false;
			OpenAlertBox.openAlert(errorMsg);
		}
		else{
			var url = "customers/create";
			var data = FormDataService.getValueData($scope.fields);
			var token = AuthenticationService.getAccessToken();
			PushData.push(url,data,token).then(function(data){
				if(data.data.message == 'success'){
					$window.history.back();
				}
				$rootScope.disableAllButton = false;
			})
		}
	})
});

interactiveControllers.controller('ClientAddImportCtrl', function(fieldsData,OpenAlertBox,FormDataService,$scope,$rootScope,PushData,$location,AuthenticationService,FetchData,$window,$route) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:9,
		word:'添加客户'
	}
	$scope.$emit('changeTM',change);

	$scope.fields = fieldsData.data.fields;
	$rootScope.loadingData = false;

	for(var i = 0;i<$scope.fields.length;i++){
		if($scope.fields[i].field == 'contact'){
			$scope.fields[i].value = $route.current.params.name;
		}
		else if($scope.fields[i].field == "phone_number"){
			$scope.fields[i].value = $route.current.params.number;
		}
	}

	$scope.$on('pushClientInformation',function(){
		var errorMsg = FormDataService.getAlertMsg($scope.fields);
		if(errorMsg){
			$rootScope.disableAllButton = false;
			OpenAlertBox.openAlert(errorMsg);
		}
		else{
			var url = "customers/create";
			var data = FormDataService.getValueData($scope.fields);
			var token = AuthenticationService.getAccessToken();
			PushData.push(url,data,token).then(function(data){
				if(data.data.message == 'success'){
					$window.history.back();
				}
				$rootScope.disableAllButton = false;
			})
		}
	})
});

interactiveControllers.controller('ClientChangeCtrl', function(clientData,OpenAlertBox,FormDataService,$window,$location,$scope,$rootScope,FetchData,AuthenticationService,$route,PushData) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:10,
		word:'修改客户信息'
	}
	$scope.$emit('changeTM',change);

	$scope.fields = clientData.data.fields;
	$rootScope.loadingData = false;

	$scope.$on('pushClientInformationEdit',function(){
		var errorMsg = FormDataService.getAlertMsg($scope.fields);
		if(errorMsg){
			//alert(errorMsg);
			OpenAlertBox.openAlert(errorMsg);
		}
		else{
			var id = $route.current.params.id;
			var url = "customers/edit?id="+id;
			var data = FormDataService.getValueData($scope.fields);
			var token = AuthenticationService.getAccessToken();
			PushData.push(url,data,token).then(function(data){
				if(data.data.message == 'success'){
					$window.history.back();
				}
			})
		}
	})
});

interactiveControllers.controller('ClientHistoryCtrl', function(historyData,$scope,$rootScope,FetchData,AuthenticationService,$route) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'成交记录'
	}
	$scope.$emit('changeTM',change);

	$scope.orders = historyData.data.orders;
	$rootScope.loadingData = false;
});

interactiveControllers.controller('ClientDetailCtrl', function(clientData,OpenAlertBox,$scope,$rootScope,AuthenticationService,FetchData,$route,$location,$window) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'客户详情'
	}
	$scope.$emit('changeTM',change);


	$rootScope.loadingData = false;
	$scope.client = clientData.data.customer;

	$scope.goTo = function(url){
		$location.path(url).replace();
	}

	$scope.deletClient = function(){
		var id = $route.current.params.id;
		var token = AuthenticationService.getAccessToken();
		OpenAlertBox.openConfirm('确定删除此客户？').then(function(data){
			if(data == 'ok'){
		    	var deletUrl = 'customers/delete?id='+id;
		    	FetchData.getData(deletUrl,token).then(function(data){
		    		if(data.data.success){
		    			$window.history.back();
		    		}
		    	})
			}
		});
	}
});

interactiveControllers.controller('BookingDetailCtrl', function($scope,$rootScope,$route,bookingDetailData) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'订单详情'
	}
	$scope.$emit('changeTM',change);

	$scope.fields = bookingDetailData.data.fields;
	$scope.orderInfo = bookingDetailData.data.order;
	$scope.bookingStatus = $route.current.params.type;
	$rootScope.loadingData = false;
});

interactiveControllers.controller('QRPaymentCtrl', function($scope,$rootScope) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'二维码支付'
	}
	$scope.$emit('changeTM',change);
});

interactiveControllers.controller('OfflinePaymentCtrl', function(paymentData,OpenAlertBox,$window,$scope,$rootScope,$http,Upload, $timeout,PublicURL,AuthenticationService,$route,FetchData,PushData) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'线下支付'
	}
	$scope.$emit('changeTM',change);

	$rootScope.loadingData = false;
	$scope.imageUrl = paymentData.data.order.instrument;
	$scope.imageID = paymentData.data.order.payment_instrument_id;

    $scope.uploadFiles = function(file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
	    	var token = AuthenticationService.getAccessToken();
	    	PushData.uploadImage(file,token).then(function(data){
	    		file.result = data.data;
	            $scope.imageUrl = data.data.url;
	            $scope.imageID = data.data.id;
	    	})
        }   
    }

    $scope.submit = function(){
    	var id = $route.current.params.id
    	var url = 'orders/instrument?id='+id+'&instrument='+$scope.imageID;
    	var token = AuthenticationService.getAccessToken();
    	FetchData.getData(url,token).then(function(data){
			OpenAlertBox.openAlert('成功');
			$window.history.back();
    	})
    }
});

interactiveControllers.controller('DiscountCtrl', function($scope,$rootScope) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);

	var change = {
		type:3,
		word:'抢购'
	}
	$scope.$emit('changeTM',change);
});

interactiveControllers.controller('DiscountDetailCtrl', function($scope,$rootScope) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);

	var change = {
		type:3,
		word:'详情'
	}
	$scope.$emit('changeTM',change);
	$scope.$emit('setBottomMenuImage','home');
});

interactiveControllers.controller('ProductDetailCtrl', function(productDetail,$scope,$route,FetchData,$sce,$rootScope,$location,AuthenticationService,ProductContImageReplace) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'详情'
	}
	$scope.$emit('changeTM',change);
	$scope.$emit('setBottomMenuImage','home');

	$scope.images = [];
	$scope.product = productDetail.data.production;
	if($scope.product.cont){
		$scope.thisCanBeusedInsideNgBindHtml = $sce.trustAsHtml($scope.product.cont.replace(/src=["]/g,'src="'+ProductContImageReplace));	
	}
	for(var i = 0;i<$scope.product.imagesUrl.length;i++){
		$scope.images[i] = {
			id:i,
			url:$scope.product.imagesUrl[i]
		}
	}

	$rootScope.loadingData = false;
});

interactiveControllers.controller('ProductBuyDetailCtrl', function(productBuyDetailData,OpenAlertBox,FormDataService,$scope,$rootScope,FetchData,AuthenticationService,PushData,$location,$routeParams,NewOrder) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);

	var change = {
		type:7,
		word:'产品订单'
	}
	$scope.$emit('changeTM',change);

	$scope.productoinAll = productBuyDetailData;

	$scope.production = $scope.productoinAll.data.production;
	$scope.customer_id = $scope.productoinAll.data.fields.customer_id;
	$scope.productFields = $scope.productoinAll.data.fields;

	$rootScope.loadingData = false;
	
	$scope.disableButton = false;
	$scope.$on('pushBookingForm',function(){
		if(!$scope.disableButton){
			$scope.disableButton = true;
			var url = 'orders/create?id='+$routeParams.id;
			var formData = '';
			var alertMsg = FormDataService.getAlertMsg($scope.productFields);
			if(alertMsg){
				//alert(alertMsg);
				OpenAlertBox.openAlert(alertMsg);
				$scope.disableButton = false;
			}
			else{
				formData = FormDataService.getValueData($scope.productFields);
				formData = formData+'&customer_id='+$scope.customer_id;
				PushData.push(url,formData,AuthenticationService.getAccessToken()).then(function(data){
					$location.path('/us');
				})
			}
		}
	})

	$scope.saveData = function(){
		NewOrder.saveOrderData($scope.productoinAll);
		$location.path('/insert_user');
	}
});

interactiveControllers.controller('InsertUserCtrl', function(userListData,$window,$scope,$rootScope,FetchData,AuthenticationService,$filter,NewOrder) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);

	var change = {
		type:3,
		word:'选择客户'
	}
	$scope.$emit('changeTM',change);

	$scope.updateFirstCharList = function updateFirstCharList(list){
		if(list){
			$scope.firstCharList = [];
			for(var i = 0; i<list.length; i++){
			    if ($scope.firstCharList.indexOf(list[i].initial) == -1) {
			        $scope.firstCharList.push(list[i].initial);
			    }
			}
		}
	}

	$scope.getUserInfo = function(id){
		var url = 'customers/view?id='+id;
		var token = AuthenticationService.getAccessToken();
		FetchData.getData(url,token).then(function(data){
			var necessaryUserData = NewOrder.getOrderData().data.fields;
			for(var i = 0;i<necessaryUserData.length;i++){
				if(necessaryUserData[i].section == "part_a"){
					var field = necessaryUserData[i].field;
					necessaryUserData[i].value = data.data.customer[field];
				}
			}
			console.log(necessaryUserData);
			necessaryUserData.customer_id = data.data.customer.id;
			var allData = NewOrder.getOrderData();
			console.log(allData);
			allData.data.fields = necessaryUserData;
			NewOrder.saveOrderData(allData);
			$window.history.back();
		})
	}

	$scope.clients = [];

	$scope.clients = userListData.data.customers;
	$scope.updateFirstCharList($scope.clients);
	$rootScope.loadingData = false;
});

interactiveControllers.controller('CommunityCtrl', function(communityList,$scope,$rootScope,$location) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',true);
	var change = {
		type:2,
		buttonType:1
	}
	$scope.$emit('changeTM',change);

	$scope.$emit('setBottomMenuImage','community');
	$scope.articles = communityList.data.articles.data;
	$rootScope.loadingData = false;

	$scope.goLeft = function(){
		$location.path('/us');
	}
	$scope.goRight = function(){
		$location.path('/home');
	}
});

interactiveControllers.controller('CommunityDetailCtrl', function(communityDetail,$route,$scope,$rootScope,$sce,ProductContImageReplace) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'文章详情'
	}
	$scope.$emit('changeTM',change);

	$scope.inputAreaStatus = false;
	$scope.openInputArea = function(){
		$scope.inputAreaStatus = true;
	}
	$scope.closeInputArea = function(){
		$scope.inputAreaStatus = false;
	}

	$scope.article = communityDetail.data.article;
	$rootScope.loadingData = false;
	$scope.thisCanBeusedInsideNgBindHtml = $sce.trustAsHtml(communityDetail.data.article.content.replace(/src=["]/g,'src="'+ProductContImageReplace));
});

interactiveControllers.controller('TeachCtrl', function($scope,$rootScope,$location) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',true);
	var change = {
		type:2,
		buttonType:2
	}
	$scope.$emit('changeTM',change);

	$scope.$emit('setBottomMenuImage','community');

	$scope.goLeft = function(){
		$location.path('/us');
	}
	$scope.goRight = function(){
		$location.path('/home');
	}
});

interactiveControllers.controller('SearchCtrl', function($scope,locals,$rootScope) {
	$rootScope.loadingData = false;

	$scope.hideUl = true;
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:5
	}
	$scope.$emit('changeTM',change);
	if(locals.getObject("searchList","").length>0){
		$scope.searchList = locals.getObject("searchList","").reverse();
	}
	$scope.cleanSearchList = function(){
		$scope.hideUl = false;
		locals.setObject("searchList","");
	}
});

interactiveControllers.controller('SearchListCtrl', function(productList,$location,$scope,$rootScope) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:6
	}
	$scope.$emit('changeTM',change);

	$scope.dataList = productList.data.productions;
	$rootScope.loadingData = false;
});

interactiveControllers.controller('ExampleCtrl', function(exampleData,$scope,$rootScope) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);

	var change = {
		type:3,
		word:'成交记录'
	}
	$scope.$emit('changeTM',change);

	$scope.examples = exampleData.data.orders;
	$rootScope.loadingData = false;
});

interactiveControllers.controller('ExampleDetailCtrl', function($scope,$rootScope) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);

	var change = {
		type:3,
		word:'成交详情'
	}
	$scope.$emit('changeTM',change);
});

interactiveControllers.controller('UsCtrl', function($scope,$rootScope,checkUserLogin,$location) {
	$scope.$emit('hideTM',false);
	$scope.$emit('hideBM',true);

	$scope.$emit('setBottomMenuImage','us');

	$scope.user = checkUserLogin.data.user;
	$rootScope.loadingData = false;

	$scope.goRight = function(){
		$location.path('/community');
	}
});

interactiveControllers.controller('PersonalDetailCtrl', function(OpenAlertBox,$scope,$rootScope,$http,Upload,PublicURL,AuthenticationService,personalData,PushData,$location) {
	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:11,
		word:'个人信息'
	}
	$scope.$emit('changeTM',change);
	$scope.$emit('setBottomMenuImage','us');

	$scope.user = {};
	$scope.user.image = '';

    $scope.uploadFiles = function(file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
        	var token = AuthenticationService.getAccessToken();
        	PushData.uploadImage(file,token).then(function(data){
		        file.result = data.data;
		        $scope.user.avatarUrl = data.data.url;
		        $scope.user.avatarId = data.data.id;
        	})
        }   
    }

    $rootScope.loadingData = false;
    $scope.user = personalData.data.user;
    $scope.user.avatarId = personalData.data.user.avatar_id;

    $scope.$on('pushPersonalInformation',function(){
    	if(!$scope.user.username){
    		OpenAlertBox.openAlert('请输入姓名');
    	}
    	else if(!$scope.user.card_id){
    		OpenAlertBox.openAlert('请输入身份证号');
    	}
    	else{    	
    		var url = 'user/edit';
    		var token = AuthenticationService.getAccessToken();
    		var data = 'avatar='+$scope.user.avatarId+'&username='+$scope.user.username+'&card_id='+$scope.user.card_id;
    		PushData.push(url,data,token).then(function(data){
    			if(data.data.message == 'success'){
					OpenAlertBox.openAlert('修改成功！').then(function(data){
						$location.path('/us');
					});
    			}
    			else{
    				OpenAlertBox.openAlert('好像有什么问题。。。');
    			}
    		})
    	}
    })
});

interactiveControllers.controller('AddAliPayCtrl', function($scope,$rootScope) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'支付宝'
	}
	$scope.$emit('changeTM',change);
});

interactiveControllers.controller('WithdrawCtrl', function($scope,$rootScope) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'提现'
	}
	$scope.$emit('changeTM',change);
	$scope.$emit('setBottomMenuImage','us');
});

interactiveControllers.controller('WithdrawCompleteCtrl', function($scope,$rootScope) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'提现完成'
	}
	$scope.$emit('changeTM',change);
	$scope.$emit('setBottomMenuImage','us');
});

interactiveControllers.controller('SettingsCtrl', function(OpenAlertBox,$scope,$rootScope,AuthenticationService) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'设置'
	}
	$scope.$emit('changeTM',change);
	$scope.$emit('setBottomMenuImage','us');

	$scope.logOut = function(){
		AuthenticationService.logOut();
	}

	cordova.getAppVersion.getVersionNumber(function (version) {
	    $scope.appVersion = version;
	});
});

interactiveControllers.controller('TestListCtrl', function($scope,$rootScope) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'商品考试'
	}
	$scope.$emit('changeTM',change);

	$scope.$watch("showFileter", function(newValue, oldValue) {
		if ($scope.showFileter) {
			$rootScope.hideBodyOverflow = '';
		}
		else{
			$rootScope.hideBodyOverflow = 'disable-overflow';
		}
	});
});

interactiveControllers.controller('TestDetailCtrl', function($scope,$rootScope) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',true);
	$scope.$emit('hideBM',false);
	var change = {
		type:3,
		word:'考试'
	}
	$scope.$emit('changeTM',change);
});

interactiveControllers.controller('DisconnectCtrl', function($scope,$rootScope) {
	$rootScope.loadingData = false;

	$scope.$emit('hideTM',false);
	$scope.$emit('hideBM',false);
});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.
interactiveControllers.controller('ModalInstanceCtrl', function ($uibModalInstance,item) {
  var $ctrl = this;
  $ctrl.msg = item;
  $ctrl.ok = function () {
    $uibModalInstance.close();
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});