using PublicService as service from '../../public-service';

/**
    UI.Identification
 */
annotate service.CircularityMetrics with @(
    Common.SemanticKey  : [ID]
);

/**
    UI.LineItems
 */
annotate service.CircularityMetrics with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : assessment.product.ID,
            ![@Common.FieldControl] : #ReadOnly,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : countryRecyclability_code,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Value : eoLRecyclability,
            ![@UI.Importance] : #High
        }
    ]
);

/**
    Aggregations
 */

annotate service.CircularityMetrics with @(
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
        AggregatableProperties : [{
             Property : eoLRecyclability
        }],
        GroupableProperties : [countryRecyclability_code]
    }
);



/**
    Analytics
 */

annotate service.CircularityMetrics with @(
    Analytics.AggregatedProperties : [
        {
            Name                 : 'sumEoLRecyclability',
            AggregationMethod    : 'sum',
            AggregatableProperty : 'eoLRecyclability',
            ![@Common.Label]     : 'Sum {i18n>eolRecyclability}'
        }
    ]
);


/**
 * UI.Charts
 */
annotate service.CircularityMetrics with @(
    UI.Chart #columnChartCircularityMetrics : {
        ChartType           : #Column,
        Measures            : [sumEoLRecyclability],
        Dimensions          : [countryRecyclability_code],
        Title               : '{i18n>chartCircularityMetrics}',
        MeasureAttributes   : [{
            $Type   : 'UI.ChartMeasureAttributeType',
            Measure : sumEoLRecyclability,
            Role    : #Axis1        
        }]
    }
);


/**
 * UI.PresentationVariants
 */
annotate service.CircularityMetrics with @(
    UI.PresentationVariant #Chart: {
        Visualizations : ['@UI.Chart#columnChartCircularityMetrics']
    }
);