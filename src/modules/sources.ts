type SPARQLSource = {
  type: 'sparql'
  name: string
  endpoint: string
}

type CompoundSource = {
  type: 'compound'
  name: string
  sparqlEndpoint: string
  tpfEndpoint: string
}

type Source = SPARQLSource | CompoundSource

const defaultSources: Source[] = [
  makeFRINKSource('Climatepub4-KG', 'climatepub4kg'),
  makeFRINKSource('DREAM-KG', 'dreamkg'),
  makeFRINKSource('SCALES', 'scales'),
  makeFRINKSource('Secure Chain KG', 'securechainkg'),
  makeFRINKSource('SOC-KG', 'sockg'),
  makeFRINKSource('SUD-OKN', 'sudokn'),
  makeFRINKSource('Ubergraph', 'ubergraph'),
  makeFRINKSource('UF-OKN', 'ufokn'),
  makeFRINKSource('Wikidata', 'wikidata'),
  {
    type: 'sparql',
    name: 'FRINK Federated SPARQL',
    endpoint: 'https://frink.apps.renci.org/federation/sparql'
  }
]

function makeFRINKSource(name: string, slug: string): CompoundSource {
  return {
    type: 'compound',
    name: name,
    sparqlEndpoint: `https://frink.apps.renci.org/${slug}/sparql`,
    tpfEndpoint: `https://frink.apps.renci.org/ldf/${slug}`
  }
}

export { defaultSources }
