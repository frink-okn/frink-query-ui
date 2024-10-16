type SPARQLSource = {
  type: 'sparql'
  name: string
  shortname: string
  endpoint: string
}

type CompoundSource = {
  type: 'compound'
  name: string
  shortname: string
  sparqlEndpoint: string
  tpfEndpoint: string
}

export type Source = SPARQLSource | CompoundSource

const defaultSources: Source[] = [
  makeFRINKSource('BioBricks ICE', 'biobricks-ice'),
  makeFRINKSource('Climatepub4-KG', 'climatepub4kg'),
  makeFRINKSource('DREAM-KG', 'dreamkg'),
  makeFRINKSource('Rural-KG', 'ruralkg'),
  makeFRINKSource('SAWGraph', 'sawgraph'),
  makeFRINKSource('SAWGraph Hydrology KG', 'hydrologykg'),
  makeFRINKSource('SAWGraph FIO KG', 'fiokg'),
  makeFRINKSource('SAWGraph Spatial KG', 'spatialkg'),
  makeFRINKSource('SCALES', 'scales'),
  makeFRINKSource('Secure Chain KG', 'securechainkg'),
  makeFRINKSource('SemOpenAlex', 'semopenalex'),
  makeFRINKSource('SOC-KG', 'sockg'),
  makeFRINKSource('SPOKE', 'spoke'),
  makeFRINKSource('SUD-OKN', 'sudokn'),
  makeFRINKSource('Ubergraph', 'ubergraph'),
  makeFRINKSource('UF-OKN', 'ufokn'),
  makeFRINKSource('Wikidata', 'wikidata'),
  makeFRINKSource('Wildlife-KG', 'wildlifekg'),
  {
    type: 'sparql',
    name: 'FRINK Federated SPARQL',
    shortname: 'federation',
    endpoint: 'https://frink.apps.renci.org/federation/sparql'
  }
]

function makeFRINKSource(name: string, slug: string): CompoundSource {
  return {
    type: 'compound',
    name: name,
    shortname: slug,
    sparqlEndpoint: `https://frink.apps.renci.org/${slug}/sparql`,
    tpfEndpoint: `https://frink.apps.renci.org/ldf/${slug}`
  }
}

export { defaultSources }
