public with sharing class PV_DashBoardController{
    
    @auraEnabled
    public static DashBoardWrapper truckActivityData(Date dateFrom, Date dateTo, boolean useCDDFlag, String region, String salesTeam, String salesRep, String orderNumber, String customerName){
        set<Id> owners = new set<Id>();
        if(!string.isEmpty(salesRep)){
            owners.add(salesRep);
        }else if(!string.isEmpty(salesTeam)){
            owners = PV_RoleUtils.GetSubordinateUsers(salesTeam);
        }else if(!string.isEmpty(region)){
            owners = PV_RoleUtils.GetSubordinateUsers(region);
        }
        
        List<order__c> orderList = new List<order__c>();
        String orderQuery ='SELECT Id ,CPDD__c,CDD__c,End_Customer__c, Name,Discontinued__c, (SELECT Plan_Start_Date__c,Result_Start_Date__c,UICode__c, Plan_End_Date__c,Result_End_Date__c,Revised_Start_Date__c,Revised_End_Date__c,Supplier__c,Supplier__r.Name,Supplier__r.Supplier_Name__c,RecordType.Name,Prepared__c,Remarks__c,External__c,RecordTypeId FROM Vehicle_Activity__r order by Revised_Start_Date__c asc) FROM order__c WHERE ';
        String aggregateQuery='Select min(Revised_Start_Date__c)start,max(Revised_End_Date__c)end from Vehicle_Activity__c where ';
        String aggregateQuerywhereCondition ='';
        String orderQuerywhereCondition ='';
        
        if(useCDDFlag){	
            orderQuerywhereCondition +='  CDD__c!=null and CDD__c <=: dateTo AND CDD__c >=: dateFrom ';
            aggregateQuerywhereCondition+=' Revised_Start_Date__c!= null and Revised_End_Date__c!=null and Order__r.CDD__c!=null and Order__r.CDD__c <=: dateTo AND Order__r.CDD__c >=: dateFrom ';
        }else{
            orderQuerywhereCondition +='  CPDD__c!=null and CPDD__c <=: dateTo AND CPDD__c >=: dateFrom ';
            aggregateQuerywhereCondition+='  Revised_Start_Date__c!= null and Revised_End_Date__c!=null and Order__r.CPDD__c!=null and Order__r.CPDD__c <=: dateTo AND Order__r.CPDD__c >=: dateFrom ';
        }
        
        if(!string.isEmpty(orderNumber)){
            orderQuerywhereCondition += ' And Name =: orderNumber';
            aggregateQuerywhereCondition+= ' And Order__r.Name =: orderNumber';
        }
        
        if(!string.isEmpty(customerName)){
            orderQuerywhereCondition += ' And End_Customer__c like \'%'+  string.escapeSingleQuotes(customerName) +'%\' ';
            aggregateQuerywhereCondition+= ' And Order__r.End_Customer__c like \'%'+  string.escapeSingleQuotes(customerName) +'%\' ';
        }
       
        if(owners.size()>0){
            orderQuerywhereCondition += ' And  ownerId in: owners';
            aggregateQuerywhereCondition += ' And Order__r.ownerId in: owners';
        }
        
        AggregateResult[] resultQueryToGetStartAndEndDate = Database.query(aggregateQuery+' '+aggregateQuerywhereCondition);
        DashBoardWrapper dashBoardWrapperObj=new DashBoardWrapper();
        DashBoardWrapperObj.orderList = database.query(orderQuery+' '+orderQuerywhereCondition);// orderList;
        DashBoardWrapperObj.startHeaderDate = Date.valueOf(resultQueryToGetStartAndEndDate[0].get('start'));
        DashBoardWrapperObj.endHeaderDate = Date.valueOf(resultQueryToGetStartAndEndDate[0].get('end'));
        return DashBoardWrapperObj;
    }
    
    @auraEnabled
    public static Map<Id, UserRole> getRegions(Id roleIdForRegionPicklistValues){
        return roleIdForRegionPicklistValues==null?(new Map<Id, UserRole>()):PV_RoleUtils.GetRegions(roleIdForRegionPicklistValues);
    }
    @auraEnabled
    public static Map<Id, UserRole> getSalesManagers(Id selectedRegionId){
        return selectedRegionId==null?(new Map<Id, UserRole>()):PV_RoleUtils.GetSalesManagers(selectedRegionId);
    }
    @auraEnabled
    public static Map<Id,User> getSalesDepartment(Id roleId){ 
        return  roleId==null?(new map<Id,user>()):PV_RoleUtils.GetSalesDepartment(roleId);    
    }
    
    @auraEnabled
    public static UserInfoWrapper loggedInUserInfo(){
        UserInfoWrapper userInfoWrapperObj =new UserInfoWrapper();
        UserRole uRole = [Select DeveloperName,ParentRoleId, Name, Id From UserRole u where u.Id=:UserInfo.getUserRoleId()];
        userInfoWrapperObj.currentUserId=UserInfo.getUserId();
        userInfoWrapperObj.ParentRoleId = uRole.ParentRoleId;
        userInfoWrapperObj.currentUserRoleId = UserInfo.getUserRoleId();
        userInfoWrapperObj.userType=uRole.ParentRoleId == null?'Admin':
                                        (
                                           uRole.DeveloperName.contains('Region')?'Region':
                                           (
                                               uRole.DeveloperName.contains('SalesManager')?'SalesManager':
                                               (
                                                   uRole.DeveloperName.contains('SalesDepartment')?'SalesDepartment':
                                                   ''
                                               )
                                           ) 
                                        );

        if(userInfoWrapperObj.userType=='Admin'){
            userInfoWrapperObj.roleIdForRegionPicklistValues=UserInfo.getUserRoleId();
        }else if(userInfoWrapperObj.userType=='Region'){
            userInfoWrapperObj.roleIdForRegionPicklistValues=uRole.ParentRoleId;
        }
        return userInfoWrapperObj;
    }

      

    @auraEnabled
    public static string exportToExcel(Date dateFrom, Date dateTo, boolean useCDDFlag, String region, String salesTeam, String salesRep, String orderNumber, String customerName){
        DashBoardWrapper truckWrapper = truckActivityData(dateFrom,dateTo,useCDDFlag,region,salesTeam,salesRep,orderNumber,customerName);
        
        List<Order__c> orderList = new list<Order__c>();
        orderList = truckWrapper.orderList;
        
        truckWrapper = null;

        List<string> rows = new List<string>();
        List<string> columns = new List<string>();
        columns.add('CDD');
        columns.add('CPDD');
        columns.add('Customer');
        columns.add('Order No');
        columns.add('Record Type');
        columns.add('Plan Start Date');
        columns.add('Plan End Date');
        columns.add('Result Start Date');
        columns.add('Result End Date');
        columns.add('Revised Start Date');
        columns.add('Revised End Date');
        columns.add('Supplier Id');
        columns.add('Prepared');
        columns.add('Remarks');
        columns.add('External');

        rows.add(String.join(columns, ','));

        for(Order__c order : orderList){
            for(Vehicle_Activity__c vehicleActivity: order.Vehicle_Activity__r){
                    if(vehicleActivity.Revised_Start_Date__c!=null&&vehicleActivity.Revised_End_Date__c!=null){
                        columns=new list<string>();
                        columns.add( WrapWithQuotes( String.ValueOf( order.CDD__c)));
                        columns.add( WrapWithQuotes( String.ValueOf( order.CPDD__c)));
                        columns.add( WrapWithQuotes( String.ValueOf( order.End_Customer__c)));
                        columns.add( WrapWithQuotes( String.ValueOf( order.Name)));
                        columns.add( WrapWithQuotes( String.ValueOf( vehicleActivity.RecordType.Name)));
                        columns.add( WrapWithQuotes( String.ValueOf( vehicleActivity.Plan_Start_Date__c)));
                        columns.add( WrapWithQuotes( String.ValueOf( vehicleActivity.Plan_End_Date__c)));
                        columns.add( WrapWithQuotes( String.ValueOf( vehicleActivity.Result_Start_Date__c)));
                        columns.add( WrapWithQuotes( String.ValueOf( vehicleActivity.Result_End_Date__c)));
                        columns.add( WrapWithQuotes( String.ValueOf( vehicleActivity.Revised_Start_Date__c)));
                        columns.add( WrapWithQuotes( String.ValueOf( vehicleActivity.Revised_End_Date__c)));
                        columns.add( WrapWithQuotes( String.ValueOf( vehicleActivity.Supplier__r.Name)));
                        columns.add( WrapWithQuotes( String.ValueOf( vehicleActivity.Prepared__c)));
                        columns.add( WrapWithQuotes( String.ValueOf( vehicleActivity.Remarks__c)));
                        columns.add( WrapWithQuotes( String.ValueOf( vehicleActivity.External__c)));            
                        rows.add(String.join(columns,','));
                    }
            }
        }
        String excelRows = String.Join(rows, '\n');
        rows = null;
        blob csvBlob = Blob.valueOf(excelRows);
        return EncodingUtil.base64Encode(csvBlob);
    }
    private static string wrapWithQuotes(string value){
        return '"'+value+'"';
    } 
    public class DashBoardWrapper{
        @AuraEnabled
        public date startHeaderDate{get;set;}
        @AuraEnabled
        public date endHeaderDate{get;set;}
        @AuraEnabled
        public list<Order__c> orderList{get;set;}
    }
    public class UserInfoWrapper{
        @auraEnabled
        public Id parentRoleId{get;set;}
        @auraEnabled
        public Id currentUserRoleId{get;set;}
        @auraEnabled
        public Id currentUserId{get;set;}
        @auraEnabled
        public string userType{get;set;}
        @AuraEnabled
        public Id roleIdForRegionPicklistValues{get;set;}
    }
}