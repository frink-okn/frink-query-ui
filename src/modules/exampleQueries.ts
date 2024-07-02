type ExampleQuery = {
  title: string
  sources: string[]
  query: string
}

const exampleQueries: ExampleQuery[] = [
  {
    title: 'What is the adrenal gland part of?',
    sources: ['ubergraph'],
    query: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX adrenal_gland: <http://purl.obolibrary.org/obo/UBERON_0002369>
PREFIX part_of: <http://purl.obolibrary.org/obo/BFO_0000050>
SELECT DISTINCT ?x ?x_label
WHERE {
  adrenal_gland: part_of: ?x .
  ?x rdfs:label ?x_label .
}`
  },
  {
    title: 'Cell types in abdominal organs',
    sources: ['ubergraph'],
    query: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX cell: <http://purl.obolibrary.org/obo/CL_0000000>
PREFIX organ: <http://purl.obolibrary.org/obo/UBERON_0000062>
PREFIX abdomen: <http://purl.obolibrary.org/obo/UBERON_0000916>
PREFIX part_of: <http://purl.obolibrary.org/obo/BFO_0000050>
SELECT DISTINCT ?cell ?cell_label ?organ ?organ_label
WHERE {
  ?cell rdfs:subClassOf cell: .
  ?cell part_of: ?organ .
  ?organ rdfs:subClassOf organ: .
  ?organ part_of: abdomen: .
  ?cell rdfs:label ?cell_label .
  ?organ rdfs:label ?organ_label .
}`
  },
  {
    title: 'Processes that output glucose',
    sources: ['ubergraph'],
    query: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX CHEBI: <http://purl.obolibrary.org/obo/CHEBI_>
PREFIX has_output: <http://purl.obolibrary.org/obo/RO_0002234>
SELECT ?process ?label
WHERE {
  ?process has_output: CHEBI:17234 .
  ?process rdfs:label ?label .
}`
  },
  {
    title:
      'Scientific articles in Wikidata with about a cell type that Ubergraph says is part of the abdomen',
    sources: ['ubergraph', 'wikidata'],
    query: `PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wdtn: <http://www.wikidata.org/prop/direct-normalized/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX cell: <http://purl.obolibrary.org/obo/CL_0000000>
PREFIX abdomen: <http://purl.obolibrary.org/obo/UBERON_0000916>
PREFIX part_of: <http://purl.obolibrary.org/obo/BFO_0000050>
SELECT DISTINCT ?cell ?cell_label ?article ?title
WHERE {
  ?cell rdfs:subClassOf cell: .
  ?cell part_of: abdomen: .
  ?wikicell wdtn:P7963 ?cell .
  ?article wdt:P921 ?wikicell .
  ?article rdfs:label ?title .
  ?cell rdfs:label ?cell_label .
}
LIMIT 1000`
  },
  {
    title: 'Show 100 triples',
    sources: ['federation'],
    query: `CONSTRUCT WHERE {
  ?s ?p ?o.
}
LIMIT 100`
  },
  {
    title: 'List things and their labels',
    sources: ['federation'],
    query: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dc: <http://purl.org/dc/terms/>
SELECT DISTINCT ?subject ?label WHERE {
  { ?subject dc:title ?label }
  UNION
  { ?subject rdfs:label ?label }
}
LIMIT 100`
  },
  {
    title: 'List services that are provided in more than one language',
    sources: ['dreamkg'],
    query: `PREFIX dreamkg: <http://www.semanticweb.org/dreamkg/ijcai/>
PREFIX sdo: <http://schema.org/>
select ?service ?languages { {
SELECT ?service (GROUP_CONCAT(DISTINCT ?languageLabel; separator=" / ") as ?languages) {
	?service sdo:category ?language . ?language sdo:inCodeSet dreamkg:_CategoryCodeSet_Languages . ?language sdo:codeValue ?languageLabel
} group by ?service }
filter(contains(?languages, " / "))}`
  },
  {
    title: 'List services that are available on Saturday or Sunday',
    sources: ['dreamkg'],
    query: `PREFIX dreamkg: <http://www.semanticweb.org/dreamkg/ijcai/>
PREFIX sdo: <http://schema.org/>
SELECT DISTINCT ?service {
	?service sdo:hoursAvailable ?hours . ?hours sdo:dayOfWeek ?dow . filter(?dow in ("Saturday","Sunday"))
}`
  },
  {
    title: 'List distinct judges',
    sources: ['scales'],
    query: `PREFIX scales: <http://schemas.scales-okn.org/rdf/scales#>
SELECT DISTINCT ?judgeName
WHERE {
    ?s scales:hasAgentType "judge" .
    ?s scales:hasName ?judgeName .
}`
  },
  {
    title: 'List SCALES ontology event labels',
    sources: ['scales'],
    query: `PREFIX scales: <http://schemas.scales-okn.org/rdf/scales#>
SELECT DISTINCT ?ontologyLabel
WHERE {
    ?s scales:hasOntologyLabel ?ontologyLabel .
} `
  }
]

export { exampleQueries }
