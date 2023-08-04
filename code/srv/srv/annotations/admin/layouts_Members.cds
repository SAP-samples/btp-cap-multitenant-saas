using AdminService as service from '../../admin-service';

/* UI.Identification */
annotate service.Members with @(
    Common.SemanticKey : [project_ID, user_ID]
);

/* UI.LineItem */
annotate service.Members with @(
    UI.LineItem : {
        $value : [{
            $Type : 'UI.DataField',
            Value : user_ID,
            Label : '{i18n>user}',
            ![@UI.Importance] : #High
        },{
            $Type : 'UI.DataField',
            Value : user.firstName,
            ![@Common.FieldControl] : #ReadOnly,
            ![@UI.Importance] : #High
        },{
            $Type : 'UI.DataField',
            Value : user.lastName,
            ![@Common.FieldControl] : #ReadOnly,
            ![@UI.Importance] : #High
        },{
            $Type : 'UI.DataField',
            Value : user.email,
            ![@Common.FieldControl] : #ReadOnly,
            ![@UI.Importance] : #High
        },{
            $Type : 'UI.DataField',
            Value :  user.role_ID,
            Label : '{i18n>role}',
            ![@Common.FieldControl] : #ReadOnly,
            ![@UI.Importance] : #High
        }
    ]}
);