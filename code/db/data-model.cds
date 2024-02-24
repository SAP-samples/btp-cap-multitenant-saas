using {
      managed,
      cuid,
      Currency,
      Country,
      Language
} from '@sap/cds/common';
using {
      sap.common.Countries,
      sap.common.Currencies,
      sap.common.Languages
} from '@sap/cds-common-content';
using {Percentage} from './data-types';

context susaas.db {

      entity Projects : cuid, managed {
            description : String;
            validFrom   : Date;
            validTo     : Date;

            // compositions
            assessments : Association to many Assessments
                                on assessments.project = $self;
            members     : Composition of many Members
                                on members.project = $self;
      };


      @assert.unique: {membersUserProject: [
            user,
            project
      ]}
      entity Members : cuid, managed {
            // associations
            user    : Association to Users;
            project : Association to Projects;
      }

      @assert.unique: {usersEmail: [email]}
      entity Users : cuid, managed {
            @Core.Computed: true
            fullName    : String;
            firstName   : String;
            lastName    : String;
            email       : String;
            shadowId    : UUID;
            iasLocation : String;
            // associations
            role        : Association to Roles;
      }

      // Start of Assessments entity and associated Child Entities
      entity Assessments : cuid, managed {
            description        : String;
            eolProductDesign   : Percentage;
            // association
            product            : Association to Products;
            project            : Association to Projects;

            // compositions
            salesSplits        : Composition of many SalesSplits
                                       on salesSplits.assessment = $self;
            materialSplits     : Composition of many MaterialSplits
                                       on materialSplits.assessment = $self;
            circularityMetrics : Composition of many CircularityMetrics
                                       on circularityMetrics.assessment = $self;
      }

      entity MaterialSplits : cuid {
            materialCode  : String;
            materialType  : String;
            weightShare   : Percentage;
            shareRecycled : Percentage;
            // association
            assessment    : Association to Assessments;
      }

      entity CircularityMetrics : cuid {
            eoLRecyclability     : Percentage;
            countryRecyclability : Country;
            // association
            assessment           : Association to Assessments;
      }

      entity SalesSplits : cuid {
            totalRevenue            : Decimal(10, 3) @Measures.ISOCurrency: currency_code;
            traditionalProductSales : Decimal(10, 3) @Measures.ISOCurrency: currency_code;
            repairServicesSales     : Decimal(10, 3) @Measures.ISOCurrency: currency_code;
            reSellSales             : Decimal(10, 3) @Measures.ISOCurrency: currency_code;
            currency                : Currency;
            country                 : Country;
            // association
            assessment              : Association to Assessments;
      }


      entity Roles : managed {
            key ID          : String;
                description : String;
      }


      // ##############################
      // Uploaded data
      // ##############################

      entity SalesOrders {
            key so              : String(100);
            key soItemPos       : String(10);
                lifecycleStatus : String(1);
                billingStatus   : String(1);
                deliveryStatus  : String(1);
                grossAmount     : Decimal(10, 3) @Measures.ISOCurrency: currency_code;
                taxAmount       : Decimal(10, 3) @Measures.ISOCurrency: currency_code;
                netAmount       : Decimal(10, 3) @Measures.ISOCurrency: currency_code;
                quantity        : Decimal(15, 2);
                quantityUnit    : String(3);
                deliveryDate    : Timestamp;
                product         : Association to Products;
                category        : String(40);
                bpRole          : String(3);
                bpId            : String(10);
                companyName     : String(80);
                text            : String(255);
                itemAtpStatus   : String(1);
                firstName       : String(40);
                lastName        : String(40);
                overallStatus   : String(1);
                currency        : Currency;
                country         : Country;
                language        : Language;
      }

      entity Products {
            key ID                    : String(10);
                typeCode              : String(2);
                category              : String(40);
                supplierId            : String(10);
                taxTarifCode          : Integer;
                measureUnit           : String(3);
                weightMeasure         : Decimal(15, 3) @Measures.ISOCurrency: weightUnit;
                weightUnit            : String(3);
                price                 : Decimal(10, 3) @Measures.ISOCurrency: currency_code;
                text                  : String(255);
                language              : Language;
                currency              : Currency;
                eolProductDesign      : Percentage;
                traditionalSalesShare : Percentage;
                repairSalesShare      : Percentage;
                resellSalesShare      : Percentage;
                recyclingCountries    : Composition of many RecyclingCountries
                                              on recyclingCountries.product = $self;
                recyclingMaterials    : Composition of many RecyclingMaterials
                                              on recyclingMaterials.product = $self;
      }

      entity RecyclingCountries {
            key product          : Association to Products;
            key country          : Country;
                eolRecyclability : Percentage;

      }

      entity RecyclingMaterials {
            key product      : Association to Products;
            key material     : String;
                materialName : String;
                weightShare  : Percentage;
                recycleShare : Percentage;
      }
}

context susaas.common {
    entity Shared : cuid {
        value : String;
    };
}