using PublicService as service from '../../public-service';

/**
 *  UI.Identification
 */
annotate service.MaterialSplits with @(
    Common.SemanticKey  : [ID]
);

/**
 *  UI.LineItems
 */
annotate service.MaterialSplits with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : assessment.product.ID,
            ![@Common.FieldControl] : #ReadOnly,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : materialCode,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : materialType,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : weightShare,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : shareRecycled,
            ![@UI.Importance] : #High
        }
    ]
);