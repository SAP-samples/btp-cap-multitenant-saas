using { susaas.db as schema } from '../../../db/data-model';

annotate schema.Members with{
    user @(
        Common : {
            ValueList        : {
                Label          : '{i18n>role.typeNamePlural}',
                CollectionPath : 'Users',
                Parameters     : [
                    {
                        $Type               : 'Common.ValueListParameterInOut',
                        ValueListProperty   : 'ID',
                        LocalDataProperty   : user_ID
                    },
                    {
                        $Type               : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty   : 'firstName'
                    },
                    {
                        $Type               : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty   : 'lastName'
                    },
                    {
                        $Type               : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty   : 'email'
                    }
                ]
            }
        }
    );
};

annotate schema.Users with{
    role @(
        Common : {
            ValueList       : {
                $Type          : 'Common.ValueListType',
                Label          : '{i18n>role.typeNamePlural}',
                CollectionPath : 'Roles',
                Parameters     : [
                    {
                        $Type               : 'Common.ValueListParameterInOut',
                        ValueListProperty   : 'ID',
                        LocalDataProperty   : role_ID
                    },
                    {
                        $Type             : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'description'
                    }
                ]
            }
        }
    );
};

annotate schema.Assessments with{
    product @(
        Common : {
            ValueList       : {
                Label          : '{i18n>product.typeNamePlural}',
                CollectionPath : 'Products',
                Parameters     : [
                    {
                        $Type               : 'Common.ValueListParameterInOut',
                        ValueListProperty   : 'ID',
                        LocalDataProperty   : product_ID
                    },
                    {
                        $Type             : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'text'
                    }, 

                ]
            }
        }
    );

    project @(
        Common : {
            ValueList       : {
                Label          : '{i18n>project.typeNamePlural}',
                CollectionPath : 'Projects',
                Parameters     : [
                    {
                        $Type               : 'Common.ValueListParameterInOut',
                        ValueListProperty   : 'ID',
                        LocalDataProperty   : project_ID
                    },
                    {
                        $Type             : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'description'
                    },    
                ]
            }
        }
    );
};