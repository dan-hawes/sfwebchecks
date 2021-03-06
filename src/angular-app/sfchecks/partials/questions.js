'use strict';

angular.module(
		'sfchecks.questions',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'sgw.ui.breadcrumb', 'palaso.ui.notice', 'angularFileUpload', 'ngSanitize' ]
	)
	.controller('QuestionsCtrl', ['$scope', 'questionsService', 'questionTemplateService', '$routeParams', 'sessionService', 'linkService', 'breadcrumbService', 'silNoticeService',
	                              function($scope, questionsService, qts, $routeParams, ss, linkService, breadcrumbService, notice) {
		var projectId = $routeParams.projectId;
		var textId = $routeParams.textId;
		$scope.projectId = projectId;
		$scope.textId = textId;
		
		// Rights
		$scope.rights = {};
		$scope.rights.deleteOther = false; 
		$scope.rights.create = false; 
		$scope.rights.createTemplate = false; 
		$scope.rights.editOther = false; //ss.hasRight(ss.realm.SITE(), ss.domain.PROJECTS, ss.operation.EDIT_OTHER);
		$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.createTemplate || $scope.rights.editOther;
		
		// Breadcrumb
		breadcrumbService.set('top',
				[
				 {href: '/app/sfchecks#/projects', label: 'My Projects'},
				 {href: '/app/sfchecks#/project/' + $routeParams.projectId, label: ''},
				 {href: '/app/sfchecks#/project/' + $routeParams.projectId + '/' + $routeParams.textId, label: ''},
				]
		);

		// Question templates
		$scope.emptyTemplate = {
			title: '(Select a template)',
			description: undefined
		};
		$scope.templates = [$scope.emptyTemplate];
		$scope.queryTemplates = function() {
			qts.list(function(result) {
				if (result.ok) {
					$scope.templates = result.data.entries;
					// Add "(Select a template)" as default value
					$scope.templates.unshift($scope.emptyTemplate);
					if (angular.isUndefined($scope.template)) {
						$scope.template = $scope.emptyTemplate;
					}
				}
			});
		};
		$scope.queryTemplates();

		$scope.$watch('template', function(template) {
			if (template && !angular.isUndefined(template.description)) {
				$scope.questionTitle = template.title;
				$scope.questionDescription = template.description;
			}
		});

		// Listview Selection
		$scope.newQuestionCollapsed = true;
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
		$scope.questions = [];
		$scope.queryQuestions = function() {
			//console.log("queryQuestions()");
			questionsService.list(projectId, textId, function(result) {
				if (result.ok) {
					$scope.questions = result.data.entries;
					$scope.questionsCount = result.data.count;

					$scope.enhanceDto($scope.questions);
					$scope.text = result.data.text;
					$scope.project = result.data.project;
					$scope.text.url = linkService.text(projectId, textId);
					//console.log($scope.project.name);
					//console.log($scope.text.title);
					breadcrumbService.updateCrumb('top', 1, {label: $scope.project.name});
					breadcrumbService.updateCrumb('top', 2, {label: $scope.text.title});

					var rights = result.data.rights;
					$scope.rights.deleteOther = ss.hasRight(rights, ss.domain.QUESTIONS, ss.operation.DELETE_OTHER); 
					$scope.rights.create = ss.hasRight(rights, ss.domain.QUESTIONS, ss.operation.CREATE); 
					$scope.rights.createTemplate = ss.hasRight(rights, ss.domain.TEMPLATES, ss.operation.CREATE); 
					$scope.rights.editOther = ss.hasRight(rights, ss.domain.TEXTS, ss.operation.EDIT_OTHER);
					$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.createTemplate || $scope.rights.editOther;
				}
			});
		};
		// Remove
		$scope.removeQuestions = function() {
			//console.log("removeQuestions()");
			var questionIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				questionIds.push($scope.selected[i].id);
			}
			if (window.confirm("Are you sure you want to delete these " + questionIds.length + " question(s)?")) {
				questionsService.remove(projectId, questionIds, function(result) {
					if (result.ok) {
						$scope.selected = []; // Reset the selection
						$scope.queryQuestions();
						if (questionIds.length == 1) {
							notice.push(notice.SUCCESS, "The question was removed successfully");
						} else {
							notice.push(notice.SUCCESS, "The questions were removed successfully");
						}
					}
				});
			}
		};
		// Add question
		$scope.addQuestion = function() {
			//console.log("addQuestion()");
			var model = {};
			model.id = '';
			model.textRef = textId;
			model.title = $scope.questionTitle;
			model.description = $scope.questionDescription;
			questionsService.update(projectId, model, function(result) {
				if (result.ok) {
					$scope.queryQuestions();
					notice.push(notice.SUCCESS, "'" + $scope.calculateTitle(model.title, model.description) + "' was added successfully");
					if ($scope.saveAsTemplate) {
						qts.update(model, function(result) {
							if (result.ok) {
								notice.push(notice.SUCCESS, "'" + model.title + "' was added as a template question");
							}
						});
					}
					$scope.questionTitle = "";
					$scope.questionDescription = "";
					$scope.saveAsTemplate = false;
					$scope.newQuestionCollapsed = true;
				}
				$scope.queryTemplates();
			});
		};
		
		$scope.calculateTitle = function(title, description) {
			var questionTitleCalculated;
			if (!title || title == '') {
				var spaceIndex = description.indexOf(' ', 50);
				var shortTitle;
				if (spaceIndex > -1) {
					shortTitle = description.slice(0, spaceIndex) + '...';
				} else {
					shortTitle = description;
				}
				questionTitleCalculated = shortTitle;
			} else {
				questionTitleCalculated = title;
			}
			return questionTitleCalculated;
		};
		
		$scope.makeQuestionIntoTemplate = function() {
			// Expects one, and only one, question to be selected (checked)
			var l = $scope.selected.length;
			if (l != 1) {
				return;
			}
			var model = {};
			model.id = '';
			model.title = $scope.selected[0].title;
			model.description = $scope.selected[0].description;
			qts.update(model, function(result) {
				if (result.ok) {
					$scope.queryTemplates();
					notice.push(notice.SUCCESS, "'" + model.title + "' was added as a template question");
					$scope.selected = [];
				}
			});
		};

		$scope.getAnswerCount = function(question) {
			return question.answerCount;
		};

		$scope.getResponses = function(question) {
			return question.responseCount;
		};
		
		$scope.enhanceDto = function(items) {
			for (var i in items) {
				items[i].url = linkService.question(projectId, textId, items[i].id);
				items[i].calculatedTitle = $scope.calculateTitle(items[i].title, items[i].description);
			}
		};

	}])
	.controller('QuestionsSettingsCtrl', ['$scope', '$http', 'textService', 'sessionService', '$routeParams', 'breadcrumbService', 'silNoticeService', 
	                                      function($scope, $http, textService, ss, $routeParams, breadcrumbService, notice) {
		var projectId = $routeParams.projectId;
		var textId = $routeParams.textId;
		var dto;
		$scope.projectId = projectId;
		$scope.textId = textId;
		$scope.editedText = {
			id: textId,
		};

		// Breadcrumb
		breadcrumbService.set('top',
				[
				 {href: '/app/sfchecks#/projects', label: 'My Projects'},
				 {href: '/app/sfchecks#/project/' + $routeParams.projectId, label: ''},
				 {href: '/app/sfchecks#/project/' + $routeParams.projectId + '/' + $routeParams.textId, label: ''},
				 {href: '/app/sfchecks#/project/' + $routeParams.projectId + '/' + $routeParams.textId + '/Settings', label: 'Settings'},
				]
		);

		// Get name from text service. This really should be in the DTO, but this will work for now.
		// TODO: Move this to the DTO (or BreadcrumbHelper?) so we don't have to do a second server round-trip. RM 2013-08
		var text;
		textService.settings_dto($scope.projectId, $scope.textId, function(result) {
			if (result.ok) {
				$scope.dto = result.data;
				$scope.textTitle = $scope.dto.text.title;
				$scope.editedText.title = $scope.dto.text.title;
				$scope.rights = {
					editOther: ss.hasRight($scope.dto.rights, ss.domain.TEXTS, ss.operation.EDIT_OTHER),
				};
				console.log($scope.dto);
				breadcrumbService.updateCrumb('top', 1, {label: $scope.dto.bcs.project.crumb});
				breadcrumbService.updateCrumb('top', 2, {label: $scope.dto.text.title});
			}
		});

		$scope.updateText = function(newText) {
			if (!newText.content) {
				delete newText.content;
			}
			newText.startCh = $scope.startCh;
			newText.startVs = $scope.startVs;
			newText.endCh = $scope.endCh;
			newText.endVs = $scope.endVs;
			textService.update($scope.projectId, newText, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, newText.title + " settings successfully updated");
					$scope.textTitle = newText.title;
				}
			});
		};

		$scope.onUsxFile = function($files) {
			if (!$files || $files.length == 0) {
				return;
			}
			var file = $files[0];  // Use only first file
			var reader = new FileReader();
			reader.addEventListener("loadend", function() {
				// Basic sanity check: make sure what was uploaded is USX
				// First few characters should be optional BOM, optional <?xml ..., then <usx ...
				var startOfText = reader.result.slice(0,1000);
				var usxIndex = startOfText.indexOf('<usx');
				if (usxIndex != -1) {
					$scope.$apply(function() {
						$scope.editedText.content = reader.result;
					});
				} else {
					notice.push(notice.ERROR, "Error loading USX file. The file doesn't appear to be valid USX.");
					$scope.$apply(function() {
						$scope.editedText.content = '';
					});
				}
			});
			reader.readAsText(file);
		};

		$scope.progress = 0;
		$scope.uploadResult = '';
		$scope.onFileSelect = function($files) {
			var file = $files[0];	// take the first file only
			$scope.file = file;
			if (file['size'] <= ss.fileSizeMax()) {
				$http.uploadFile({
				    url: '/upload',	// upload.php script
//					headers: {'myHeaderKey': 'myHeaderVal'},
					data: {
						projectId: projectId,
						textId: textId,
					},
					file: file
				}).progress(function(evt) {
					$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
					if (!$scope.$$phase) {
						$scope.$apply();
					}
				}).success(function(data, status, headers, config) {
					$scope.uploadResult = data.toString();
					$scope.progress = 100.0;
					// to fix IE not updating the dom
					if (!$scope.$$phase) {
						$scope.$apply();
					}
				});
			} else {
				$scope.uploadResult = file['name'] + " is too large.";
			}
		};
		  

	}])
	;
