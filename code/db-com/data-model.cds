using { cuid } from '@sap/cds/common';

context susaas.common {
    entity Shared : cuid {
        value : String;
    };
}