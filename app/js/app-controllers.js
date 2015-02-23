'use strict';

// Declare app level module which depends on views, and components
angular.module('app-controllers', [
    'ngMaterial',
    'ngMessages',
    'ngTouch',
    'ui.grid',
    'ui.grid.cellNav',
    'ui.grid.edit',
    'ui.grid.resizeColumns',
    'ui.grid.pinning',
    'ui.grid.selection',
    'ui.grid.moveColumns'
]).
controller('AppController', ['$log', '$mdSidenav', '$mdBottomSheet', '$location', function($log, $mdSidenav, $mdBottomSheet, $location) {

    this.goTo = function(menuItem) {
        this.currentMenu = menuItem;
        $location.path(menuItem.path);
    };

    this.addMenuItem = function() {
        var settingsIndex = this.menuItems.length - 1;
        var settingMenuItem = this.menuItems.splice(settingsIndex, 1);
        this.menuItems.push({
            label: "MenuItem" + (this.menuItems.length + 1),
            path: "/menuItem" + (this.menuItems.length + 1),
            icon: "glyphicon-triangle-right"
        });
        this.menuItems.push({
            label: "Settings",
            path: "/settings",
            icon: "glyphicon-cog"
        });
    };

    this.removeMenuItem = function(index) {
        this.menuItems.splice(index, 1);
    };

    this.resetToDefault = function() {
        this.title = "testWebApp";
        this.logoName = "Test Product";
        this.menuLabel = "Menu";
        this.menuItems = [{
            label: "MenuItem1",
            path: "/menuItem1",
            icon: "glyphicon-option-horizontal"
        }, {
            label: "MenuItem2",
            path: "/menuItem2",
            icon: "glyphicon-option-horizontal"
        }, {
            label: "MenuItem3",
            path: "/menuItem3",
            icon: "glyphicon-option-horizontal"
        }, {
            label: "Grid-Test",
            path: "/ui-grid-test",
            icon: "glyphicon-list-alt"
        }, {
            label: "Settings",
            path: "/settings",
            icon: "glyphicon-cog"
        }];
    };

    this.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };

    this.toggleFooter = function() {
        $mdBottomSheet.show();
    };

    this.resetToDefault();

    this.currentMenu = this.menuItems[0];

}]).
controller('SettingsController', ['$log', function($log) {
    this.pageTitle = "Settings"
}]).
controller('GridController', ['$log', '$scope', function($log, $scope) {
	var that = this;

    this.gridOptions = {};

    this.gridOptions.enableColumnResizing = true;
    this.gridOptions.enableFiltering = true;
    this.gridOptions.enableGridMenu = true;
    // this.gridOptions.enableHorizontalScrollbar = false;
    // this.gridOptions.showGridFooter = true;
    // this.gridOptions.showColumnFooter = true;
    this.gridOptions.enableCellEditOnFocus = true;
    this.gridOptions.multiSelect = false;

    // this.gridOptions.rowIdentity = function(row) {
    //     return row.id;
    // };
    // this.gridOptions.getRowIdentity = function(row) {
    //     return row.id;
    // };

    this.gridOptions.data = [{
        "firstName": "Cox",
        "lastName": "Carney",
        "company": "Enormo",
        "employed": true
    }, {
        "firstName": "Lorraine",
        "lastName": "Wise",
        "company": "Comveyer",
        "employed": false
    }, {
        "firstName": "Nancy",
        "lastName": "Waters",
        "company": "Fuelton",
        "employed": false
    }];


	this.gridOptions.columnDefs = [
		{name: "firstName", cellClass: 'text-centred'},
		{name: "lastName"},
		{name: "company"},
		{name: "employed"}
	];

	this.gridOptions.onRegisterApi = function(gridApi) {
      //set gridApi on scope
      that.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged($scope,function(row){
        $log.log(angular.toJson(row.entity, true));
      });
    };



}]);
