type ExampleQuery = {
  title: string
  sources: string[]
  query: string
}
// bla
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
}`
  },
  {
    title: 'List assays by source from InvitroDB that are found in both ICE and ToxCast',
    sources: ['biobricks-ice'],
    query: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX CHEMINF: <http://purl.obolibrary.org/obo/CHEMINF_>
PREFIX CAS: <http://identifiers.org/cas/>
PREFIX EDAM: <http://edamontology.org/>
PREFIX dce: <http://purl.org/dc/elements/1.1/>
PREFIX BAO: <http://www.bioassayontology.org/bao#BAO_>
SELECT ?assay 
WHERE {
  ?assay a BAO:0000015 ;
    dce:source "InvitroDB" .
}`
  },
  {
    title:
      'List the names of chemical entities and optionally their CAS RNand DSSTOXSID if available',
    sources: ['biobricks-ice'],
    query: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX CHEMINF: <http://purl.obolibrary.org/obo/CHEMINF_>
PREFIX CAS: <http://identifiers.org/cas/>
PREFIX EDAM: <http://edamontology.org/>
SELECT  ?cas ?dsstox ?name
WHERE {
  ?s a CHEMINF:000000 ;
    rdfs:label ?name .
  OPTIONAL {
    ?s EDAM:has_identifier ?dsstox.
    ?dsstox a CHEMINF:000568. # DSSTOX SID
  }
  OPTIONAL {
    ?s EDAM:has_identifier ?cas .
    ?cas a CHEMINF:000446 . # CAS RN
  }
}
LIMIT 200`
  },
  {
    title: 'List all providers (RURAL-KG)',
    sources: ['ruralkg'],
    query: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX treatment: <http://sail.ua.edu/ruralkg/treatmentprovider/>
SELECT ?provider ?providerName
WHERE {
  ?provider rdf:type treatment:TreatmentProvider ;
    treatment:name ?providerName .
}
LIMIT 100`
  },
  {
    title: 'List all substances in the graph (RURAL-KG)',
    sources: ['ruralkg'],
    query: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX sa: <http://sail.ua.edu/ruralkg/substanceabuse/>
SELECT ?substance ?name
WHERE {
  ?substance rdf:type sa:Substance .
  ?substance sa:name ?name .
}
LIMIT 100`
  },
  {
    title: 'List software dependencies of versions of ffmpeg',
    sources: ['securechainkg'],
    query: `PREFIX ns1: <http://example.org/ns#>
SELECT ?package ?dependency {
  ?software ns1:name "ffmpeg" .
  ?package ns1:isVersionOf ?software ; 
    ns1:dependsOn ?dependency .
}
LIMIT 100`
  },
  {
    title: 'List vulnerabilities in versions of ffmpeg',
    sources: ['securechainkg'],
    query: `PREFIX ns1: <http://example.org/ns#>
SELECT ?vuln ?software {
  ?software ns1:name "ffmpeg" .
  ?package ns1:isVersionOf ?software .
  ?vuln ns1:affects ?package .
}
LIMIT 100`
  }
]

export { exampleQueries }
