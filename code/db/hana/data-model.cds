using { cuid } from '@sap/cds/common';

context susaas.common {
    @cds.persistence.exists
    entity Shared : cuid {
        value  : String;
    }
}