@isTest 
public class PV_processVisualization_Test {
    @testSetup
    static void setup() 
    {
        
        UserRole role = new UserRole(DeveloperName = 'ManagerRegion', Name = 'Volvo');    
        insert role;
        System.assertEquals(role.Name,'Volvo');
        
        User usr = new User(
            ProfileId = [SELECT Id FROM Profile WHERE Name = 'System Administrator'].Id,
            LastName = 'last',
            Email = 'Volvo@volvo.com',
            Username = 'volvo@volvo.com' + System.currentTimeMillis(),
            CompanyName = 'TEST',
            Title = 'title',
            Alias = 'alias',
            TimeZoneSidKey = 'America/Los_Angeles',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            UserRoleId = role.Id
        );
        insert usr;
        System.assertEquals(usr.Title,'title');
    }
    
    
    //*This Mehod is used for the apex class PV_RoleUtils*//
    @isTest
    public static void RoleUtils()
    {
        user userId=[select id,name,UserRoleId from user where Email = 'volvo@volvo.com' limit 1];
        UserRole roleId=[select id,name from UserRole where Id =: userId.UserRoleId  and DeveloperName = 'ManagerRegion' limit 1];
        
        System.assertNotEquals(roleId.Id,null);
        List<UserRole> roleIds=[select id,name from UserRole];
        
        PV_RoleUtils.GetSalesDepartment(roleId.Id);    
        PV_RoleUtils.GetSalesManagers(roleId.Id);
        PV_RoleUtils.GetRegions(roleId.id);
        PV_RoleUtils.GetSubordinateUsers(roleId.Id);
    }
    //*This Mehod is used for GetSalesDepartment method in apex class PV_DashBoardController *//
    @isTest
    public static void GetSalesDepartment()
        
    { 
        UserRole parentrole = new UserRole(DeveloperName = 'SalesManager', Name = 'Volvo');    
        insert parentrole;
        UserRole role = new UserRole(DeveloperName = 'SalesManagers', Name = 'Volvo'); 
        role.ParentRoleId=parentrole.Id;
        insert role;
        
        System.assertEquals(role.Name,'Volvo');
        
        User usr = new User(
            ProfileId = [SELECT Id FROM Profile WHERE Name = 'System Administrator'].Id,
            LastName = 'last',
            Email = 'Volvo@volvo.com',
            Username = 'volvo@volvo.com' + System.currentTimeMillis(),
            CompanyName = 'TEST',
            Title = 'title',
            Alias = 'alias',
            TimeZoneSidKey = 'America/Los_Angeles',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            UserRoleId = role.Id
        );
        insert usr;
        System.assertEquals(usr.UserRoleId,role.Id);
        
        user userId=[select id,name,UserRoleId from user where Email = 'volvo@volvo.com' limit 1];
        UserRole roleId=[select id,name from UserRole where Id =: usr.UserRoleId  and DeveloperName = 'SalesManagers' limit 1];
        
        System.assertNotEquals(roleId.Id,null);
        List<UserRole> roleIds=[select id,name from UserRole];  
        PV_DashBoardController.GetSalesDepartment(roleId.id);
        
    } 
    
    //*This Mehod is used for the apex class PV_DashBoardController*//
    @isTest
    public static void DashBoardController()
    { 
        
        order__c order=new order__c();
        order.CDD__c=system.today();
        order.CPDD__c=system.today()+19;
        order.End_Customer__c='volvo';
        order.Discontinued__c=true;
        insert order;
        System.assertEquals(Order.End_Customer__c, 'volvo');
        
        Vehicle_Activity__c Vehicle_Activity=new Vehicle_Activity__c();
        Vehicle_Activity.Plan_Start_Date__c=system.today();
        Vehicle_Activity.Plan_End_Date__c=system.today()+10;
        Vehicle_Activity.Order__c=order.Id;
        insert Vehicle_Activity;
        System.assertEquals(Vehicle_Activity.Plan_Start_Date__c, system.today());
        
        user userId=[select id,name,UserRoleId from user where Email = 'volvo@volvo.com' limit 1];
        UserRole roleId=[select id,name from UserRole where Id =: userId.UserRoleId  and DeveloperName = 'ManagerRegion' limit 1];
          System.assertEquals(roleId.Id,userId.UserRoleId);
        List<UserRole> roleIds=[select id,name from UserRole];
        PV_DashBoardController.truckActivityData(system.today()-11, system.today()+30, true, '', '', '', '', '');
        PV_DashBoardController.exportToExcel(system.today()-11, system.today()+30, true, '', '', '', '', '');
        PV_DashBoardController.LoggedInUserInfo();
        PV_DashBoardController.GetRegions(roleId.id);
        PV_DashBoardController.GetSalesManagers(roleId.id);
    }
    
    //*This Mehod is used for the apex class PV_SupplierDashBoardLookupController*//
    @isTest
    public static void SupplierDashBoardLookupController()
    {  
       
        PV_SupplierDashBoardLookupController.fetchLookUpValues('searchKeyWord', 'Supplier__c');
      
        
    }
    //*This Mehod is used for the apex class PV_SupplierDashBoardController*//
    @isTest
    public static void SupplierDashBoardController()
    { 
      
        PV_SupplierDashBoardController.OrderList(system.today()-11,system.today()+30,'supplierName');
       
    }
  
}