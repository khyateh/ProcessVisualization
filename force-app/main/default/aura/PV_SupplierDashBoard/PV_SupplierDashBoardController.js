/* eslint-disable require-jsdoc */
/* eslint-disable max-len */


/* Doinit method*/
({
    doinit:function(component, event, helper) {
        helper.showSpinner(component);
        var showtable=component.find('showtable');
        var showtable=component.find('showtable');
        var NoRecord=component.find('NoRecord');
        $A.util.addClass(showtable, 'slds-hide');
        $A.util.removeClass(showtable, 'slds-show');
        $A.util.addClass(NoRecord, 'slds-show');
        $A.util.removeClass(NoRecord, 'slds-hide');
        var todayDate = new Date(); 
        var currentMonthFirstDate = (todayDate.getDate() - todayDate.getMonth(),1); 
        var currentMonthLastDate = new Date(todayDate.getFullYear(),todayDate.getMonth()+1,0).getDate();
        currentMonthFirstDate = new Date(todayDate.setDate(currentMonthFirstDate)).toISOString().slice(0,10);
        currentMonthLastDate = new Date(todayDate.setDate(currentMonthLastDate)).toISOString().slice(0,10);
        component.set("v.DateFrom",currentMonthFirstDate);
        component.set("v.DateTo",currentMonthLastDate);
        helper.hideSpinner(component);
        
    },
    
    /* Onclick of Fliterresults method*/
    Filterresults : function(component, event, helper) {
        var dateFrom = component.get('v.DateFrom');
        var dateTo = component.get('v.DateTo');
        var suppliername=component.get("v.selectedLookUpRecord");
        if(suppliername.Name!=null)
        {
            helper.showSpinner(component);
            document.getElementsByTagName("THEAD")[0].setAttribute("style", "display: revert");
            //*server call*//
            var action = component.get("c.OrderList");
            action.setParams({
                dateFrom,
                dateTo,
                'supplierName':suppliername.Id
            });
            action.setCallback(this, function(response) {
                var state = response.getState();
                console.log(state);
                if (state === "SUCCESS") {
                    helper.sortBy(component,'CPDD__c');
                    var wrapperData = response.getReturnValue();
                    //*hiding table when there is no data*//
                    if(wrapperData.orderList.length > 0){
                        var showtable=component.find('showtable');
                        var NoRecord=component.find('NoRecord');
                        $A.util.addClass(NoRecord, 'slds-hide');
                        $A.util.removeClass(NoRecord, 'slds-show');
                        $A.util.addClass(showtable, 'slds-show');
                        $A.util.removeClass(showtable, 'slds-hide');
                    }
                    else{
                        var showtable=component.find('showtable');
                        var NoRecord=component.find('NoRecord');
                        $A.util.addClass(showtable, 'slds-hide');
                        $A.util.removeClass(showtable, 'slds-show');
                        $A.util.addClass(NoRecord, 'slds-show');
                        $A.util.removeClass(NoRecord, 'slds-hide');
                    }
                    component.set("v.orderList", wrapperData.orderList); 
                    component.set("v.startHeaderDate",dateFrom);
                    component.set("v.endHeaderDate",dateTo);
                    
                    //calling static resource method 
                    _dateHeaderUtility(component);
                    _orderDetails(component);
                    helper.hideSpinner(component);
                }
                else if (state === "INCOMPLETE") {
                    alert('Response is Incompleted');
                }
                    else if (state === "ERROR") {
                        var errors = response.getError();
                        if (errors) {
                            if (errors[0] && errors[0].message) {
                                alert("Error message: " + 
                                      errors[0].message);
                            }
                        } else {
                            alert("Unknown error");
                        }
                    }
            });
            $A.enqueueAction(action);
            
        }
        else{
            var sMsg = $A.get("$Label.c.PV_SEM");
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title : 'Error',
                mode: 'pester',
                message: sMsg,
                duration:'4000',
                type : 'error'
            });
            toastEvent.fire();
            document.getElementsByTagName("THEAD")[0].setAttribute("style", "display: none");
            var showtable=component.find('showtable');
            var NoRecord=component.find('NoRecord');
            $A.util.addClass(showtable, 'slds-hide');
            $A.util.removeClass(showtable, 'slds-show');
            $A.util.addClass(NoRecord, 'slds-show');
            $A.util.removeClass(NoRecord, 'slds-hide');
        }
    },
    
    /*Column sorting*/
        sortByColumn : function(component, event, helper){
        helper.sortBy(component,event.currentTarget.dataset.value);
    }
    
    
})