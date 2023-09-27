using PublicService as PublicService from '../../public-service';

annotate PublicService with @(requires: [
    'Admin',
    'Member',
    'system-user'
]);

annotate PublicService.Assessments with @(
    odata.draft.enabled: true,
    restrict           : [
        {
            grant: '*',
            to   : 'Admin'
        },
        {
            grant: '*',
            to   : 'Member',
            where: 'exists project.members.user[email = $user]'
        }
    ]
);

annotate PublicService.Projects with @(
    restrict: [
        {
            grant: ['READ'],
            to   : 'Admin'
        },
        {
            grant: ['READ'],
            to   : 'Member',
            where: 'exists members.user[email = $user]'
        }
    ],
    readonly: true
);

annotate PublicService.Members with @(
    restrict: [
        {
            grant: ['READ'],
            to   : 'Admin'
        },
        {
            grant: ['READ'],
            to   : 'Member',
            where: 'exists project.members.user[email = $user]'
        }
    ],
    readonly: true
);

annotate PublicService.Users with @(
    restrict: [
        {
            grant: ['READ'],
            to   : 'Admin'
        },
        {
            grant: ['READ'],
            to   : 'Member'
        },
    ],
    readonly: true
);

annotate PublicService.Roles with @(
    restrict: [
        {
            grant: ['READ'],
            to   : 'Admin'
        },
        {
            grant: ['READ'],
            to   : 'Member'
        }
    ],
    readonly: true
);

annotate PublicService.CircularityMetrics with @(restrict: [
    {
        grant: '*',
        to   : 'Admin'
    },
    {
        grant: '*',
        to   : 'Member',
        where: 'exists assessment.project.members.user[email = $user]'
    }
]);


annotate PublicService.SalesSplits with @(restrict: [
    {
        grant: '*',
        to   : 'Admin'
    },
    {
        grant: '*',
        to   : 'Member',
        where: 'exists assessment.project.members.user[email = $user]'
    }
]);

annotate PublicService.MaterialSplits with @(restrict: [
    {
        grant: '*',
        to   : 'Admin'
    },
    {
        grant: '*',
        to   : 'Member',
        where: 'exists assessment.project.members.user[email = $user]'
    }
]);

annotate PublicService.SalesOrders with @(
    restrict: [
        {
            grant: ['READ'],
            to   : 'Admin'
        },
        {
            grant: ['READ'],
            to   : 'Member'
        }
    ],
    readonly: true
);

annotate PublicService.Products with @(
    restrict: [
        {
            grant: ['READ'],
            to   : 'Admin'
        },
        {
            grant: ['READ'],
            to   : 'Member'
        }
    ],
    readonly: true
);

annotate PublicService.RecyclingCountries with @(
    restrict: [
        {
            grant: ['READ'],
            to   : 'Admin'
        },
        {
            grant: ['READ'],
            to   : 'Member'
        }
    ],
    readonly: true
);

annotate PublicService.RecyclingMaterials with @(
    restrict: [
        {
            grant: ['READ'],
            to   : 'Admin'
        },
        {
            grant: ['READ'],
            to   : 'Member'
        }
    ],
    readonly: true
);
