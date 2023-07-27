using AdminService as service  from '../../admin-service';

/**
    UI.Identification
 */
annotate service.Users with @(
    Common.SemanticKey  : [ID] 
);

/**
    UI.LineItems
 */
annotate service.Users with @(
    UI.LineItem : {
        $value : [
            {
                $Type               : 'UI.DataField',
                Value               : fullName,
                Label               : '{i18n>user}',
                ![@UI.Importance]   : #High,
            },
            {
                $Type               : 'UI.DataField',
                Value               : firstName,
                Label               : '{i18n>firstName}',
                ![@UI.Importance]   : #High,
            },
            {
                $Type               : 'UI.DataField',
                Value               : lastName,
                Label               : '{i18n>lastName}',
                ![@UI.Importance]   : #High,
            },
            {
                $Type               : 'UI.DataField',
                Value               : email,
                Label               : '{i18n>email}',
                ![@UI.Importance]   : #High
            },
            {
                $Type               : 'UI.DataField',
                Value               : role_ID,
                Label               : '{i18n>role}',
                ![@UI.Importance]   : #High,
            }
        ]
    }
);

/**
    UI.FieldGroup
 */
annotate service.Users with @(
    UI.FieldGroup #GeneralInformation : {
        Data  : [
            { Value : firstName },
            { Value : lastName },
            { Value : email },
        ]
    },
    UI.FieldGroup #RoleInformation : {
        Data  : [{ Value  : role_ID }]
    }
);


/**
    UI.HeaderInfo
 */
annotate service.Users with @(
    UI.HeaderInfo :{
        TypeName        : '{i18n>user}',
        TypeNamePlural  : '{i18n>user.typeNamePlural}',
        Title           : {
            $Type : 'UI.DataField',
            Value : '{firstName} {lastName}',
        },
        Description     : {
            $Type : 'UI.DataField',
            Value : '{i18n>user}',
        }
    }
);



/**
    UI.Facets
 */
annotate service.Users with @(
    UI.Facets : [
        {
            $Type   : 'UI.CollectionFacet',
            ID      : 'collectionFacetSection',
            Label   : '{i18n>generalInformation}',
            Facets  : [
                {
                    $Type           : 'UI.ReferenceFacet',
                    Target          : '@UI.FieldGroup#GeneralInformation',
                    Label   : '{i18n>generalInformation}',
                },
                {
                    $Type           : 'UI.ReferenceFacet',
                    Target          : '@UI.FieldGroup#RoleInformation',
                    Label   : '{i18n>roleInformation}',
                }
            ]
        }
    ]
);

/**
 * UI.SelectionFields
 */

annotate service.Users with @(
    UI.SelectionFields : [
        role_ID
    ]
);

/**
    UI.PresentationVariant
 */
annotate service.Users with @(
    UI.PresentationVariant : {
        SortOrder       : [{
            Property    : firstName,
            Descending  : false,
        }],
        Visualizations  : ['@UI.LineItem']
    }
);
