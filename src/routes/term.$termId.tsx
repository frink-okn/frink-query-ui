import { styled } from "@mui/joy";
import { getRouteApi } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useWindowSize } from "@uidotdev/usehooks";
import { TermPagePanels } from "../ui/Panels/layout/TermPagePanels";
import { useEffect, useState } from "react";
import { QueryEngine } from "@comunica/query-sparql";

const engine = new QueryEngine();
const rootRouteApi = getRouteApi("__root__");

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
        await engine.queryBindings(labelSparql, { sources: [{ type: 'sparql', value: 'https://frink.apps.renci.org/federation/sparql' }] })
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

function Incoming() {
  return <div>
    Incoming
  </div>
}

function Outgoing() {
  return <div>
    Outgoing
  </div>
}

function Attributes() {
  return <div>
    Attributes
  </div>
}

function Usages() {
  return <div>
    Usages
  </div>
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
