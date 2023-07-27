using AdminService as AdminService from '../../admin-service';

annotate AdminService with @(
    requires : 'authenticated-user'
);

annotate AdminService.Projects with @(
    odata.draft.enabled : true,
    restrict: [
        { grant: '*', to : 'Admin' },
    ]
);

annotate AdminService.Users with @(
    odata.draft.enabled : true,
    restrict: [
        { grant: '*', to : 'Admin' },
    ]
);

annotate AdminService.Members with @(
    restrict: [
        { grant: '*', to : 'Admin' },
    ]
);    

annotate AdminService.Assessments @(
    readonly : true,
    restrict: [
        { grant: 'READ', to : 'Admin' },
    ]
);

annotate AdminService.Roles with @(
    readonly : true,
    restrict: [
        { grant: 'READ', to : 'Admin' },
    ]
);

annotate AdminService.Products with @(
    readonly : true,
    restrict: [
        { grant: 'READ', to : 'Admin' },
    ]
);