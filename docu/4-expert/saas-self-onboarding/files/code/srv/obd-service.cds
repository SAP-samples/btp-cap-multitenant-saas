using { cuid } from '@sap/cds/common';

service OnboardService @(path : '/catalog/OnboardService', requires: 'authenticated-user', impl: 'srv/obd-service'){

    @readonly
    entity Subscriptions {
        key id : Integer;
        subaccountId : UUID;
        url : String;
        state : String;
        code : String;
        createdOn : Timestamp
    };

    @readonly
    entity Tasks {
        key id : Integer;
        name : String;
        state : String;
    };

    action onboardTenant() returns String;
    action offboardTenant() returns String;
}