export type SourceCategory = 'theme-1' | 'frink' | 'federation'

type SPARQLSource = {
  type: 'sparql'
  name: string
  shortname: string
  endpoint: string
  category: SourceCategory
}

type CompoundSource = {
  type: 'compound'
  name: string
  shortname: string
  sparqlEndpoint: string
  tpfEndpoint: string
  category: SourceCategory
}

export type Source = SPARQLSource | CompoundSource

const defaultSources: Source[] = [
  makeFRINKSource('BioBricks ICE', 'biobricks-ice'),
  makeFRINKSource('Climatepub4-KG', 'climatepub4kg'),
  makeFRINKSource('DREAM-KG', 'dreamkg'),
  makeFRINKSource('Rural-KG', 'ruralkg'),
  makeFRINKSource('SAWGraph', 'sawgraph'),
  makeFRINKSource('SCALES', 'scales'),
  makeFRINKSource('Secure Chain KG', 'securechainkg'),
  makeFRINKSource('SemOpenAlex', 'semopenalex'),
  makeFRINKSource('SOC-KG', 'sockg'),
  makeFRINKSource('SPOKE', 'spoke'),
  makeFRINKSource('SUD-OKN', 'sudokn'),
  makeFRINKSource('Ubergraph', 'ubergraph', 'frink'),
  makeFRINKSource('UF-OKN', 'ufokn'),
  makeFRINKSource('Wildlife-KG', 'wildlifekg'),
  makeFRINKSource('Wikidata', 'wikidata', 'frink'),
  {
    type: 'sparql',
    name: 'FRINK Federated SPARQL',
    shortname: 'federation',
    endpoint: 'https://frink.apps.renci.org/federation/sparql',
    category: 'federation'
  }
]

function makeFRINKSource(
  name: string,
  slug: string,
  category: 'theme-1' | 'frink' | 'federation' = 'theme-1'
): CompoundSource {
  return {
    type: 'compound',
    name: name,
    shortname: slug,
    sparqlEndpoint: `https://frink.apps.renci.org/${slug}/sparql`,
    tpfEndpoint: `https://frink.apps.renci.org/ldf/${slug}`,
    category
  }
}

export { defaultSources }
