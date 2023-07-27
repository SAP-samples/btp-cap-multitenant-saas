using {
      sap
} from '@sap/cds/common';

type Percentage : Decimal(5,2) @assert.range: [0,100] @Measures.Unit : '%';
