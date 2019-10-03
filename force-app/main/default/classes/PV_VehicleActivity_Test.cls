@isTest
public class PV_VehicleActivity_Test 
{
    @isTest
    public static void setup()
    {
        order__c order=new order__c();
        order.CDD__c=system.today();
        order.CPDD__c=system.today()+19;
        order.End_Customer__c='Volvo';
        order.Discontinued__c=true;
        insert order;
        System.assertEquals(Order.End_Customer__c, 'Volvo');
        
        Vehicle_Activity__c Vehicle_Activity=new Vehicle_Activity__c();
        Vehicle_Activity.Plan_Start_Date__c=system.today();
        Vehicle_Activity.Plan_End_Date__c=system.today()+10;
        Vehicle_Activity.Order__c=order.Id;
        insert Vehicle_Activity;
        System.assertEquals(Vehicle_Activity.Plan_Start_Date__c, system.today());
        
      
        Vehicle_Activity.Result_Start_Date__c=system.today()+2;
        update Vehicle_Activity;
        System.assertEquals(Vehicle_Activity.Result_Start_Date__c, system.today()+2);
        
    }
   
}