window._dateHeaderUtility= function(component) {
  const dateFormat=function(inputDate) {
    return $A.localizationService.formatDate(new Date(inputDate), 'yyyy-MM-dd');
  }
  const numberOfDaysBetweenTwoDates = function(startDate, endDate) {
    return ((new Date(endDate) - new Date(startDate)) / 8.64e7);
  }
  /**
   * Date Header
   */
  class DateHeaderWrapper {
    /**
     * @param {Date} dateHeader
     */
    constructor(dateHeader) {
      this.dateHeader =dateFormat(startDateForActivity);// */$A.localizationService.formatDate(new Date(startDateForActivity), 'yyyy-MM-dd');
      const numberOfDaysIn=new Date(dateHeader.getFullYear(), dateHeader.getMonth()+1, 0).getDate()-new Date(dateHeader).getDate();
      this.numofdays=numberOfDaysIn+1;
    }
  }
  const dateList=[];
  const DateHeaderWrapperList = [];
  let startDateForActivity = new Date(component.get('v.startHeaderDate'));
  const endDateForActivity = new Date(component.get('v.endHeaderDate'));

  while (startDateForActivity <=endDateForActivity) {
    dateList.push(dateFormat(startDateForActivity));
    startDateForActivity.setDate(startDateForActivity.getDate() + 1);
  }
  component.set('v.dateList', dateList);

  startDateForActivity = new Date(component.get('v.startHeaderDate'));

  while (startDateForActivity<=endDateForActivity) {
    const HeaderSample=new DateHeaderWrapper(new Date(startDateForActivity));
    DateHeaderWrapperList.push(new DateHeaderWrapper(new Date(startDateForActivity)));
    startDateForActivity = startDateForActivity.setDate(startDateForActivity.getDate()+HeaderSample.numofdays);
    startDateForActivity = new Date(startDateForActivity);
  }

  try {
    const HeaderSample =DateHeaderWrapperList[DateHeaderWrapperList.length-1];
    const startDate = new Date(HeaderSample.dateHeader);
    const endDate = new Date(component.get('v.endHeaderDate'));
    HeaderSample.numofdays=numberOfDaysBetweenTwoDates(startDate, endDate)+1;
  } catch (error) {
    console.log(error);
  }
  component.set('v.dateHeaderList', DateHeaderWrapperList);
};
window._orderDetails= function(component) {
  const numberOfDaysBetweenTwoDates = function(startDate, endDate) {
    return ((new Date(endDate) - new Date(startDate)) / 8.64e7);
  }
  const dateFormat=function(inputDate) {
    return $A.localizationService.formatDate(new Date(inputDate), 'yyyy-MM-dd');
  }
  /**
  * Vehical Activity Object
  * @param {orderObj} Salesforce Order Record
  */
  class VehicleOrder {
    /**
     * @param {Salesforce_Order_Record} orderObj
     */
    constructor(orderObj) {
      this.orderObj = orderObj;
      this.NotPlanned = false;
      this.activitiesList = [];
      /**
       * @param {Salesforce_VehicleActiviy} truckActivityList
       * @param {Date} claendarStartDate
       * @return {List} list of activities
       */
      this.sortActivities = (truckActivityList, claendarStartDate)=>{
        const skipTruckActivityList = [];
        const needTruckActivityList = [];
        let firstTruckActivity = null;
        let secondTruckActivity = null;
        for (const truckActivity of truckActivityList) {
          if (!truckActivity.Revised_Start_Date__c) {
            this.NotPlanned = true;
            continue;
          }
          if (!firstTruckActivity) {
            firstTruckActivity = truckActivity;
            if (numberOfDaysBetweenTwoDates(claendarStartDate, truckActivity.Revised_Start_Date__c)> 0) {
              const revisedStartDate =claendarStartDate;
              const revisedEndDate =((new Date(truckActivity.Revised_Start_Date__c)).setDate((new Date(truckActivity.Revised_Start_Date__c)).getDate() - 1));
              needTruckActivityList.push(new VehicleActivityWrapper(new TruckActivity(revisedStartDate, revisedEndDate), true));
            }
            needTruckActivityList.push(new VehicleActivityWrapper(firstTruckActivity, false));
            continue;
          }
          secondTruckActivity = truckActivity;
          if (new Date(firstTruckActivity.Revised_End_Date__c) < new Date(secondTruckActivity.Revised_Start_Date__c)) {
            if ( numberOfDaysBetweenTwoDates(firstTruckActivity.Revised_End_Date__c, secondTruckActivity.Revised_Start_Date__c)> 1) {
              const revisedStartDate = ((new Date(firstTruckActivity.Revised_End_Date__c)).setDate((new Date(firstTruckActivity.Revised_End_Date__c)).getDate() + 1));
              const revisedEndDate = ((new Date(secondTruckActivity.Revised_Start_Date__c)).setDate((new Date(secondTruckActivity.Revised_Start_Date__c)).getDate() - 1));
              needTruckActivityList.push(new VehicleActivityWrapper(new TruckActivity(revisedStartDate, revisedEndDate), true));
            }
            firstTruckActivity = truckActivity;
            needTruckActivityList.push(new VehicleActivityWrapper(secondTruckActivity, false));
          } else {
            skipTruckActivityList.push(secondTruckActivity);
          }
        };
        const lastTruckActivity=needTruckActivityList[needTruckActivityList.length-1].vehicleActivity;
        const revisedEndDate = new Date(component.get('v.endHeaderDate'));

        if(new Date(new Date(lastTruckActivity.Revised_End_Date__c))<revisedEndDate){
          const revisedStartDate = ((new Date(lastTruckActivity.Revised_End_Date__c)).setDate((new Date(lastTruckActivity.Revised_End_Date__c)).getDate() + 1));
          needTruckActivityList.push(new VehicleActivityWrapper(new TruckActivity(revisedStartDate, revisedEndDate), true));
        }
        this.activitiesList.push(needTruckActivityList);
        return skipTruckActivityList;
      };
    }
  }
  /**
   * Truck Activity Object
   */
  class TruckActivity {
    /**
      * @param {Date} revisedStartDate
      * @param {Date} revisedEndDate
      */
    constructor(revisedStartDate, revisedEndDate) {
      this.sobjectType = 'Truck_Activity__c';
      this.Revised_Start_Date__c = dateFormat(revisedStartDate);
      this.Revised_End_Date__c = dateFormat(revisedEndDate);
    }
  }
  /**
   * Vehicle Activity
   */
  class VehicleActivityWrapper {
    /**
     * @param {Salesforce_VehicleActivity} vehicleActivity
     * @param {boolean} dummyVehicleActivity
     */
    constructor(vehicleActivity, dummyVehicleActivity) {
      this.vehicleActivity = vehicleActivity;
      this.numofdays = 0;
      if (vehicleActivity.Revised_Start_Date__c != null && vehicleActivity.Revised_End_Date__c != null) {
        this.numofdays = numberOfDaysBetweenTwoDates(vehicleActivity.Revised_Start_Date__c, vehicleActivity.Revised_End_Date__c)+1;
      }
      this.color = 'cornersDarkGreen';
      if (dummyVehicleActivity) {
        this.color = 'cornerswhite';
      } else if ((new Date(vehicleActivity.Revised_Start_Date__c) < new Date(vehicleActivity.Result_Start_Date__c) || new Date(vehicleActivity.Revised_End_Date__c) < new Date(vehicleActivity.Result_End_Date__c)) && new Date(vehicleActivity.Result_End_Date__c) > new Date()) {
        this.color = 'cornersRed';
      } else if (vehicleActivity.Result_Start_Date__c != null && vehicleActivity.Result_End_Date__c != null && vehicleActivity.Revised_Start_Date__c != null && vehicleActivity.Revised_End_Date__c != null) {
        this.color = 'cornersDarkGreen';
      } else if (vehicleActivity.Prepared__c) {
        this.color = 'cornersBlue';
      } else if (vehicleActivity.Revised_Start_Date__c != null && vehicleActivity.Revised_End_Date__c != null) {
        this.color = 'cornersLightGreen';
      }
    }
  }

  const vehicleOrderList =[];
  const orderList =component.get('v.orderList');
  for (const order of orderList) {
    const vehicle =new VehicleOrder(order);
    let vehicleActivitys =[];
    vehicleActivitys = order.Vehicle_Activity__r;
    if (vehicleActivitys) {
      do {
        vehicleActivitys = vehicle.sortActivities(vehicleActivitys, new Date(component.get('v.startHeaderDate')));
      } while (vehicleActivitys.length);
    } else {
      vehicle.NotPlanned = true;
      vehicle.activitiesList.push([new VehicleActivityWrapper(new TruckActivity(new Date(component.get('v.startHeaderDate')), new Date(component.get('v.endHeaderDate'))), true)]);
    }
    vehicleOrderList.push(vehicle);
  }
  component.set('v.orderList', vehicleOrderList);
  console.timeEnd('volvo');
  component.set('v.Spinner', false);
};
