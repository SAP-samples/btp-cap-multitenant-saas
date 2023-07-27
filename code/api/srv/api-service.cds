using { susaas.db, sap.common } from '../../db/data-model';

annotate sap.common.Countries with @cds.autoexpose: false;
annotate sap.common.Languages with @cds.autoexpose: false;
annotate sap.common.Currencies with @cds.autoexpose: false;

service ApiService @(path : '/rest/api', protocol:'rest', requires: 'authenticated-user', impl: 'srv/api-service' ){

     // Sample entities for CREATE, READ, UPDATE, DELETE
     entity Products as select * from db.Products;
     entity SalesOrders as select * from db.SalesOrders;
     entity RecyclingCountries as select * from db.RecyclingCountries;
     entity RecyclingMaterials as select * from db.RecyclingMaterials;

     // Sample actions for simultaneous bulk "UPSERT"
     action bulkUpsertProducts( products : many Products ) returns String;
     action bulkUpsertSalesOrders( salesOrders : many SalesOrders ) returns String;
     action bulkUpsertRecyclingCountries( recyclingCountries : many RecyclingCountries ) returns String;
     action bulkUpsertRecyclingMaterials( recyclingMaterials : many RecyclingMaterials ) returns String;

     // Sample action for simultaneous bulk "DELETE" and consecutive "INSERT"
     action bulkInsertProducts( products : many Products ) returns String;

     // Sample action for sequential bulk "UPDATE"
     action bulkUpdateProducts( products : many Products ) returns String;

     // Sample action for simultaneous bulk UPSERT using HANA stored procedure
     // Not working during local development using SQLITE!
     action bulkUpsertProcSalesOrders( salesOrders : many SalesOrders ) returns String;
}