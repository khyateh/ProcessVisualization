/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
({
    //*for getting regionroles method*//
  onRegionSelection: function(component) {
    let selectedRegionId = component.get('v.regionId');
    if (!selectedRegionId) {
      selectedRegionId = null;
    };
    function getSalesManagers(response) {
      const result = response.getReturnValue();
      component.set('v.salesteamList', Object.values(result));
      if (!component.get('v.regionId')) {
        component.set('v.salesRepresentativeList', []);
      }
    }
    this.actionUtility(component, {'selectedRegionId': selectedRegionId}, getSalesManagers, 'c.getSalesManagers');
  }, // for getting salesrepresentative values method
  onSalesteamSelection: function(component) {
    let selectedSalesTeamId =component.get('v.salesTeamId');
    if (!selectedSalesTeamId) {
      selectedSalesTeamId = null;
    }
    component.set('v.salesTeamId', selectedSalesTeamId);
    function getSalesDepartment(response) {
      const result = response.getReturnValue();
      component.set('v.salesRepresentativeList', Object.values(result));
      if (!component.get('v.salesTeamId')) {
        component.set('v.salesRepresentativeList', []);
      }
    }
    this.actionUtility(component, {'roleId': selectedSalesTeamId}, getSalesDepartment, 'c.getSalesDepartment');
  },
  sortBy: function(component, fieldName) {
    component.set('v.sortField', fieldName);
    const data = component.get('v.orderList');
    const sortDirection = component.get('v.sortAsc');
    const key = function(a) {
      if (fieldName == 'End_Customer__c') {
        return JSON.stringify(a['orderObj'].End_Customer__c);
      }
      if (fieldName == 'CDD__c') {
        return JSON.stringify(a['orderObj'].CDD__c);
      }
      if (fieldName == 'CPDD__c') {
        return JSON.stringify(a['orderObj'].CPDD__c);
      }
      if (fieldName == 'Name') {
        return JSON.stringify(a['orderObj'].Name);
      }
    };
    const reverse = sortDirection? 1: -1;
    data.sort(function(a, b) {
      a = key(a) ? key(a).toLowerCase() : '';
      b = key(b) ? key(b).toLowerCase() : '';
      return reverse * ((a>b) - (b>a));
    });
    component.set('v.orderList', data);
    component.set('v.sortAsc', !sortDirection);
  }, // Show and hide of spinner
  showSpinner: function(component) {
    component.set('v.Spinner', true);
  },
  hideSpinner: function(component) {
    component.set('v.Spinner', false);
  }, // for getting region values method
  getRegionHelper: function(component) {
    function getRegions(response) {
      const regionDetails = response.getReturnValue();
      component.set('v.regionsList', regionDetails==null?[]:Object.values(regionDetails));
    }
    this.actionUtility(component, {'roleIdForRegionPicklistValues': component.get('v.roleIdForRegionPicklistValues')}, getRegions, 'c.getRegions');
  },
  searchParameters: function(component, onloadFlag) {
    if (component.find('useCDDFlag').get('v.value')&&(!component.find('StartDateField_cdd').get('v.value')||!component.find('EndDateField_cdd').get('v.value'))) {
     var sMsg = $A.get("$Label.c.PV_CDD_date_message");
        this.toastEventAlert(sMsg);
      return true;
    } else if (!component.find('useCDDFlag').get('v.value')&&(!component.find('StartDateField_cpdd').get('v.value')||!component.find('EndDateField_cpdd').get('v.value'))) {
        var sMsg = $A.get("$Label.c.PV_CPDD_date_message");
      this.toastEventAlert(sMsg);
      return true;
    }

    this.showSpinner(component);

    let dateFrom = component.get('v.cpddDateFrom');
    let dateTo = component.get('v.cpddDateTo');
    const useCDDFlag = component.find('useCDDFlag').get('v.value');

    if (useCDDFlag) {
      dateFrom = component.get('v.cddDateFrom');
      dateTo = component.get('v.cddDateTo');
    }

    let region;
    let salesTeam;
    let salesRep;

    if (onloadFlag) {
      region = component.get('v.regionId');
      salesTeam=component.get('v.salesTeamId'),
      salesRep=component.get('v.salesRepId');
    } else {
      salesRep=component.get('v.salesRepId');

      if (salesRep == null) {
        salesTeam=component.get('v.salesTeamId');
        if (salesTeam == null) {
        	region = component.get('v.regionId');
      	}
      }
    }
    const orderNumber = component.get('v.orderNumber');
    const customerName = component.get('v.customerName');
    return ({dateFrom, dateTo, useCDDFlag, region, salesTeam, salesRep, orderNumber, customerName});
  },

  //* *server call fro getting orders and activities list data**//
  searchForTruckData: function(component, onloadFlag) {
    const that = this;
    const searchParameters = this.searchParameters(component, onloadFlag);
    if (typeof(searchParameters)==='boolean') {
      return;
    }
    function truckActivityData(response) {
      var noTruckActivity=component.find('NoRecord');
      const wrapperData = response.getReturnValue();
      component.set('v.orderList', wrapperData.orderList);
      component.set('v.startHeaderDate', wrapperData.startHeaderDate);
      component.set('v.endHeaderDate', wrapperData.endHeaderDate);
      component.set('v.sortField', component.find('useCDDFlag').get('v.value')?'CDD__C':'CPDD__c');
      component.set('v.sortAsc', false);

      // calling static resource method
      _dateHeaderUtility(component);
      _orderDetails(component);
      that.sortBy(component, component.find('useCDDFlag').get('v.value')?'CDD__C':'CPDD__c');
      if (wrapperData.orderList.length) {
        // Need to alter the following line
        document.getElementsByTagName('THEAD')[0].setAttribute('style', 'display: revert');
        $A.util.addClass(noTruckActivity, 'slds-hide');
      } else {
        // Need to alter the following line
        document.getElementsByTagName('THEAD')[0].setAttribute('style', 'display: none');
        
        $A.util.addClass(noTruckActivity, 'slds-show');
        $A.util.removeClass(noTruckActivity, 'slds-hide');
      }
    }
    this.actionUtility(component, searchParameters, truckActivityData, 'c.truckActivityData');
  },
  toastEventAlert: function(ErrorMessage) {
    const toastEvent = $A.get('e.force:showToast');
    toastEvent.setParams({
      title: 'Error',
      mode: 'pester',
      duration: '4000',
      type: 'error',
      message: ErrorMessage,
    });
    toastEvent.fire();
  },
  actionUtility: function(component, setParams, callback, sfMethod) {
    // console.log(component, setParams, callback, sfMethod);
    const actionMethod = component.get(sfMethod);
    actionMethod.setParams(setParams);
    actionMethod.setCallback(this, function(response) {
      const state = response.getState();
      // Need to work on State blocks
      if (state === 'SUCCESS') {
        callback(response);
      } else if (state === 'INCOMPLETE') {
        alert('Response is Incompleted');
      } else if (state === 'ERROR') {
        const errors = response.getError();
        if (errors) {
          if (errors[0] && errors[0].message) {
            alert('Error message: ' + errors[0].message);
          }
        } else {
          alert('Unknown error');
        }
      }
    });
    $A.enqueueAction(actionMethod);
  },
})
;