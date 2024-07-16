<script setup lang="ts">
import PageWrapper from '@/components/PageWrapper.vue'
import { defaultSources } from '@/modules/sources'
import { QueryEngine } from '@comunica/query-sparql'
import type { Term, BlankNode, NamedNode, Literal } from '@rdfjs/types'
import { onMounted, ref, toRefs, watch, type Ref } from 'vue'
import RDFTermDisplay from '@/components/RDFTermDisplay.vue'

const props = defineProps<{
  iri: string
}>()
const iriRef = toRefs(props).iri
const label = ref('')
const propertyValues: Ref<{ property: NamedNode; value: Literal }[]> = ref([])
const outgoingRelationships: Ref<{ predicate: NamedNode; object: NamedNode | BlankNode }[]> = ref(
  []
)
const incomingRelationships: Ref<{ subject: NamedNode | BlankNode; predicate: NamedNode }[]> = ref(
  []
)
const predicateRelationships: Ref<{ subject: NamedNode | BlankNode; object: Term }[]> = ref([])
const federation =
  defaultSources.filter((s) => s.type === 'sparql').find((s) => s.shortname === 'federation')
    ?.endpoint ?? ''
const engine = new QueryEngine()
async function refreshData() {
  label.value = ''
  propertyValues.value = []
  outgoingRelationships.value = []
  incomingRelationships.value = []
  predicateRelationships.value = []
  const labelSparql = `SELECT ?label WHERE {
  <${iriRef.value}> <http://www.w3.org/2000/01/rdf-schema#label>|<http://xmlns.com/foaf/0.1/name> ?label
  } LIMIT 1`
  const labelBindings = await (
    await engine.queryBindings(labelSparql, { sources: [{ type: 'sparql', value: federation }] })
  )
    .take(1)
    .toArray()
  label.value = labelBindings[0]?.get('label')?.value ?? ''
  const propertiesSparql = `SELECT ?p ?v WHERE {<${iriRef.value}> ?p ?v FILTER(isLiteral(?v)) } LIMIT 50`
  const propertiesBindings = await (
    await engine.queryBindings(propertiesSparql, {
      sources: [{ type: 'sparql', value: federation }]
    })
  ).toArray()
  propertiesBindings.forEach((bindings) => {
    const pValue = bindings.get('p')
    const vValue = bindings.get('v')
    if (pValue && vValue && pValue.termType === 'NamedNode' && vValue.termType === 'Literal') {
      propertyValues.value.push({
        property: pValue,
        value: vValue
      })
    }
  })
  const outgoingSparql = `SELECT ?p ?o WHERE {<${iriRef.value}> ?p ?o FILTER(!isLiteral(?o)) } LIMIT 50`
  const outgoingBindings = await (
    await engine.queryBindings(outgoingSparql, {
      sources: [{ type: 'sparql', value: federation }]
    })
  ).toArray()
  outgoingBindings.forEach((bindings) => {
    const pValue = bindings.get('p')
    const oValue = bindings.get('o')
    if (
      pValue &&
      oValue &&
      pValue.termType === 'NamedNode' &&
      (oValue.termType === 'NamedNode' || oValue.termType === 'BlankNode')
    ) {
      outgoingRelationships.value.push({
        predicate: pValue,
        object: oValue
      })
    }
  })
  const incomingSparql = `SELECT ?s ?p WHERE { ?s ?p <${iriRef.value}> FILTER(!isLiteral(?s)) } LIMIT 50`
  const incomingRelationshipsBindings = await (
    await engine.queryBindings(incomingSparql, {
      sources: [{ type: 'sparql', value: federation }]
    })
  ).toArray()
  incomingRelationshipsBindings.forEach((bindings) => {
    const sValue = bindings.get('s')
    const pValue = bindings.get('p')
    if (
      sValue &&
      pValue &&
      pValue.termType === 'NamedNode' &&
      (sValue.termType === 'NamedNode' || sValue.termType === 'BlankNode')
    ) {
      incomingRelationships.value.push({
        subject: sValue,
        predicate: pValue
      })
    }
  })
  const predicateSparql = `SELECT ?s ?o WHERE { ?s <${iriRef.value}> ?o } LIMIT 50`
  const predicateRelationshipsBindings = await (
    await engine.queryBindings(predicateSparql, {
      sources: [{ type: 'sparql', value: federation }]
    })
  ).toArray()
  predicateRelationshipsBindings.forEach((bindings) => {
    const sValue = bindings.get('s')
    const oValue = bindings.get('o')
    if (sValue && oValue && (sValue.termType === 'NamedNode' || sValue.termType === 'BlankNode')) {
      predicateRelationships.value.push({
        subject: sValue,
        object: oValue
      })
    }
  })
}
onMounted(async () => {
  refreshData()
})
watch(iriRef, async (_newIRI) => {
  refreshData()
})
</script>

<template>
  <h2>{{ label }}</h2>
  <p>
    <i>{{ iri }}</i>
  </p>
  <h3>Property values</h3>
  <table>
    <tr>
      <th>Property</th>
      <th>Value</th>
    </tr>
    <tr v-for="pv in propertyValues" :key="`${pv.property.value}${pv.value.value}`">
      <td><RDFTermDisplay :term="pv.property" /></td>
      <td><RDFTermDisplay :term="pv.value" /></td>
    </tr>
  </table>
  <h3>Outgoing relationships</h3>
  <table>
    <tr>
      <th>Subject</th>
      <th>Relationship</th>
      <th>Object</th>
    </tr>
    <tr v-for="po in outgoingRelationships" :key="`${po.predicate.value}${po.object.value}`">
      <td>
        <small>{{ iri }}</small>
      </td>
      <td><RDFTermDisplay :term="po.predicate" /></td>
      <td><RDFTermDisplay :term="po.object" /></td>
    </tr>
  </table>
  <h3>Incoming relationships</h3>
  <table>
    <tr>
      <th>Subject</th>
      <th>Relationship</th>
      <th>Object</th>
    </tr>
    <tr v-for="sp in incomingRelationships" :key="`${sp.subject.value}${sp.predicate.value}`">
      <td><RDFTermDisplay :term="sp.subject" /></td>
      <td><RDFTermDisplay :term="sp.predicate" /></td>
      <td>
        <small>{{ iri }}</small>
      </td>
    </tr>
  </table>
  <h3>Usages as property</h3>
  <table>
    <tr>
      <th>Subject</th>
      <th>Relationship</th>
      <th>Object</th>
    </tr>
    <tr v-for="so in predicateRelationships" :key="`${so.subject.value}${so.object.value}`">
      <td><RDFTermDisplay :term="so.subject" /></td>
      <td>
        <small>{{ iri }}</small>
      </td>
      <td><RDFTermDisplay :term="so.object" /></td>
    </tr>
  </table>
</template>

<style scoped>
td {
  border: 2px solid black;
}
</style>
