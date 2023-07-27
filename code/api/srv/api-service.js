import cds from '@sap/cds';

class ApiService extends cds.ApplicationService {
  async init() {
    const { Products, SalesOrders, RecyclingCountries, RecyclingMaterials } = this.entities;
    
    // register your event handlers...
    this.on("bulkUpsertProducts", async (req) => {
      try {
        let upload = req.data.products;

        // Upsert Products using CAP Upsert feature
        await UPSERT.into (Products, upload);

        return "Records successfully updated!" 
  
        } catch(error){
          return req.error(404,`Error occured during upload": ${error}`)
        }
    });

    
    this.on("bulkUpsertSalesOrders", async (req) => {
      try {
        let upload = req.data.salesOrders;

        // Upsert SalesOrders using CAP Upsert feature
        await UPSERT.into (SalesOrders, upload);
        
        return "Records successfully updated!" 
  
        } catch(error){
          return req.error(404,`Error occured during upload": ${error}`)
        }
    });


    this.on("bulkUpsertRecyclingCountries", async (req) => {
      try {
        let upload = req.data.recyclingCountries;

        // Upsert Recycling Countries using CAP Upsert feature
        await UPSERT.into (RecyclingCountries, upload);

        return "Records successfully updated!" 
  
        } catch(error){
          return req.error(404,`Error occured during upload": ${error}`)
        }
    });


    this.on("bulkUpsertRecyclingMaterials", async (req) => {
      try {
        let upload = req.data.recyclingMaterials;

        // Upsert Recycling Materials using CAP Upsert feature
        await UPSERT.into (RecyclingMaterials, upload);

        return "Records successfully updated!" 
  
        } catch(error){
          return req.error(404,`Error occured during upload": ${error}`)
        }
    });

    
    this.on("bulkInsertProducts", async (req) => {
      try {
        let upload = req.data.products;
  
        // Delete all existing purchase orders
        await DELETE.from (Products);
  
        // Insert uploaded products
        await INSERT.into (Products, upload);
  
        return "Records successfully uploaded!" 
  
      } catch(error){
        return req.error(404,`Error occured during upload": ${error}`)
      }
    });
  
    
    this.on("bulkUpdateProducts", async (req) => {
      try {
        let upload = req.data.products;
  
        upload.forEach(async(product) => {
          await UPDATE (Products, product.ID) .with (product)
        });
  
        return "Records successfully updated!" 
  
        } catch(error){
          return req.error(404,`Error occured during upload": ${error}`)
        }
    });
  
    
    this.on("bulkUpsertProcSalesOrders", async (req) => {
      try {
        let upload = JSON.stringify(req.data);
        res = await cds.run(`CALL SUSAAS_DB_UPSERT_SALES_ORDERS(salesOrders => ?, result => ?)`, [upload]);
        
        return "Records successfully uploaded!" 
  
      } catch(error){
        return req.error(404,`Error occured during upload": ${error}`)
      }
    });

    // ensure to call super.init()
    await super.init() 
  }
}

export { ApiService }