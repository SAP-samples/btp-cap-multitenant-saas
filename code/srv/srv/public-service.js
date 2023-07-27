import cds from '@sap/cds';

export default cds.service.impl(async function() {

    const {
        SalesOrders,
        SalesSplits,
        Assessments,
        Products,
        RecyclingMaterials,
        RecyclingCountries,
        MaterialSplits,
        CircularityMetrics
    } = this.entities;

    this.on('prefillSalesSplits', Assessments, async (req) => {
        try {
            const { productId, traditionalProductSales, repairServicesSales, reSellSales } = req.data;
            const [id] = req.params;

            // Check if entity in draft state exists and is locked
            let entity = await SELECT.one.from(Assessments).where `ID = ${id.ID}`;

            // Reject action if entity currently locked
            if (entity && entity.HasDraftEntity) {
                req.error(409, 'error.action.entity_in_draft_state');
                return;
            }

             // Reject if percentage sum !== 100
            if ((parseFloat(traditionalProductSales) + parseFloat(repairServicesSales) + parseFloat(reSellSales)) != 100
                && parseFloat(traditionalProductSales) + parseFloat(repairServicesSales) + parseFloat(reSellSales) != 1 ) {
                req.error(500, 'error.action.wrong_perc_add_up');
                return;
            }

            const salesData = await SELECT.from(SalesOrders)
                .columns`{  
                    ${id.ID} as assessment_ID,
                    country_code as country_code,
                    currency_code as currency_code,
                    grossAmount as totalRevenue ,
                    grossAmount * ( ${parseFloat(traditionalProductSales)/(parseFloat(traditionalProductSales) > 1 ? 100 : 1)}) as traditionalProductSales ,
                    grossAmount * ( ${parseFloat(repairServicesSales)/(parseFloat(repairServicesSales) > 1 ? 100 : 1)}) as repairServicesSales ,
                    grossAmount * ( ${parseFloat(reSellSales)/(parseFloat(reSellSales) > 1 ? 100 : 1)}) as reSellSales,
                }`
                .groupBy `country_code, currency_code, grossAmount`
                .where `product_ID = ${productId}`
            
            if(!salesData || salesData.length === 0){
                req.error(500, 'error.action.no_prefill_data');
                return;
            }

            await DELETE.from(SalesSplits).where `assessment_ID = ${id.ID}`;
            await INSERT.into(SalesSplits).entries(salesData);

            req.notify('success.action.values_prefilled');

        } catch (err) {
            req.reject(500, 'error.action.generic_error' , [err]);
        }
    });

    this.on('prefillMaterialSplits', Assessments, async (req) => {
        try {
            const { productId } = req.data;
            const [id] = req.params;

            // Check if entity in draft state exists and is locked
            let entity = await SELECT
                .one
                .from(Assessments)
                .where `ID = ${id.ID}`;

            // Reject action if entity currently locked
            if (entity && entity.HasDraftEntity) {
                req.error(409, 'error.action.entity_in_draft_state');
                return;
            }

            const materialsData = await SELECT.from(RecyclingMaterials)
                .columns`{  
                    ${id.ID} as assessment_ID,
                    material as materialCode,
                    materialName as materialType,
                    weightShare as weightShare,
                    recycleShare as shareRecycled
                }`
                .where`product_ID = ${productId}`
            
            if(!materialsData || materialsData.length === 0){
                req.error(500, 'error.action.no_prefill_data');
                return;
            }

            await DELETE.from(MaterialSplits).where`assessment_ID = ${id.ID}`;
            await INSERT.into(MaterialSplits).entries(materialsData);

            req.notify('success.action.values_prefilled');

        } catch (err) {
            req.reject(500, 'error.action.generic_error' , [err]);
        }
    });


    this.on('prefillCircularityMetrics', Assessments, async (req) => {
        try {
            const { productId } = req.data;
            const [id] = req.params;

            // Check if entity in draft state exists and is locked
            let entity = await SELECT
                .one
                .from(Assessments)
                .where
                `ID = ${id.ID}`;

            // Reject action if entity currently locked
            if (entity && entity.HasDraftEntity) {
                req.error(409, 'error.action.entity_in_draft_state');
                return;
            }

            const circularityData = await SELECT.from(RecyclingCountries)
                .columns`{  
                    ${id.ID} as assessment_ID,
                    country_code as countryRecyclability_code,
                    eolRecyclability as eoLRecyclability
                }`
                .where`product_ID = ${productId}`
                        
            if(!circularityData || circularityData.length === 0){
                req.error(500, 'error.action.no_prefill_data');
                return;
            }

            await DELETE.from(CircularityMetrics).where`assessment_ID = ${id.ID}`;
            await INSERT.into(CircularityMetrics).entries(circularityData);

            req.notify('success.action.values_prefilled');

        } catch (err) {
            req.reject(500, 'error.action.generic_error' , [err]);
        }
    });


    this.on('prefillEolProductDesign', Assessments, async (req) => {
        try {
            const { productId } = req.data;
            const [id] = req.params;

            // Check if entity in draft state exists and is locked
            let entity = await SELECT
                .one
                .from(Assessments)
                .where
                `ID = ${id.ID}`;

            // Reject action if entity currently locked
            if (entity && entity.HasDraftEntity) {
                req.reject(409, 'error.action.entity_in_draft_state');
            }

            const eolProductDesign = await SELECT.from(Products)
                .columns`{  
                    eolProductDesign as eolProductDesign,
                }`
                .where`ID = ${productId}`
            
            if(!eolProductDesign || eolProductDesign.length === 0){
                req.error(500, 'error.action.no_prefill_data');
            }

            await UPDATE(Assessments).set`eolProductDesign = ${eolProductDesign[0].eolProductDesign}`.where`ID = ${id.ID}`

            req.notify('success.action.values_prefilled');

        } catch (err) {
            req.reject(500, 'error.action.generic_error' , [err]);
        }
    });

    this.on('userInfo', req => {
        let results = {};
        results.user = req.user.id;
        let username = req.req.authInfo.getGivenName();
        if (req.user.hasOwnProperty('locale')) {
            results.locale = req.user.locale;
        }
        if (username) {
            results.givenName = username;
        }
        results.scopes = {};
        results.scopes.identified = req.user.is('identified-user');
        results.scopes.authenticated = req.user.is('authenticated-user');
        results.scopes.Member = req.user.is('Member');
        results.scopes.Admin = req.user.is('Admin');
        results.tenant = req.user.tenant;
        results.scopes.ExtendCDS = req.user.is('ExtendCDS');
        results.scopes.ExtendCDSdelete = req.user.is('ExtendCDSdelete');
        return results;
    });
});