/**
 * OpenAPI 3.0.3 specification for VESDI Dashboard REST API
 * Serves CBS freight transport data (zendingen & deelritten) for Dutch municipalities.
 */
export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'VESDI Dashboard API',
    description:
      'REST API voor het VESDI Dashboard — gemeentelijke data over goederenvervoer (zendingen en deelritten) van het CBS. Onderdeel van het DMI Ecosysteem project.',
    version: '1.0.0',
    license: {
      name: 'EUPL-1.2',
      url: 'https://eupl.eu/1.2/nl/',
    },
    contact: {
      name: 'DMI Ecosysteem',
      url: 'https://github.com/VESDI-project/vesdi-dashboard',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'VESDI API v1',
    },
  ],
  tags: [
    { name: 'Metadata', description: 'Dataset metadata, jaren en lookup-tabellen' },
    { name: 'Raw Data', description: 'Gefilterde en gepagineerde ruwe data' },
    { name: 'Aggregations', description: 'Geaggregeerde KPIs, trends en verdelingen' },
    { name: 'Sync', description: 'Data synchronisatie vanuit de client' },
  ],

  // ─── Reusable Components ───
  components: {
    parameters: {
      DatasetId: {
        name: 'dataset_id',
        in: 'query',
        required: false,
        description: 'Dataset ID. Indien niet opgegeven wordt de meest recente dataset gebruikt.',
        schema: { type: 'string' },
      },
      Year: {
        name: 'year',
        in: 'query',
        required: false,
        description: 'Filterjaar (bijv. 2021)',
        schema: { type: 'integer' },
      },
      Euronorm: {
        name: 'euronorm',
        in: 'query',
        required: false,
        description: 'Euronormklasse filter (bijv. "6")',
        schema: { type: 'string' },
      },
      LaadEmissiezone: {
        name: 'laad_emissiezone',
        in: 'query',
        required: false,
        description: 'Laad emissiezone filter ("ja" of "nee")',
        schema: { type: 'string' },
      },
      LosEmissiezone: {
        name: 'los_emissiezone',
        in: 'query',
        required: false,
        description: 'Los emissiezone filter ("ja" of "nee")',
        schema: { type: 'string' },
      },
      Handelsrichting: {
        name: 'handelsrichting',
        in: 'query',
        required: false,
        description: 'Handelsrichting filter',
        schema: { type: 'string', enum: ['import', 'export'] },
      },
      VoertuigType: {
        name: 'voertuig_type',
        in: 'query',
        required: false,
        description: 'Voertuigsoort RDW code filter',
        schema: { type: 'integer' },
      },
      Direction: {
        name: 'direction',
        in: 'query',
        required: false,
        description: 'Richting voor geografische aggregatie',
        schema: { type: 'string', enum: ['laad', 'los'], default: 'laad' },
      },
      Page: {
        name: 'page',
        in: 'query',
        required: false,
        description: 'Paginanummer (1-indexed)',
        schema: { type: 'integer', default: 1, minimum: 1 },
      },
      PageSize: {
        name: 'page_size',
        in: 'query',
        required: false,
        description: 'Aantal resultaten per pagina (max 1000)',
        schema: { type: 'integer', default: 100, minimum: 1, maximum: 1000 },
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
            required: ['code', 'message'],
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          page_size: { type: 'integer' },
          total: { type: 'integer' },
          total_pages: { type: 'integer' },
        },
        required: ['page', 'page_size', 'total', 'total_pages'],
      },
      Municipality: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Gemeentecode' },
          name: { type: 'string', description: 'Gemeentenaam' },
        },
      },
      LookupEntry: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          omschrijving: { type: 'string' },
        },
      },
      ZendingRow: {
        type: 'object',
        description: 'Een zendingrecord met alle ruwe en afgeleide velden',
        properties: {
          jaar: { type: 'integer' },
          laadPC6: { type: 'string' },
          laadPC4: { type: 'string' },
          laadGemeente: { type: 'string' },
          laadNuts3: { type: 'string' },
          losPC6: { type: 'string' },
          losPC4: { type: 'string' },
          losGemeente: { type: 'string' },
          losNuts3: { type: 'string' },
          stadslogistieke_klasse_code: { type: 'integer' },
          euronormKlasse: { type: 'string' },
          brandstofsoortKlasse: { type: 'integer' },
          dummy_laadInROI: { type: 'integer' },
          dummy_losInROI: { type: 'integer' },
          zendingAantal: { type: 'integer' },
          brutoGewicht: { type: 'number' },
          zendingAfstandGemiddeld: { type: 'number' },
          laad_zone_emissiezonePC6: { type: 'string', nullable: true },
          los_zone_emissiezonePC6: { type: 'string', nullable: true },
          LaadLand: { type: 'string', nullable: true },
          LosLand: { type: 'string', nullable: true },
          isNational: { type: 'boolean', nullable: true },
          isInternational: { type: 'boolean', nullable: true },
          isImport: { type: 'boolean', nullable: true },
          isExport: { type: 'boolean', nullable: true },
          stadslogistieke_klasse: { type: 'string', nullable: true },
        },
      },
      DeelritRow: {
        type: 'object',
        description: 'Een deelritrecord met alle ruwe en afgeleide velden',
        properties: {
          jaar: { type: 'integer' },
          voertuigsoortRDW: { type: 'integer' },
          laadPC6: { type: 'string' },
          laadPC4: { type: 'string' },
          laadGemeente: { type: 'string' },
          laadNuts3: { type: 'string' },
          losPC6: { type: 'string' },
          losPC4: { type: 'string' },
          losGemeente: { type: 'string' },
          losNuts3: { type: 'string' },
          stadslogistieke_klasse_code: { type: 'integer' },
          euronormKlasse: { type: 'string' },
          brandstofsoortKlasse: { type: 'integer' },
          aantalDeelritten: { type: 'integer' },
          aantalLegeDeelritten: { type: 'integer' },
          brutoGewicht: { type: 'number' },
          deelritAfstandGemiddeld: { type: 'number' },
          beladingsgraadGewichtGemiddeld: { type: 'number' },
          LaadLand: { type: 'string', nullable: true },
          LosLand: { type: 'string', nullable: true },
          isNational: { type: 'boolean', nullable: true },
          isInternational: { type: 'boolean', nullable: true },
          voertuigsoort: { type: 'string', nullable: true },
          stadslogistieke_klasse: { type: 'string', nullable: true },
        },
      },
      KpiZendingen: {
        type: 'object',
        properties: {
          zendingAantal: { type: 'integer', description: 'Totaal aantal zendingen' },
          brutoGewicht: { type: 'number', description: 'Totaal brutogewicht (kg)' },
        },
      },
      KpiDeelritten: {
        type: 'object',
        properties: {
          aantalDeelritten: { type: 'integer', description: 'Totaal aantal deelritten' },
          brutoGewicht: { type: 'number', description: 'Totaal brutogewicht (kg)' },
          beladingsgraad: { type: 'number', description: 'Gewogen gemiddelde beladingsgraad (0-1)' },
        },
      },
      TrendZendingen: {
        type: 'object',
        properties: {
          year: { type: 'integer' },
          zendingAantal: { type: 'integer' },
          brutoGewicht: { type: 'number' },
        },
      },
      TrendDeelritten: {
        type: 'object',
        properties: {
          year: { type: 'integer' },
          aantalDeelritten: { type: 'integer' },
          kmsIntraMunicipaal: { type: 'number' },
        },
      },
      TrendEuro6: {
        type: 'object',
        properties: {
          year: { type: 'integer' },
          percentage: { type: 'number', description: 'Euro-6 aandeel (0-1)' },
          euro6Trips: { type: 'integer' },
          totalTrips: { type: 'integer' },
        },
      },
      Nuts3Aggregation: {
        type: 'object',
        properties: {
          nuts3: { type: 'string' },
          count: { type: 'integer' },
          percentage: { type: 'number' },
        },
      },
      PC4Aggregation: {
        type: 'object',
        properties: {
          pc4: { type: 'string' },
          count: { type: 'integer' },
          weight: { type: 'number' },
        },
      },
      CountryAggregation: {
        type: 'object',
        properties: {
          countryCode: { type: 'string', description: 'ISO 3166-1 alpha-2 landcode' },
          geladenAantal: { type: 'integer', description: 'Aantal geladen in buitenland (import)' },
          gelostAantal: { type: 'integer', description: 'Aantal gelost in buitenland (export)' },
        },
      },
      Distribution: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          value: { type: 'integer' },
        },
      },
    },
  },

  // ─── Paths ───
  paths: {
    '/data/sync': {
      post: {
        tags: ['Sync'],
        summary: 'Synchroniseer data naar de database',
        description:
          'Ontvangt verwerkte zendingen- en deelrittendata en slaat deze op in PostgreSQL. Wordt automatisch aangeroepen na client-side bestandsverwerking.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['municipality', 'years'],
                properties: {
                  municipality: { $ref: '#/components/schemas/Municipality' },
                  years: { type: 'array', items: { type: 'integer' } },
                  zendingenByYear: {
                    type: 'object',
                    additionalProperties: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ZendingRow' },
                    },
                  },
                  deelrittenByYear: {
                    type: 'object',
                    additionalProperties: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DeelritRow' },
                    },
                  },
                  lookup: { type: 'object', nullable: true },
                  nutsMapping: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Data succesvol gesynchroniseerd',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        synced: { type: 'boolean' },
                        municipality: { type: 'string' },
                        years: { type: 'array', items: { type: 'integer' } },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/schemas/ErrorResponse' },
          '500': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },

    '/metadata/years': {
      get: {
        tags: ['Metadata'],
        summary: 'Beschikbare jaren',
        description: 'Geeft de beschikbare datajaren voor de dataset.',
        parameters: [{ $ref: '#/components/parameters/DatasetId' }],
        responses: {
          '200': {
            description: 'Lijst van jaren',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { type: 'integer' } },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },

    '/metadata/municipality': {
      get: {
        tags: ['Metadata'],
        summary: 'Gemeente-informatie',
        description: 'Geeft de gemeente-informatie van de dataset.',
        parameters: [{ $ref: '#/components/parameters/DatasetId' }],
        responses: {
          '200': {
            description: 'Gemeente-informatie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Municipality' } },
                },
              },
            },
          },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },

    '/metadata/lookup/{table}': {
      get: {
        tags: ['Metadata'],
        summary: 'Lookup-tabel opvragen',
        description:
          'Geeft de entries van een lookup-tabel (bijv. voertuigsoortRDW, brandstofsoort).',
        parameters: [
          { $ref: '#/components/parameters/DatasetId' },
          {
            name: 'table',
            in: 'path',
            required: true,
            description: 'Naam van de lookup-tabel',
            schema: {
              type: 'string',
              enum: [
                'voertuigsoortRDW',
                'brandstofsoort',
                'laadvermogenCombinatie',
                'maxToegestaanGewicht',
                'leeggewichtCombinatie',
                'logistiekeKlasse',
                'legeRit',
                'nuts3',
                'gemeentecode',
              ],
            },
          },
        ],
        responses: {
          '200': {
            description: 'Lookup entries',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/LookupEntry' },
                    },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/schemas/ErrorResponse' },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },

    '/zendingen': {
      get: {
        tags: ['Raw Data'],
        summary: 'Zendingen opvragen',
        description:
          'Geeft gefilterde en gepagineerde zendingenrecords. Alle filterparameters zijn optioneel.',
        parameters: [
          { $ref: '#/components/parameters/DatasetId' },
          { $ref: '#/components/parameters/Year' },
          { $ref: '#/components/parameters/Euronorm' },
          { $ref: '#/components/parameters/LaadEmissiezone' },
          { $ref: '#/components/parameters/LosEmissiezone' },
          { $ref: '#/components/parameters/Handelsrichting' },
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/PageSize' },
        ],
        responses: {
          '200': {
            description: 'Gepagineerde zendingenlijst',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ZendingRow' },
                    },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },

    '/deelritten': {
      get: {
        tags: ['Raw Data'],
        summary: 'Deelritten opvragen',
        description:
          'Geeft gefilterde en gepagineerde deelritrecords. Alle filterparameters zijn optioneel.',
        parameters: [
          { $ref: '#/components/parameters/DatasetId' },
          { $ref: '#/components/parameters/Year' },
          { $ref: '#/components/parameters/Euronorm' },
          { $ref: '#/components/parameters/LaadEmissiezone' },
          { $ref: '#/components/parameters/LosEmissiezone' },
          { $ref: '#/components/parameters/Handelsrichting' },
          { $ref: '#/components/parameters/VoertuigType' },
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/PageSize' },
        ],
        responses: {
          '200': {
            description: 'Gepagineerde deelrittenlijst',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DeelritRow' },
                    },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },

    '/aggregations/kpis/zendingen': {
      get: {
        tags: ['Aggregations'],
        summary: 'KPIs zendingen',
        description: 'Totaal aantal zendingen en brutogewicht.',
        parameters: [
          { $ref: '#/components/parameters/DatasetId' },
          { $ref: '#/components/parameters/Year' },
          { $ref: '#/components/parameters/Euronorm' },
          { $ref: '#/components/parameters/LaadEmissiezone' },
          { $ref: '#/components/parameters/LosEmissiezone' },
          { $ref: '#/components/parameters/Handelsrichting' },
        ],
        responses: {
          '200': {
            description: 'Zendingen KPIs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/KpiZendingen' } },
                },
              },
            },
          },
        },
      },
    },

    '/aggregations/kpis/deelritten': {
      get: {
        tags: ['Aggregations'],
        summary: 'KPIs deelritten',
        description:
          'Totaal aantal deelritten, brutogewicht en gewogen gemiddelde beladingsgraad.',
        parameters: [
          { $ref: '#/components/parameters/DatasetId' },
          { $ref: '#/components/parameters/Year' },
          { $ref: '#/components/parameters/Euronorm' },
          { $ref: '#/components/parameters/LaadEmissiezone' },
          { $ref: '#/components/parameters/LosEmissiezone' },
          { $ref: '#/components/parameters/Handelsrichting' },
        ],
        responses: {
          '200': {
            description: 'Deelritten KPIs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/KpiDeelritten' } },
                },
              },
            },
          },
        },
      },
    },

    '/aggregations/trends/zendingen': {
      get: {
        tags: ['Aggregations'],
        summary: 'Trend zendingen per jaar',
        description: 'Aantal zendingen en brutogewicht gegroepeerd per jaar.',
        parameters: [{ $ref: '#/components/parameters/DatasetId' }],
        responses: {
          '200': {
            description: 'Jaarlijkse trends',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TrendZendingen' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/aggregations/trends/deelritten': {
      get: {
        tags: ['Aggregations'],
        summary: 'Trend deelritten per jaar',
        description:
          'Nationale deelritten en intra-municipale kilometers per jaar.',
        parameters: [{ $ref: '#/components/parameters/DatasetId' }],
        responses: {
          '200': {
            description: 'Jaarlijkse trends',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TrendDeelritten' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/aggregations/trends/euro6': {
      get: {
        tags: ['Aggregations'],
        summary: 'Euro-6 percentage per jaar',
        description: 'Aandeel Euro-6 voertuigen in nationale deelritten per jaar.',
        parameters: [{ $ref: '#/components/parameters/DatasetId' }],
        responses: {
          '200': {
            description: 'Euro-6 trends',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TrendEuro6' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/aggregations/geo/nuts3/zendingen': {
      get: {
        tags: ['Aggregations'],
        summary: 'NUTS3 verdeling zendingen',
        description: 'Zendingen gegroepeerd per NUTS3-regio.',
        parameters: [
          { $ref: '#/components/parameters/DatasetId' },
          { $ref: '#/components/parameters/Year' },
          { $ref: '#/components/parameters/Euronorm' },
          { $ref: '#/components/parameters/Direction' },
        ],
        responses: {
          '200': {
            description: 'NUTS3 aggregatie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Nuts3Aggregation' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/aggregations/geo/pc4/deelritten': {
      get: {
        tags: ['Aggregations'],
        summary: 'PC4 verdeling deelritten',
        description: 'Deelritten gegroepeerd per 4-cijferig postcodegebied.',
        parameters: [
          { $ref: '#/components/parameters/DatasetId' },
          { $ref: '#/components/parameters/Year' },
          { $ref: '#/components/parameters/Euronorm' },
          { $ref: '#/components/parameters/Direction' },
        ],
        responses: {
          '200': {
            description: 'PC4 aggregatie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/PC4Aggregation' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/aggregations/international/countries': {
      get: {
        tags: ['Aggregations'],
        summary: 'Internationale zendingen per land',
        description:
          'Aantal geladen en geloste zendingen per buitenlands land.',
        parameters: [
          { $ref: '#/components/parameters/DatasetId' },
          { $ref: '#/components/parameters/Year' },
          { $ref: '#/components/parameters/Euronorm' },
          { $ref: '#/components/parameters/Handelsrichting' },
        ],
        responses: {
          '200': {
            description: 'Landaggregatie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CountryAggregation' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/aggregations/distributions/{type}': {
      get: {
        tags: ['Aggregations'],
        summary: 'Verdelingen',
        description:
          'Verdeling per type: emissiezone, brandstof, gewichtsklasse of voertuigcategorie.',
        parameters: [
          { $ref: '#/components/parameters/DatasetId' },
          { $ref: '#/components/parameters/Year' },
          { $ref: '#/components/parameters/Euronorm' },
          { $ref: '#/components/parameters/Direction' },
          {
            name: 'type',
            in: 'path',
            required: true,
            description: 'Type verdeling',
            schema: {
              type: 'string',
              enum: ['emissiezone', 'brandstof', 'gewichtsklasse', 'voertuigcategorie'],
            },
          },
        ],
        responses: {
          '200': {
            description: 'Verdelingsdata',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Distribution' },
                    },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
  },
} as const;
