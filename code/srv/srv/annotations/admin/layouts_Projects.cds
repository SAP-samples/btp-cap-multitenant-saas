using AdminService as service from '../../admin-service';
using AdminService.Assessments as assessments from './layouts_Assessments';
using AdminService.Members as members from './layouts_Members';

/* UI.Identification */
annotate service.Projects with @(
    Common.SemanticKey : [ID]
);

/* UI.LineItem */
annotate service.Projects with @(
    UI.LineItem : {
        $value : [{
            $Type             : 'UI.DataField',
            Value             : description,
            Label             : '{i18n>project}',
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField',
            Value             : validFrom,
            ![@UI.Importance] : #High,
        },
        {
            $Type             : 'UI.DataField',
            Value             : validTo,
            ![@UI.Importance] : #High,
        }
    ]}
);

/* UI.FieldGroup */
annotate service.Projects with @(
    UI.FieldGroup #GeneralInformation : {
        Data : [{
            Value : description
        },{
            Value : validFrom
        },{
            Value : validTo
        }]
    }
);


/* UI.HeaderInfo */
annotate service.Projects with @(
    UI.HeaderInfo : {
        TypeName       : '{i18n>project}',
        TypeNamePlural : '{i18n>project.typeNamePlural}',
        Title          : {
            $Type : 'UI.DataField',
            Value : description,
        },
        Description    : {
            $Type : 'UI.DataField',
            Value : '{i18n>project}',
        }
    }
);


/* UI.Facets */
annotate service.Projects with @(
    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#GeneralInformation',
            Label  : '{i18n>generalInformation}'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Target : 'assessments/@UI.LineItem',
            Label  : '{i18n>assessment.typeNamePlural}',
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Target : 'members/@UI.LineItem',
            Label  : '{i18n>member.typeNamePlural}',
        }
    ]
);


/* UI.SelectionFields */
annotate service.Projects with @(
    UI.SelectionFields : [
        description
    ]
);


/* UI.PresentationVariant */
annotate service.Projects with @(
    UI.PresentationVariant : {
        SortOrder      : [{
            Property   : description,
            Descending : false,
        }],
        Visualizations : ['@UI.LineItem']
    }
);
