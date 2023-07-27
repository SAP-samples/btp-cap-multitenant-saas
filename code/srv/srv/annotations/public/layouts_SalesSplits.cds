using PublicService as service from '../../public-service';

/**
 * UI.Identification
 */
annotate service.SalesSplits with @(
    Common.SemanticKey : [ID]
); 

annotate service.SalesSplits with @(
    Aggregation.ApplySupported     : {
        Transformations        : [
            'aggregate',
            'topcount',
            'bottomcount',
            'identity',
            'concat',
            'groupby',
            'filter',
            'expand',
            'top',
            'skip',
            'orderby',
            'search'
        ],
        Rollup                 : #None,
        PropertyRestrictions   : true,
        AggregatableProperties : [
        {
             Property : totalRevenue
        },
        {
            Property : traditionalProductSales
        },
        {
            Property : repairServicesSales
        },
        {
            Property : reSellSales
        }],
        GroupableProperties : [ country_code ],
    },
    Analytics.AggregatedProperties : [
        {
            Name                 : 'sumTotalRevenue',
            AggregationMethod    : 'sum',
            AggregatableProperty : 'totalRevenue',
            ![@Common.Label]     : 'Sum Total Revenue'
        },{
            Name                 : 'sumTraditionalProductSales',
            AggregationMethod    : 'sum',
            AggregatableProperty : 'traditionalProductSales',
            ![@Common.Label]     : 'Sum Traditional Product Sales'
        },{
            Name                 : 'sumRepairServicesSales',
            AggregationMethod    : 'sum',
            AggregatableProperty : 'repairServicesSales',
            ![@Common.Label]     : 'Sum Repair Services Sales'
        },{
            Name                 : 'sumReSellSales',
            AggregationMethod    : 'sum',
            AggregatableProperty : 'reSellSales',
            ![@Common.Label]     : 'Sum Resell Sales'
        }
    ],
);


/**
 * UI.LineItem
 */
annotate service.SalesSplits with @(
    UI.LineItem : {
        $value : [
        {
            $Type : 'UI.DataField',
            Value : assessment.product.ID,
            ![@Common.FieldControl] : #ReadOnly,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : totalRevenue,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : traditionalProductSales,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : repairServicesSales,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : reSellSales,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : country_code,
            ![@UI.Importance] : #High
        }
    ]}
);

/**
 * UI.Chart
 */
annotate service.SalesSplits with @(
    UI.Chart #columnChartSalesSplits : {
        ChartType           : #Column,
        Measures            : [sumTotalRevenue],
        Dimensions          : [country_code],
        Title               : '{i18n>chartSalesSplits}',
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : sumTotalRevenue,
            Role    : #Axis1        
        }],
    }
);


/**
 * UI.Chart
 */
annotate service.SalesSplits with @(
    UI.PresentationVariant: {
        Visualizations : [
            '@UI.Chart#columnChartSalesSplits', 
        ]
    }
);