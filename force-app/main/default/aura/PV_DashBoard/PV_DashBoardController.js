/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
({
  doInit: function(component, event, helper) {
    console.time('volvo');
    helper.showSpinner(component);
    const todayDate = new Date();
    let currentMonthFirstDate = (todayDate.getDate() - todayDate.getMonth(), 1);
    let currentMonthLastDate = new Date(todayDate.getFullYear(), todayDate.getMonth()+1, 0).getDate();
    currentMonthFirstDate = new Date(todayDate.setDate(currentMonthFirstDate)).toISOString().slice(0, 10);
    currentMonthLastDate = new Date(todayDate.setDate(currentMonthLastDate)).toISOString().slice(0, 10);

    component.set('v.cpddDateFrom', currentMonthFirstDate);
    component.set('v.cpddDateTo', currentMonthLastDate);

    component.set('v.regionId', null);
    component.set('v.salesTeamId', null);
    component.set('v.salesRepId', null);

    function loggedInUserInfo(response) {
      const userInfo = response.getReturnValue();
      component.set('v.userType', userInfo.userType);
      component.set('v.roleIdForRegionPicklistValues', userInfo.roleIdForRegionPicklistValues);

      if (userInfo.userType=='Admin') {
        helper.getRegionHelper(component);
      } else if (userInfo.userType=='Region') {
        component.set('v.regionId', userInfo.currentUserRoleId);// assigning current user parentroleid Id to get the region roles
        helper.onRegionSelection(component);
        helper.getRegionHelper(component, event);
      } else if (userInfo.userType=='SalesManager') {
        component.set('v.regionId', userInfo.parentRoleId);// assigning parentroleid to the regionid to get the salesmanagerroles
        component.set('v.salesTeamId', userInfo.currentUserRoleId);
        helper.onSalesteamSelection(component, event);
        helper.onRegionSelection(component);
      } else if (userInfo.userType=='SalesDepartment') {
        component.set('v.salesTeamId', userInfo.parentRoleId);// assigning parentroleid to the salesteamid to get the salesdepartment users
        component.set('v.salesRepId', userInfo.currentUserId);
        helper.onSalesteamSelection(component, event);
      }
      helper.searchForTruckData(component, true);
    }
    helper.actionUtility(component, {}, loggedInUserInfo, 'c.loggedInUserInfo');
  },
  filterResults: function(component, event, helper) {
    helper.searchForTruckData(component, false);
  },

  regionSelection: function(component, event, helper) {
    component.set('v.salesTeamId', null);
    component.set('v.salesRepId', null);
    helper.onRegionSelection(component, false);
  },

  salesteamSelection: function(component, event, helper) {
    component.set('v.salesRepId', null);
    helper.onSalesteamSelection(component, event);
  },
  useCDD: function(component, event, helper) {
    if (component.find('useCDDFlag').get('v.value')) {
      component.find('StartDateField_cpdd').set('v.value', '');
      component.find('EndDateField_cpdd').set('v.value', '');
      component.set('v.sortField', 'CDD__c');
      component.set('v.sortAsc', false);
      helper.sortBy(component, 'CDD__c');
    } else {
      component.find('StartDateField_cdd').set('v.value', '');
      component.find('EndDateField_cdd').set('v.value', '');
      component.set('v.sortField', 'CPDD__c');
      component.set('v.sortAsc', false);
      helper.sortBy(component, 'CPDD__c');
    }
  },
  openMapComponent: function(component) {
    component.set('v.openMap', true);
  },
  closeMapComponent: function(component) {
    component.set('v.openMap', false);
  },

  //* *Export to Excel method**//
  exportOrderDataToExcel: function(component, event, helper) {
    const searchParameters = helper.searchParameters(component, false);
    if (typeof(searchParameters)==='boolean') {
      return;
    }
    function exportToExcel(response) {
      if (response.getReturnValue()!=null) {
        const binaryString = window.atob(response.getReturnValue());
        const len = binaryString.length;
        const bytes = new Uint8Array( len );
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob=new Blob([bytes], {type: 'application/octet-stream'});
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'exportedData.csv';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(downloadUrl);
        helper.hideSpinner(component);
      }
    }
    helper.actionUtility(component, searchParameters, exportToExcel, 'c.exportToExcel');
  },
    /*Sorting of columns*/
  sortByColumn: function(component, event, helper) {
    helper.sortBy(component, event.currentTarget.dataset.value);
  },
})
;