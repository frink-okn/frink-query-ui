import { styled } from "@mui/joy";
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useWindowSize } from "@uidotdev/usehooks";
import { TermPagePanels } from "../ui/Panels/layout/TermPagePanels";
import { useEffect, useState } from "react";
import { QueryEngine } from "@comunica/query-sparql";
import { RDFTable } from "../ui/RDFTable/RDFTable";
import { useComunicaQuery } from "../hooks/useComunicaQuery";

const engine = new QueryEngine();
const FEDERATION_URL = 'https://frink.apps.renci.org/federation/sparql'

export const Route = createFileRoute("/term/$termId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { termId } = Route.useParams();

  const [termName, setTermName] = useState(termId);
  useEffect(() => {
    (async () => {
      const labelSparql = `\
SELECT ?label
WHERE {
  <${termId}> <http://xmlns.com/foaf/0.1/name>|<http://purl.org/dc/terms/title>|<http://www.w3.org/2000/01/rdf-schema#label> ?label
}
LIMIT 1`
      const labelBindings = await (
        await engine.queryBindings(labelSparql, { sources: [{ type: 'sparql', value: FEDERATION_URL }] })
      )
        .take(1)
        .toArray()
      setTermName(labelBindings[0]?.get('label')?.value ?? termId)
    })()
  }, [termId]);

  const { width } = useWindowSize();
  if (!width) return null;

  return (
    <Wrapper>
      <header>
        <Heading style={{ margin: 0 }}>{termName}</Heading>
        <a href={termId} target="_blank" rel="noopener noreferrer">{termId}</a>
      </header>

      <TermPagePanels
        tabs={[
          {
            id: "incoming",
            label: "Incoming",
            color: "var(--p-cyan-400)",
            jsx: <Incoming />,
          },
          {
            id: "outgoing",
            label: "Outgoing",
            color: "var(--p-orange-400)",
            jsx: <Outgoing />,
          },
          {
            id: "attributes",
            label: "Attributes",
            color: "var(--p-indigo-300)",
            jsx: <Attributes />,
          },
          {
            id: "usages",
            label: "Usages",
            color: "var(--p-pink-400)",
            jsx: <Usages />,
          },
        ]}
      />
    </Wrapper>
  );
}

const rootRouteApi = getRouteApi("__root__");

function Incoming() {
  const { termId } = Route.useParams();
  const { sources } = rootRouteApi.useLoaderData();
  
  const incomingSparql = `\
SELECT ?s ?p
WHERE {
  ?s ?p <${termId}>
  FILTER(!isLiteral(?s))
}
LIMIT 50`
  const incomingQuery = useComunicaQuery({
    runOnMount: true,
    query: incomingSparql,
    sources: sources.filter(s => s.shortname === 'federation'),
  })

  if (incomingQuery.isRunning)
    return <div>Loading...</div>
  
  return <TableWrapper>
    <RDFTable
      columns={incomingQuery.columns}
      rows={incomingQuery.results}
    />
  </TableWrapper>
}

function Outgoing() {
  const { termId } = Route.useParams();
  const { sources } = rootRouteApi.useLoaderData();
  
  const outgoingSparql = `\
SELECT ?p ?o
WHERE {
  <${termId}> ?p ?o
  FILTER(!isLiteral(?o))
}
LIMIT 50`
  const outgoingQuery = useComunicaQuery({
    runOnMount: true,
    query: outgoingSparql,
    sources: sources.filter(s => s.shortname === 'federation'),
  })

  if (outgoingQuery.isRunning)
    return <div>Loading...</div>
  
  return <TableWrapper>
    <RDFTable
      columns={outgoingQuery.columns}
      rows={outgoingQuery.results}
    />
  </TableWrapper>
}


function Attributes() {
  const { termId } = Route.useParams();
  const { sources } = rootRouteApi.useLoaderData();
  
  const attributesSparql = `\
SELECT ?p ?v
WHERE {
  <${termId}> ?p ?v
  FILTER(isLiteral(?v))
}
LIMIT 50`
  const attributesQuery = useComunicaQuery({
    runOnMount: true,
    query: attributesSparql,
    sources: sources.filter(s => s.shortname === 'federation'),
  })

  if (attributesQuery.isRunning)
    return <div>Loading...</div>
  
  return <TableWrapper>
    <RDFTable
      columns={attributesQuery.columns}
      rows={attributesQuery.results}
    />
  </TableWrapper>
}

function Usages() {
  const { termId } = Route.useParams();
  const { sources } = rootRouteApi.useLoaderData();
  
  const usagesSparql = `\
SELECT ?s ?o
WHERE {
  ?s <${termId}> ?o
}
LIMIT 50`
  const usagesQuery = useComunicaQuery({
    runOnMount: true,
    query: usagesSparql,
    sources: sources.filter(s => s.shortname === 'federation'),
  })

  if (usagesQuery.isRunning)
    return <div>Loading...</div>
  
  return <TableWrapper>
    <RDFTable
      columns={usagesQuery.columns}
      rows={usagesQuery.results}
    />
  </TableWrapper>
}

const Wrapper = styled("div")`
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 800px) {
    padding: 0.5rem;
  }
`;

const Heading = styled("h1")`
  position: relative;
  font-size: 1.5rem;
  font-weight: 500;
  max-width: fit-content;
  word-wrap: break-word;

  @media (max-width: 800px) {
    font-size: 1.2rem;
  }

  &:after {
    background-color: var(--p-slate-50);
    content: '';
    filter: blur(10px);
    z-index: -1;
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
  }
`

const TableWrapper = styled('div')`
  --parent-padding: 0.75rem;
  height: calc(100% + 2 * var(--parent-padding));
  margin: calc(-1 * var(--parent-padding));
`
