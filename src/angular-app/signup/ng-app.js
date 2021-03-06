'use strict';

// Declare app level module which depends on filters, and services
angular.module('signup', [ 'sf.services', 'ui.bootstrap'])
.controller('UserCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', 
                         function UserCtrl($scope, userService, sessionService, notice) {

	$scope.record = {};
	$scope.record.id = '';
	$scope.userRegistered = false;
	$scope.captchaSrc = '';
	
	$scope.getCaptchaSrc = function() {
		sessionService.getCaptchaSrc(function(result) {
			if (result.ok) {
				$scope.captchaSrc = result.data;
				$scope.record.captcha = "";
			}
			
		});
	};
	
	
	
	
	$scope.createUser = function(record) {
		userService.register(record, function(result) {
			if (result.ok) {
				if (!result.data) {
					notice.push(notice.WARN, "The image verification failed.  Please try again");
					$scope.getCaptchaSrc();
				} else {
					notice.push(notice.SUCCESS, "Thank you for signing up.  We've sent you an email to confirm your registration. Please click the link in the email to activate your account.  If you don't see your activation email, check your email's SPAM folder.");
					$("#userForm").fadeOut();
				}
			}
		});
		return true;
	};
	$scope.checkUserName = function() {
		$scope.userNameOk = false;
		$scope.userNameExists = false;
		if ($scope.record.username) {
			$scope.userNameLoading = true;
			userService.userNameExists($scope.record.username, function(result) {
				$scope.userNameLoading = false;
				if (result.ok) {
					if (result.data) {
						$scope.userNameOk = false;
						$scope.userNameExists = true;
					} else {
						$scope.userNameOk = true;
						$scope.userNameExists = false;
					}
				}
			});
		}
	};
	
	$scope.getCaptchaSrc();
}])
;
