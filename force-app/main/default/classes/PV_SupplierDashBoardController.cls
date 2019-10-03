public class PV_SupplierDashBoardController 
{
    @auraEnabled    
    public static Date startHeaderDate{ get;set;}
    @auraEnabled
    public static Date endHeaderDate{get;set;}
    
    @auraEnabled
    public static SupplierDashBoardWrapper OrderList(Date dateFrom, Date dateTo,string supplierName){ 
        
        List <Order__c> lstOfOrder = [SELECT Id , User_Role__c, CPDD__c,CDD__c,End_Customer__c,Name,Sales_Person__c,
                                      (SELECT UICode__c,Prepared__c, Plan_Start_Date__c,Result_Start_Date__c, Plan_End_Date__c,
                                       Result_End_Date__c,Supplier__r.Name,Revised_Start_Date__c,Revised_End_Date__c 
                                       FROM Vehicle_Activity__r 
                                       WHERE Revised_Start_Date__c!=null AND Revised_End_Date__c!=null AND Supplier__c=:supplierName
                                       AND Revised_Start_Date__c <=: dateTo AND Revised_Start_Date__c >=: dateFrom order by Revised_Start_Date__c asc) 
                                      FROM order__c Where Id in (Select Order__C from Vehicle_Activity__c WHERE Revised_Start_Date__c!=null AND Revised_End_Date__c!=null AND Supplier__c=:supplierName
                                       AND Revised_Start_Date__c <=: dateTo AND Revised_Start_Date__c >=: dateFrom)];
        
        SupplierDashBoardWrapper DashBoardWrapperObj = new SupplierDashBoardWrapper();
        DashBoardWrapperObj.orderList = lstOfOrder;   
        return DashBoardWrapperObj;   
    }
    
    public class SupplierDashBoardWrapper{
        @AuraEnabled
        public list<Order__c> orderList{get;set;}
    }       
}