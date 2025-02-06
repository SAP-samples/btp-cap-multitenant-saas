using { managed, cuid, Currency, Country, Language } from '@sap/cds/common'; 

using from '@sap/cds-common-content';
using {Percentage} from './data-types'; 

// Define reusable aspects for common patterns
aspect ManagedCuid {
  key ID  : UUID @default: uuid();
  createdAt : Timestamp;
  modifiedAt : Timestamp;
}


context susaas.db {
  entity Projects : ManagedCuid {
    description : String;
    validFrom   : Date;
    validTo     : Date;

    // compositions
    assessments : Association to many Assessments on assessments.project = $self;
    members     : Composition of many Members on members.project = $self;
  };

  @assert.unique
  entity Members : ManagedCuid {
  user    : Association to Users;
  project : Association to Projects;
}


  @assert.unique.usersEmail: [email]
  entity Users : ManagedCuid {
    @Core.Computed: 'firstName || \' \' || lastName'
    fullName    : String virtual;
    firstName   : String;
    lastName    : String;
    @Core.IsEmail
    email       : String(255);
    shadowId    : UUID;
    iasLocation : String;
    role        : Association to Roles;
  }

  entity Assessments : ManagedCuid {
    description        : String;
    eolProductDesign   : Percentage;
    product            : Association to Products;
    project            : Association to Projects;

    salesSplits        : Composition of many SalesSplits on salesSplits.assessment = $self;
    materialSplits     : Composition of many MaterialSplits on materialSplits.assessment = $self;
    circularityMetrics : Composition of many CircularityMetrics on circularityMetrics.assessment = $self;
  }

  entity MaterialSplits : cuid {
    materialCode  : String;
    materialType  : String;
    weightShare   : Percentage;
    shareRecycled : Percentage;
    assessment    : Association to Assessments;
  }

  entity CircularityMetrics : cuid {
    eoLRecyclability     : Percentage;
    countryRecyclability : Country;
    assessment           : Association to Assessments;
  }

  entity SalesSplits : cuid {
    totalRevenue            : Decimal(15,3) @Measures.ISOCurrency: currency;
    traditionalProductSales : Decimal(15,3) @Measures.ISOCurrency: currency;
    repairServicesSales     : Decimal(15,3) @Measures.ISOCurrency: currency;
    reSellSales             : Decimal(15,3) @Measures.ISOCurrency: currency;
    currency                : Currency;
    country                 : Country;
    assessment              : Association to Assessments;
  }

  entity Roles : managed {
    key ID          : String(10);
    description     : String(255);
  }

  entity SalesOrders {
    key so              : String(100);
    key soItemPos       : String(10);
    lifecycleStatus     : String(1);
    billingStatus       : String(1);
    deliveryStatus      : String(1);
    grossAmount         : Decimal(15,3) @Measures.ISOCurrency: currency;
    taxAmount           : Decimal(15,3) @Measures.ISOCurrency: currency;
    netAmount           : Decimal(15,3) @Measures.ISOCurrency: currency;
    quantity            : Decimal(15,2);
    quantityUnit        : String(3);
    deliveryDate        : Date;
    product             : Association to Products;
    category            : String(40);
    bpRole              : String(3);
    bpId                : String(10);
    companyName         : String(80);
    text                : String(255);
    itemAtpStatus       : String(1);
    overallStatus       : String(1);
    currency            : Currency;
    country             : Country;
    language            : Language;
  }

  entity Products {
    key ID                    : String(10);
    typeCode                  : String(2);
    category                  : String(40);
    supplierId                : String(10);
    taxTarifCode              : Integer;
    measureUnit               : String(3);
    weightMeasure             : Decimal(15,3) @Measures.Unit: weightUnit;
    weightUnit                : String(3);
    price                     : Decimal(15,3) @Measures.ISOCurrency: currency;
    text                      : String(255);
    language                  : Language;
    currency                  : Currency;
    eolProductDesign          : Percentage;
    traditionalSalesShare     : Percentage;
    repairSalesShare          : Percentage;
    resellSalesShare          : Percentage;
    recyclingCountries        : Composition of many RecyclingCountries on recyclingCountries.product = $self;
    recyclingMaterials        : Composition of many RecyclingMaterials on recyclingMaterials.product = $self;
  }

  entity RecyclingCountries {
    key product          : Association to Products;
    key country          : Country;
    eolRecyclability     : Percentage;
  }

  entity RecyclingMaterials {
    key product      : Association to Products;
    key material     : String(10);
    materialName     : String(50);
    weightShare      : Percentage;
    recycleShare     : Percentage;
  }
}

context susaas.common {
  @cds.persistence.exists
  entity Shared : cuid {
    value : String(255);
  };
}
