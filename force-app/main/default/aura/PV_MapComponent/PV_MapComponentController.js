({
	closeMapModel : function(component, event, helper) {
		var cmpTarget = component.find('Modalbox');
        var cmpBack = component.find('Modalbackdrop');
        $A.util.removeClass(cmpBack,'slds-backdrop--open');
        $A.util.removeClass(cmpTarget, 'slds-fade-in-open'); 
        if(!component.get("v.sendtoParent"))
        component.set("v.sendtoParent",true);
        else
        component.set("v.sendtoParent",false);
	},
    doInit: function(component, event, helper) {
        if(component.get("v.notQuickAction")===true)
        component.set("v.quickAction",false);
        else
        component.set("v.quickAction",true);
        var cmpTarget = component.find('Modalbox');
        var cmpBack = component.find('Modalbackdrop');
        $A.util.addClass(cmpTarget, 'slds-fade-in-open');
        $A.util.addClass(cmpBack, 'slds-backdrop--open'); 
        component.set('v.mapMarkers', [
            {
                location: {
                    Street: '1600 Pennsylvania Ave NW',
                    City: 'Washington',
                    State: 'DC'
                },

                title: 'The White House',
                description: 'Landmark, historic home & office of the United States president, with tours for visitors.'
            }
        ]);
    }
})