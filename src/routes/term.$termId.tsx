import { styled } from "@mui/joy";
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useWindowSize } from "@uidotdev/usehooks";
import { TermPagePanels } from "../ui/Panels/layout/TermPagePanels";
import { useEffect, useState } from "react";
import { QueryEngine } from "@comunica/query-sparql";
import { RDFTable } from "../ui/RDFTable/RDFTable";
import { useComunicaQuery } from "../hooks/useComunicaQuery";
import dedent from "dedent"

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
      const labelSparql = dedent`
        SELECT ?label
        WHERE {
          <${termId}> <http://xmlns.com/foaf/0.1/name>|<http://purl.org/dc/terms/title>|<http://www.w3.org/2000/01/rdf-schema#label> ?label
        }
        LIMIT 1
      `
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
            id: "as-object",
            label: "As Object",
            color: "var(--p-cyan-400)",
            jsx: <TermPanel querySparql={dedent`
              SELECT ?subject ?predicate
              WHERE {
                ?subject ?predicate <${termId}>
                FILTER(!isLiteral(?subject))
              }
              LIMIT 50
            `} />,
          },
          {
            id: "as-subject",
            label: "As Subject",
            color: "var(--p-orange-400)",
            jsx: <TermPanel querySparql={dedent`
              SELECT ?predicate ?object
              WHERE {
                <${termId}> ?predicate ?object
                FILTER(!isLiteral(?object))
              }
              LIMIT 50
            `} />,
          },
          {
            id: "attributes",
            label: "Attributes",
            color: "var(--p-indigo-300)",
            jsx: <TermPanel querySparql={dedent`
              SELECT ?property ?value
              WHERE {
                <${termId}> ?property ?value
                FILTER(isLiteral(?value))
              }
              LIMIT 50
            `} />,
          },
          {
            id: "as-predicate",
            label: "As Predicate",
            color: "var(--p-pink-400)",
            jsx: <TermPanel querySparql={dedent`
              SELECT ?subject ?object
              WHERE {
                ?subject <${termId}> ?object
              }
              LIMIT 50
            `} />,
          },
        ]}
      />
    </Wrapper>
  );
}

const rootRouteApi = getRouteApi("__root__");

interface TermPanelProps {
  querySparql: string;
}
function TermPanel({ querySparql }: TermPanelProps) {
  const { sources } = rootRouteApi.useLoaderData();

  const query = useComunicaQuery({
    runOnMount: true,
    query: querySparql,
    sources: sources.filter(s => s.shortname === 'federation'),
  })

  if (query.isRunning)
    return <div>Loading...</div>
  
  return <TableWrapper>
    <RDFTable
      columns={query.columns}
      rows={query.results}
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
