trigger PV_VehicleActivity on Vehicle_Activity__c (before insert,before update) {
	if(trigger.isInsert){
        for(Vehicle_Activity__c va : trigger.new){
            if(va.Revised_Start_Date__c == null){
                va.Revised_Start_Date__c = va.Plan_Start_Date__c;
            }
		    if(va.Revised_End_Date__c == null){
                 va.Revised_End_Date__c =va.Plan_End_Date__c;
            }
        }
    }
    
    if(trigger.isUpdate){
        map<Id, Vehicle_Activity__c> oldVAs = trigger.oldMap;
        for(Vehicle_Activity__c va : trigger.new){
            Vehicle_Activity__c oldVA = oldVAs.get(va.Id);
            if((va.Revised_Start_Date__c == oldVA.Revised_Start_Date__c)&& (va.Plan_Start_Date__c != oldVA.Plan_Start_Date__c)){
                va.Revised_Start_Date__c = va.Plan_Start_Date__c;
            }
            if((va.Revised_End_Date__c == oldVA.Revised_End_Date__c)&& (va.Plan_End_Date__c != oldVA.Plan_End_Date__c)){
                va.Revised_End_Date__c = va.Plan_End_Date__c;
            }
        }
    }
}