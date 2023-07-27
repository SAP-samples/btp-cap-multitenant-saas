using {susaas.db as db} from '../../db/data-model';

service AdminService @(path : '/catalog/AdminService') {
  
  entity Projects as projection on db.Projects excluding {
    createdAt,createdBy,modifiedAt,modifiedBy
  }

  entity Members as projection on db.Members excluding {
    createdAt,createdBy,modifiedAt,modifiedBy
  }

  entity Users as select from db.Users {
    *,
    (firstName || ' ' || lastName) as fullName : String 
  } excluding {
    createdAt,createdBy,modifiedAt,modifiedBy,
    iasLocation,shadowId
  };

  entity Roles as projection on db.Roles excluding {
    createdAt,createdBy,modifiedAt,modifiedBy
  }

  entity Assessments as projection on db.Assessments excluding {
    salesSplits, materialSplits, circularityMetrics, eolProductDesign,
    createdAt,createdBy,modifiedAt,modifiedBy
  }

  entity Products as projection on db.Products

};

