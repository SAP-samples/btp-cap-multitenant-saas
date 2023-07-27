using {susaas.db as db} from '../../../db/data-model';

annotate db.Projects with @title : '{i18n>project.typeNamePlural}' {
    ID           @title          : '{i18n>project}' @Common.Text : description @Common.TextArrangement : #TextOnly;
    description  @title          : '{i18n>description}';
    validFrom    @title          : '{i18n>validFrom}';
    validTo      @title          : '{i18n>validTo}';
    // associations
    members      @title          : '{i18n>member.typeNamePlural}';
    assessments @title          : '{i18n>assessment.typeNamePlural}';
};

annotate db.Members with @title : '{i18n>member.typeNamePlural}' {
    // associations
    user    @title              : '{i18n>user}'  @Common.Text : user.fullName  @Common.TextArrangement : #TextOnly;
    project @title              : '{i18n>project}'  @Common.Text : project.description  @Common.TextArrangement : #TextOnly;
};

annotate db.Users with @title : '{i18n>user.typeNamePlural}' {
    ID          @title        : '{i18n>user}' @Common.Text : fullName  @Common.TextArrangement : #TextOnly;
    email       @title        : '{i18n>email}';
    firstName   @title        : '{i18n>firstName}';
    lastName    @title        : '{i18n>lastName}';
    shadowId    @title        : '{i18n>shadowId}';
    iasLocation @title        : '{i18n>iasLocation}';
    // associations
    role        @title        : '{i18n>role}'  @Common.Text : role.description  @Common.TextArrangement : #TextSeparate;
};

annotate db.Assessments with @title : '{i18n>assessment.typeNamePlural}' {
    ID               @title          : '{i18n>assessment}';
    description      @title          : '{i18n>description}';
    eolProductDesign @title          : '{i18n>eolProductDesign}';
    // associations
    product          @title          : '{i18n>product}'  @Common.Text : product.text  @Common.TextArrangement        : #TextOnly;
    project          @title          : '{i18n>project}'  @Common.Text : project.description  @Common.TextArrangement : #TextOnly;
};


annotate db.Roles with @title : '{i18n>role.typeNamePlural}' {
    ID          @title        : '{i18n>role}';
    description @title        : '{i18n>description}';
};


annotate db.MaterialSplits with @title : '{i18n>materialSplit.typeNamePlural}' {
    ID            @title               : '{i18n>materialSplit}';
    materialCode  @title               : '{i18n>materialCode}';
    materialType  @title               : '{i18n>materialType}';
    weightShare   @title               : '{i18n>weightShare}';
    shareRecycled @title               : '{i18n>shareRecycled}';
};

annotate db.CircularityMetrics with @title : '{i18n>circularityMetric.typeNamePlural}' {
    ID                   @title            : '{i18n>circularityMetric}';
    countryRecyclability @title            : '{i18n>countryRecyclability}'  @Common.Text : countryRecyclability.name  @Common.TextArrangement : #TextFirst;
    eoLRecyclability     @title            : '{i18n>eolRecyclability}';
};

annotate db.SalesSplits with @title : '{i18n>salesSplit.typeNamePlural}' {
    ID                      @title  : '{i18n>salesSplit}';
    totalRevenue            @title  : '{i18n>totalRevenue}';
    traditionalProductSales @title  : '{i18n>traditionalProductSales}';
    repairServicesSales     @title  : '{i18n>repairServicesSales}';
    reSellSales             @title  : '{i18n>reSellSales}';
    currency                @title  : '{i18n>currencyCode}'  @Common.Text : currency.name  @Common.TextArrangement : #TextFirst;
    country                 @title  : '{i18n>country}'  @Common.Text : country.name  @Common.TextArrangement : #TextFirst;
};


annotate db.Products with @title : '{i18n>product.typeNamePlural}' {
    ID                    @title : '{i18n>product}'  @Common.Text : text  @Common.TextArrangement : #TextFirst;
    text                  @title : '{i18n>text}';
    eolProductDesign      @title : '{i18n>eolProductDesign}';
    traditionalSalesShare @title : '{i18n>traditionalProductSales}';
    repairSalesShare      @title : '{i18n>repairServicesSales}';
    resellSalesShare      @title : '{i18n>reSellSales}';
};
