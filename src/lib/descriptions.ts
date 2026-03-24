// Dutch descriptions for tooltips and page documentation

export const PAGE_DESCRIPTIONS = {
  voorblad: 'Het voorblad van het gemeentelijk VESDI-dashboard.',
  introductie: 'Achtergrond en navigatie voor het VESDI-dashboard.',
  trends:
    'Overzicht van trends over meerdere jaren: aantal deelritten, Euro-6 percentage, zendingen en beladingsgraad.',
  zendingenOverzicht:
    'Geografisch overzicht van zendingen naar en vanuit de gemeente op NUTS3-niveau.',
  nationaleZendingen:
    'Analyse van binnenlandse zendingen: aantallen, gewichten en verdeling per stadslogistieke klasse.',
  internationaleZendingen:
    'Analyse van grensoverschrijdende zendingen: import/export verdeling, handelspartners en emissiezone.',
  nationaleDeelritten:
    'Analyse van binnenlandse deelritten: aantallen, gewichten, brandstof, voertuig- en gewichtsklasse.',
  nationaleDeelrittenPostcode:
    'Gedetailleerde analyse per postcode: laad- en loslocaties met kaarten en voertuiginformatie.',
  routekaart:
    'Routekaart op basis van herkomst-bestemmingsparen. Kleurschaal geeft het aantal deelritten weer.',
  internationaleDeelrittenOverzicht:
    'Geografisch overzicht van internationale deelritten naar en vanuit de gemeente op NUTS3-niveau.',
  internationaleDeelritten:
    'Detailanalyse van internationale deelritten: handelspartners, voertuigkenmerken en postcode.',
  externeLinks:
    'Links naar relevante externe bronnen en documentatie.',
  definities:
    'Verklarende woordenlijst van begrippen die in het VESDI-dashboard worden gebruikt.',
  dataVolledigheid:
    'Overzicht van de datakwaliteit en volledigheid per veld in de geladen bestanden.',
  api:
    'REST API-documentatie op basis van OpenAPI 3.0.3. Endpoints voor zendingen, deelritten, aggregaties en metadata.',
  anprOverzicht:
    'Overzicht van vrachtverkeerbezoeken op basis van ANPR-cameraregistraties: aantallen, voertuigcategorieen en emissieklassen.',
  anprEmissie:
    'Maandelijkse trends in emissieklassen en voertuigcategorieen op basis van ANPR-data.',
  anprBedrijven:
    'Analyse van bezoeken per bedrijfstak (SBI-groep) en bedrijfsgrootte.',
  anprBezoekers:
    'Kenmerken van bezoekers: type bezoeker, bedrijfsgrootte en herkomstprovincie.',
  anprTijdpatronen:
    'Dag- en weekpatronen van vrachtverkeerbezoeken.',
} as const;

export const KPI_TOOLTIPS = {
  brutoGewicht:
    'Totaal bruto gewicht van alle zendingen/deelritten in kilogram.',
  zendingAantal:
    'Totaal aantal unieke zendingen (pakket van herkomst naar bestemming).',
  aantalDeelritten:
    'Totaal aantal deelritten (individuele vervoersbewegingen per voertuig).',
  beladingsgraad:
    'Gewogen gemiddelde beladingsgraad: het percentage van het laadvermogen dat benut wordt.',
  importPercentage:
    'Percentage van internationale zendingen dat geImporteerd wordt (herkomst buitenland).',
  exportPercentage:
    'Percentage van internationale zendingen dat geExporteerd wordt (bestemming buitenland).',
  euro6Percentage:
    'Percentage deelritten uitgevoerd door voertuigen met Euro-6 emissieclassificatie.',
  leegPercentage:
    'Percentage deelritten dat zonder lading wordt uitgevoerd.',
} as const;

export const CHART_TOOLTIPS = {
  stadslogistiekKlasse:
    'Verdeling van zendingen/deelritten over CBS stadslogistieke klassen (bijv. pakket, bouw, food).',
  emissiezoneLaden:
    'Aandeel zendingen waarvan de laadlocatie in een emissiezone ligt.',
  emissiezoneLossen:
    'Aandeel zendingen waarvan de loslocatie in een emissiezone ligt.',
  importExportLand:
    'Verdeling van internationale zendingen/deelritten per handelspartner.',
  brandstofsoort:
    'Verdeling van deelritten over brandstofsoorten (diesel, elektrisch, etc.).',
  gewichtsklasse:
    'Verdeling van deelritten over gewichtsklassen van voertuigen.',
  voertuigcategorie:
    'Verdeling van deelritten over voertuigcategorieen (bestelwagen, vrachtwagen, etc.).',
  beladingsgraadKlasse:
    'Gewogen gemiddelde beladingsgraad per stadslogistieke klasse per jaar.',
  voertuigTypePerYear:
    'Procentuele verdeling van voertuigtypen per jaar.',
  deelrittenPerKlasse:
    'Absoluut aantal deelritten per stadslogistieke klasse per jaar.',
  trendDeelrittenKms:
    'Aantal deelritten (lijn) en totale kilometers binnen de gemeente (stippellijn) per jaar.',
  trendEuro6:
    'Percentage deelritten met Euro-6 voertuigen per jaar.',
  trendZendingenGewicht:
    'Aantal zendingen (lijn) en bruto gewicht (stippellijn) per jaar.',
  pc4Laad:
    'Kaart met het aantal deelritten/zendingen per postcode-4 laadlocatie.',
  pc4Los:
    'Kaart met het aantal deelritten/zendingen per postcode-4 loslocatie.',
  beladingsgraadPC4:
    'Choroplethkaart met de gemiddelde beladingsgraad per laadpostcode.',
  nuts3Naar:
    'Aantal zendingen/deelritten naar de gemeente, gegroepeerd per NUTS3-herkomstregio.',
  nuts3Vanuit:
    'Aantal zendingen/deelritten vanuit de gemeente, gegroepeerd per NUTS3-bestemmingsregio.',
  anprVoertuigcategorie:
    'Verdeling van ANPR-bezoeken over Europese voertuigcategorieen (N1=licht, N2=middelzwaar, N3=zwaar).',
  anprEmissieklasse:
    'Verdeling van bezoeken over emissieklassen: Euro 0-5, Euro 6 en zero-emissie.',
  anprMaandelijkBezoeken:
    'Aantal bezoeken per maand, uitgesplitst naar emissieklasse.',
  anprMaandelijkVoertuig:
    'Aantal bezoeken per maand, uitgesplitst naar voertuigcategorie.',
  anprEmissiePerVoertuig:
    'Emissieklasseverdeling per voertuigcategorie.',
  anprEuro6Trend:
    'Maandelijks percentage Euro-6 en zero-emissie bezoeken.',
  anprSbiGroep:
    'Verdeling van bezoeken over bedrijfstakken (SBI-groep).',
  anprBedrijfsgrootte:
    'Verdeling van bezoeken over bedrijfsgroottes.',
  anprBezoekersType:
    'Verdeling van bezoeken naar type bezoeker: eenmalig, 2-12 keer of >12 keer per jaar.',
  anprHerkomstProvincie:
    'Verdeling van bezoeken naar rustprovincie van het voertuig.',
  anprTijdstip:
    'Verdeling van bezoeken over zes dagdelen.',
  anprWeekdag:
    'Verdeling van bezoeken over de dagen van de week.',
} as const;
