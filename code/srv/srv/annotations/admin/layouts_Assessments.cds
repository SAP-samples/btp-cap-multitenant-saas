using AdminService as service from '../../admin-service';

/* UI.Identification */
annotate service.Assessments with @(
    Common.SemanticKey : [ID]
);

/* UI.LineItem */
annotate service.Assessments with @(
    UI.LineItem : {
        $value : [{
            $Type : 'UI.DataField',
            Value : description,
            Label : '{i18n>assessment}',
            Position: 10,
            ![@Common.FieldControl] : #ReadOnly,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : project_ID,
            Label : '{i18n>project}',
            Position: 20,
            ![@Common.FieldControl] : #ReadOnly,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : product_ID,
            Label : '{i18n>product}',
            Position: 30,
            ![@Common.FieldControl] : #ReadOnly,
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
    ]}
);
