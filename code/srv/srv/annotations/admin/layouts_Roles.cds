using AdminService as service   from '../../admin-service';

/**
    UI.Identification
 */
annotate service.Roles with @(
    Common.SemanticKey  : [ID]
);

/**
    UI.LineItems
 */
annotate service.Roles with @(
    UI.LineItem : {
        $value : [
            {
                $Type               : 'UI.DataField',
                Value               : ID,
                Label               : '{i18n>role}',
                ![@UI.Importance]   : #High,
            },
            {
                $Type               : 'UI.DataField',
                Value               : description,
                Label               : '{i18n>description}',
                ![@UI.Importance]   : #High,
            }
        ]
    }
);
