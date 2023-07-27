using {susaas.db as db} from '../../db/data-model';
using {Percentage} from '../../db/data-model';

service PublicService @(path : '/catalog/PublicService') {
  
  entity Projects as projection on db.Projects excluding {
    createdAt, createdBy, modifiedAt, modifiedBy
  }

  entity Assessments as projection on db.Assessments excluding { 
    createdAt, createdBy, modifiedAt, modifiedBy,
  } actions {
    @(
        cds.odata.bindingparameter.name : '_it',
        Common.SideEffects : {
            TargetEntities : ['_it']
        }
    )
    action prefillSalesSplits( 
      @(
        title                       : '{i18n>product}',
        UI.ParameterDefaultValue    : _it.product_ID,
      )
      @readonly @mandatory
      productId : String not null,
      @( 
        title                       : '{i18n>traditionalProductSales} ({i18n>inPercentage})',
        UI.ParameterDefaultValue    : _it.product.traditionalSalesShare
      ) 
      traditionalProductSales : Percentage,
      @( 
        title                       : '{i18n>repairServicesSales} ({i18n>inPercentage})',
        UI.ParameterDefaultValue    : _it.product.repairSalesShare
      )
      repairServicesSales : Percentage,
      @( 
        title                       : '{i18n>reSellSales} ({i18n>inPercentage})',
        UI.ParameterDefaultValue    : _it.product.resellSalesShare
      )
      reSellSales :  Percentage, 
    ) returns String;

    @(
        cds.odata.bindingparameter.name : '_it',
        Common.SideEffects : {
            TargetEntities : ['_it']
        }
    )
    action prefillMaterialSplits( 
      @(
        title                       : '{i18n>product}',
        UI.ParameterDefaultValue    : _it.product_ID
      )
      @mandatory @readonly
      productId : String not null,
    ) returns String;

    @(
        cds.odata.bindingparameter.name : '_it',
        Common.SideEffects : {
            TargetEntities : ['_it']
        }
    )
    action prefillCircularityMetrics( 
      @(
        title                       : '{i18n>product}',
        UI.ParameterDefaultValue    : _it.product_ID
      )
      @mandatory @readonly
      productId : String not null,
    ) returns String;

    @(
        cds.odata.bindingparameter.name : '_it',
        Common.SideEffects : {
            TargetEntities : ['_it']
        }
    )
    action prefillEolProductDesign( 
      @(
        title                       : '{i18n>product}',
        UI.ParameterDefaultValue    : _it.product_ID
      )
      @mandatory @readonly
      productId : String not null,
    ) returns String;
  }

  entity Members as projection on db.Members excluding { 
    createdAt, createdBy, modifiedAt, modifiedBy
  }

  entity Users as select from db.Users {
    *,
    (firstName || ' ' || lastName) as fullName : String
  } excluding {
    iasLocation, shadowId, createdAt, createdBy, modifiedAt, modifiedBy
  };

  
  entity Roles as projection on db.Roles excluding { 
    createdAt, createdBy, modifiedAt, modifiedBy
  }
 
  entity CircularityMetrics as projection on db.CircularityMetrics

  entity SalesSplits as projection on db.SalesSplits

  entity MaterialSplits as projection on db.MaterialSplits

  entity SalesOrders as projection on db.SalesOrders 

  entity Products as projection on db.Products

  entity RecyclingCountries as projection on db.RecyclingCountries 

  entity RecyclingMaterials as projection on db.RecyclingMaterials 

};
