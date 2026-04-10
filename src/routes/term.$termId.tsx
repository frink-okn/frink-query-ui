import { styled } from "@mui/joy";
import { createFileRoute } from "@tanstack/react-router";
import { useWindowSize } from "@uidotdev/usehooks";
import { TermPagePanels } from "../ui/Panels/layout/TermPagePanels";
import { useEffect, useState } from "react";
import { QueryEngine } from "@comunica/query-sparql";
import dedent from "dedent";

const engine = new QueryEngine();
const FEDERATION_URL = "https://frink.apps.renci.org/federation/sparql";

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
          {
            SELECT ?term (MIN(?text) AS ?textEN)
            WHERE {
              VALUES ?term { <${termId}> }
              OPTIONAL {
                <${termId}> <http://schema.org/name>|<https://schema.org/name>|<http://xmlns.com/foaf/0.1/name>|<http://purl.org/dc/terms/title>|<http://www.w3.org/2000/01/rdf-schema#label> ?text
                FILTER(lang(?text) = "en")
              }
            }
            GROUP BY ?term
          }
          {
            SELECT ?term (MIN(?text) AS ?textENX)
            WHERE {
              VALUES ?term { <${termId}> }
              OPTIONAL {
                <${termId}> <http://schema.org/name>|<https://schema.org/name>|<http://xmlns.com/foaf/0.1/name>|<http://purl.org/dc/terms/title>|<http://www.w3.org/2000/01/rdf-schema#label> ?text
                FILTER(langMatches(lang(?text), "en"))
              }
            }
            GROUP BY ?term
          }
          {
            SELECT ?term (MIN(?text) AS ?textAlt)
            WHERE {
              VALUES ?term { <${termId}> }
              OPTIONAL {
                <${termId}> <http://schema.org/name>|<https://schema.org/name>|<http://xmlns.com/foaf/0.1/name>|<http://purl.org/dc/terms/title>|<http://www.w3.org/2000/01/rdf-schema#label> ?text
              }
            }
            GROUP BY ?term
          }
          VALUES ?term { <${termId}> }
          BIND (STRAFTER(STR(?term), "#") AS ?afterHash)
          BIND (IF(STRLEN(?afterHash) = 0, 1/0, ?afterHash) AS ?afterHashText)
          BIND (REPLACE(STR(?term), "^.*/([^/]+)$", "$1") as ?afterSlash)
          BIND (IF(STRLEN(?afterSlash) = 0, 1/0, ?afterSlash) AS ?afterSlashText)
          BIND (COALESCE(?textEN, ?textENX, ?textAlt, ?afterHashText, ?afterSlashText, STR(?term)) AS ?label)
        }
        LIMIT 1
      `;
      const labelBindings = await (
        await engine.queryBindings(labelSparql, {
          sources: [{ type: "sparql", value: FEDERATION_URL }],
        })
      )
        .take(1)
        .toArray();
      setTermName(labelBindings[0]?.get("label")?.value ?? termId);
    })();
  }, [termId]);

  const { width } = useWindowSize();
  if (!width) return null;

  return (
    <Wrapper>
      <header>
        <Heading style={{ margin: 0 }}>{termName}</Heading>
        <a href={termId} target="_blank" rel="noopener noreferrer">
          {termId}
        </a>
      </header>

      <TermPagePanels termId={termId} />
    </Wrapper>
  );
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
    content: "";
    filter: blur(10px);
    z-index: -1;
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
  }
`;
