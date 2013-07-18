'use strict';

angular.module(
		'sfchecks.project',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap' ]
	)
	.controller('ProjectCtrl', ['$scope', 'textService', '$routeParams', function($scope, textService, $routeParams) {
		var projectId = $routeParams.projectId;
		$scope.projectId = projectId;
		// Listview Selection
		$scope.selected = [];
		$scope.updateSelection = function(event, item) {
			var selectedIndex = $scope.selected.indexOf(item);
			var checkbox = event.target;
			if (checkbox.checked && selectedIndex == -1) {
				$scope.selected.push(item);
			} else if (!checkbox.checked && selectedIndex != -1) {
				$scope.selected.splice(selectedIndex, 1);
			}
		};
		$scope.isSelected = function(item) {
			return item != null && $scope.selected.indexOf(item) >= 0;
		};
		// Listview Data
		$scope.texts = [];
		$scope.queryTexts = function() {
			console.log("queryTexts()");
			textService.list(projectId, function(result) {
				if (result.ok) {
					$scope.texts = result.data.entries;
					$scope.textsCount = result.data.count;
				}
			});
		};
		// Remove
		$scope.removeTexts = function() {
			console.log("removeTexts()");
			var textIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				textIds.push($scope.selected[i].id);
			}
			if (l == 0) {
				// TODO ERROR
				return;
			}
			textService.remove(projectId, textIds, function(result) {
				if (result.ok) {
					$scope.selected = []; // Reset the selection
					$scope.queryTexts();
					// TODO
				}
			});
		};
		// Add
		$scope.addText = function() {
			console.log("addText()");
			var model = {};
			model.id = '';
			model.title = $scope.title;
			model.content = $scope.content;
			textService.update(projectId, model, function(result) {
				if (result.ok) {
					$scope.queryTexts();
				}
			});
		};
	}])
	;