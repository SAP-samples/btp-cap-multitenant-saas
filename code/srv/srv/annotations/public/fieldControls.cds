using PublicService from '../../public-service';

// ========================
// Projects
// ========================

// Projects cannot be maintained by Catalog Service users
annotate PublicService.Projects {
    ID           @UI.Hidden @readonly;
    description  @UI.HiddenFilter;
};


// ========================
// Users
// ========================

// Users cannot be maintained by Catalog Service users
annotate PublicService.Users {
    ID @UI.Hidden;
    fullName @UI.HiddenFilter;
};


// ========================
// Assessments
// ========================

annotate PublicService.Assessments {
    ID                 @UI.Hidden @readonly @mandatory;
    description        @UI.HiddenFilter @mandatory;
    eolProductDesign   @UI.HiddenFilter;
    
    // associations
    project            @Core.Immutable @mandatory;
    product            @Core.Immutable @mandatory;
};

// ========================
// Circularity Metrics
// ========================

annotate PublicService.CircularityMetrics {
    ID @UI.Hidden  @readonly  @mandatory;
    countryRecyclability @UI.HiddenFilter @mandatory;
    eoLRecyclability     @UI.HiddenFilter @mandatory;
};

// ========================
// Sales Splits
// ========================

annotate PublicService.SalesSplits {
    ID                      @UI.Hidden  @readonly  @mandatory;
    totalRevenue            @UI.HiddenFilter @mandatory;
    traditionalProductSales @UI.HiddenFilter;
    repairServicesSales     @UI.HiddenFilter;
    reSellSales             @UI.HiddenFilter;
    currency                @mandatory;
    country                 @mandatory;
};

// ========================
// Material Splits
// ========================

annotate PublicService.MaterialSplits {
    ID              @UI.Hidden  @readonly  @mandatory;
    materialCode    @mandatory;
    materialType    @mandatory;
    weightShare     @mandatory @UI.HiddenFilter;
    shareRecycled   @mandatory @UI.HiddenFilter;
};

// ========================
// Roles
// ========================

// Roles cannot be maintained by Catalog Service users
annotate PublicService.Roles {
    ID @UI.Hidden;
};
