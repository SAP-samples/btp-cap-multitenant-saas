using PublicService as service from '../../public-service';

annotate service.Members with @(
    Common.SemanticKey : [user_ID] 
); 

/**
 * UI.LineItem
 */
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
            ![@UI.Importance] : #High
        },{
            $Type : 'UI.DataField',
            Value : user.lastName,
            ![@UI.Importance] : #High
        },{
            $Type : 'UI.DataField',
            Value : user.email,
            ![@UI.Importance] : #High
        },{
            $Type : 'UI.DataField',
            Label : '{i18n>role}',
            Value : user.role_ID,
            ![@UI.Importance] : #High,
        }
    ]}
);

/**
 * UI.HeaderInfo
 */
annotate service.Members with @(
    UI.HeaderInfo : {
        TypeName       : '{i18n>member}',
        TypeNamePlural : '{i18n>member.typeNamePlural}',
    }
);