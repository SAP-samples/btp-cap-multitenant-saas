using PublicService as PublicService from '../../public-service';

annotate PublicService with @(
    requires : 'authenticated-user'
);

annotate PublicService.Assessments with @(
    odata.draft.enabled: true,
    restrict: [
        { grant: '*', to : 'Admin' },
        { grant: '*', to : 'Member', where : 'exists project.members.user[email = $user]'}
    ]
);

annotate PublicService.Projects with @(
    restrict: [
        { grant: ['READ'], to : 'Admin' },
        { grant: ['READ'], to : 'Member', where : 'exists members.user[email = $user]'}
    ],
    readonly: true
);

annotate PublicService.Members with @(
    restrict: [
        { grant: ['READ'], to : 'Admin' },
        { grant: ['READ'], to : 'Member', where : 'exists project.members.user[email = $user]'}
    ],
    readonly: true
);

annotate PublicService.Users with @(
    restrict: [
        { grant: ['READ'], to : 'Admin' },
        { grant: ['READ'], to : 'Member' }, 
    ],
    readonly: true
);

annotate PublicService.Roles with @(
    restrict: [
        { grant: ['READ'], to : 'Admin' },
        { grant: ['READ'], to : 'Member'}
    ],
    readonly: true
);

annotate PublicService.CircularityMetrics with @(
    restrict: [
        { grant: '*', to : 'Admin' },
        { grant: '*', to : 'Member', where : 'exists assessment.project.members.user[email = $user]'}
    ]
);


annotate PublicService.SalesSplits with @(
  restrict: [
    { grant: '*', to : 'Admin' },
    { grant: '*', to : 'Member', where : 'exists assessment.project.members.user[email = $user]'}
  ]
);

annotate PublicService.MaterialSplits with @(
    restrict: [
    { grant: '*', to : 'Admin' },
    { grant: '*', to : 'Member', where : 'exists assessment.project.members.user[email = $user]'}
  ]
);

annotate PublicService.SalesOrders with @readonly;
annotate PublicService.Products with @readonly;
annotate PublicService.RecyclingCountries with @readonly;
annotate PublicService.RecyclingMaterials with @readonly;
