/**
 * data service js
 * @authors harry
 * @date    2016-08-22 09:31:02
 * @version $Id$
 */

var DataService = angular.module('DataService',[]);

DataService.service('FormDataService', [function(){
	this.getAlertMsg = function(data){
		var msg = '';
		for (var i = 0; i < data.length; i++) {
			if(!data[i].value&&data[i].required=='1'){
				if(!msg){
					msg = '请输入 '+data[i].label+', ';
				}
				else{
					msg = msg+data[i].label+', ';
				}
			}
		}
		if(msg){
			msg = msg.substring(0,msg.length-2);
		}
		return msg;
	}
	this.getValueData = function(data){
		var dataValue = '';
		for (var i = data.length - 1; i >= 0; i--) {
			if(i == 0){
				dataValue = dataValue+data[i].prefix+data[i].field+'='+data[i].value;
			}
			else{
				dataValue = dataValue+data[i].prefix+data[i].field+'='+data[i].value+'&';
			}
		}
		return dataValue;
	}
}])
