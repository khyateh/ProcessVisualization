({
    showSpinner: function(component) 
    {
        component.set("v.Spinner", true); 
    },
    hideSpinner: function(component) 
    {
        component.set("v.Spinner", false); 
    },
    sortBy: function(component, fieldName) 
    {
        component.set("v.sortField", fieldName);
        var data = component.get("v.orderList");
        var sortDirection = component.get("v.sortAsc");
        var key = function(a) 
        {
            if(fieldName == 'End_Customer__c')
            {
                return JSON.stringify(a['orderObj'].End_Customer__c);
            } 
            if(fieldName == 'CDD__c')
            {
                return JSON.stringify(a['orderObj'].CDD__c);
            }
            if(fieldName == 'CPDD__c')
            {
                return JSON.stringify(a['orderObj'].CPDD__c);
            }
            if(fieldName == 'Name')
            {
                return JSON.stringify(a['orderObj'].Name);
            }
            if(fieldName == 'Sales_Person__c')
            {
                return JSON.stringify(a['orderObj'].Name);
            }
            if(fieldName == 'User_Role__c')
            {
                return JSON.stringify(a['orderObj'].Name);
            }
        }
        var reverse = sortDirection == true ? 1: -1;
        data.sort(function(a,b){ 
            var a = key(a) ? key(a).toLowerCase() : '';
            var b = key(b) ? key(b).toLowerCase() : '';
            return reverse * ((a>b) - (b>a));
        });
        component.set("v.orderList",data);
        if(sortDirection == true)
        {
            sortDirection = false;
        }
        else
        {
            sortDirection = true;
        }
        component.set("v.sortAsc", sortDirection);
    },
})