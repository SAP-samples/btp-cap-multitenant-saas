
service OnboardService @(path : '/catalog/OnboardService', requires: 'authenticated-user', impl: 'srv/obd-service' ){

    function tenant() returns String;
    function status() returns String; 

    function onboardTenant() returns String;
    function offboardTenant() returns String;
}