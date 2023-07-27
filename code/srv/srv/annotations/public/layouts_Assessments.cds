using PublicService as service from '../../public-service';
using PublicService.CircularityMetrics as circularityMetrics from './layouts_CircularityMetrics';
using PublicService.SalesSplits as salesSplits from './layouts_SalesSplits';
using PublicService.MaterialSplits as materialSplits from './layouts_MaterialSplits';


/**
 * UI.Identification
 */
annotate service.Assessments with @(
    Common.SemanticKey : [ID]
);


/**
 * UI.LineItem
 */
annotate service.Assessments with @(
    UI.LineItem             : {
        $value : [
        {
            $Type : 'UI.DataField',
            Value : description,
            Position: 10,
            Label : '{i18n>assessment}',
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : project_ID,
            Position: 20,
            Label : '{i18n>project}',
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : product_ID,
            Position: 30,
            Label : '{i18n>product}',
            ![@UI.Importance] : #High
        }
    ]},

    UI.LineItem #OP_Project : [
        {
            $Type : 'UI.DataField',
            Value : description,
            Position: 10,
            Label : '{i18n>assessment}',
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : project_ID,
            Position: 20,
            Label : '{i18n>project}',
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : product_ID,
            Position: 30,
            Label : '{i18n>product}',
            ![@UI.Importance] : #High
        },
        {
            $Type           : 'UI.DataFieldForIntentBasedNavigation',
            Label           : '{i18n>create}',
            SemanticObject  : 'Assessments', 
            Action          : 'create', 
            RequiresContext : false,
            Inline          : false, 
            Mapping         : [{
                $Type                  : 'Common.SemanticObjectMappingType',
                LocalProperty          : ID,
                SemanticObjectProperty : 'project_ID'
            }],
            ![@UI.Importance] : #High
        }
    ],
);


/**
 * UI.FieldGroups
 */
annotate service.Assessments with @(
    UI.FieldGroup #CircularityMetrics: {
        Label : '{i18n>circularityMetric.typeNamePlural}',
        Data : [
            {
                $Type   : 'UI.DataFieldForAction',
                Action  : 'PublicService.prefillEolProductDesign',
                Label   : '{i18n>Prefill}',
                Inline  : true,
                ![@UI.Hidden] : { 
                    $edmJson : {$If : [ { $Eq : [ { $Path : 'IsActiveEntity'}, true ]}, false, true ]}
                }
            },
            { Value : eolProductDesign }
        ]
    },
    UI.FieldGroup #GeneralInformation : {
        $Type : 'UI.FieldGroupType',
        Label : '{i18n>generalInformation}',
        Data : [
            {Value : description,   Position: 10 },
            {Value : project_ID,    Position: 20 },
            {Value : product_ID,    Position: 30 }
        ]
    }
);


/**
 * UI.Facets
 */

annotate service.Assessments with @(
    UI.Facets : [
        {
            $Type  : 'UI.CollectionFacet',
            ID     : 'collectionFacetSectionGeneral',
            Label  : '{i18n>generalInformation}',
            Facets : [{
                $Type  : 'UI.ReferenceFacet',
                Label  : '{i18n>generalInformation}',
                Target : '@UI.FieldGroup#GeneralInformation'
            }]
        },{
            $Type   : 'UI.CollectionFacet',
            ID     : 'collectionFacetSectionCircularityMetrics',
            Label  : '{i18n>circularityMetric.typeNamePlural}',
            Facets  : [
                {
                    $Type   : 'UI.CollectionFacet',
                    Label  : '{i18n>eolProductDesign}',
                    ID     : 'collectionFacetSubSections1CircularityMetrics',
                    Facets  : [
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Target : '@UI.FieldGroup#CircularityMetrics',
                        Label  : '{i18n>eolProductDesign}',
                        ID     : 'collectionFacetSubSections1Facet1'
                    }]
                },{
                    $Type   : 'UI.CollectionFacet',
                    Label  : '{i18n>circularityMetric.typeNamePlural}',
                    ID     : 'collectionFacetSubSections2CircularityMetrics',
                    Facets  : [
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Target : 'circularityMetrics/@UI.LineItem',
                        ID     : 'collectionFacetSubSections2Facet1'
                    },
                    ]
                },{
                    $Type   : 'UI.CollectionFacet',
                    Label  : '{i18n>chart}',
                    ID     : 'collectionFacetSubSections3CircularityMetrics',
                    Facets  : [
                    {
                
                        $Type : 'UI.ReferenceFacet',
                        ID     : 'collectionFacetSubSection3CircularityMetricsChart',
                        Target : 'circularityMetrics/@UI.PresentationVariant#Chart',
                        ![@UI.PartOfPreview] : false
                    }],
                    ![@UI.Hidden] : { 
                        $edmJson : {$If : [ { $Eq : [ { $Path : 'IsActiveEntity'}, true ]}, false, true ]}
                    }
                }
            ],
        },
        {
            $Type   : 'UI.CollectionFacet',
            ID     : 'collectionFacetSectionSalesSplits',
            Label  : '{i18n>salesSplit.typeNamePlural}',
            Facets  : [{
                $Type   : 'UI.CollectionFacet',
                Label  : '{i18n>salesSplit.typeNamePlural}',
                ID     : 'collectionFacetSubSections1SalesSplits',
                Facets  : [{
                    $Type  : 'UI.ReferenceFacet',
                    Target : 'salesSplits/@UI.LineItem',
                }],
            },{
                $Type   : 'UI.CollectionFacet',
                Label  : '{i18n>chart}',
                ID     : 'collectionFacetSubSections2SalesSplits',
                Facets  : [{
                    $Type : 'UI.ReferenceFacet',
                    Target : 'salesSplits/@UI.PresentationVariant'
                }],
                ![@UI.Hidden] : { 
                    $edmJson : {$If : [ { $Eq : [ { $Path : 'IsActiveEntity'}, true ]}, false, true ]}
                }
            }]
        },{
            $Type   : 'UI.CollectionFacet',
            ID     : 'collectionFacetSectionMaterialSplits',
            Label  : '{i18n>materialSplit.typeNamePlural}',
            Facets  : [{
                $Type   : 'UI.CollectionFacet',
                ID     : 'collectionFacetSubSection1MaterialSplits',
                Label  : '{i18n>materialSplit.typeNamePlural}',
                Facets  : [{
                    $Type  : 'UI.ReferenceFacet',
                    ID     : 'collectionFacetSubSectionMaterialSplitsLineItems',
                    Target : 'materialSplits/@UI.LineItem'
                }]
            }]
        }
    ]
);


/**
 * UI.HeaderInfo
 */
annotate service.Assessments with @(
    UI.HeaderInfo : {
        TypeName       : '{i18n>assessment}',
        TypeNamePlural : '{i18n>assessment.typeNamePlural}',
        Title          : {
            $Type : 'UI.DataField',
            Value : description,
        },
        Description    : {
            $Type : 'UI.DataField',
            Value : '{i18n>assessment}',
        }
    }
);
