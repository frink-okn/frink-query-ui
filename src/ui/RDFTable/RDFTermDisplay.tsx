import { styled, Tooltip } from "@mui/joy";
import type { Term } from "@rdfjs/types";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import dedent from "dedent";
import { QueryEngine } from "@comunica/query-sparql";

interface RDFTermDisplayProps {
  term?: Term;
  resolveLabels: boolean;
}

const engine = new QueryEngine();
const FEDERATION_URL = "https://frink.apps.renci.org/federation/sparql";

export function RDFTermDisplay({ term, resolveLabels }: RDFTermDisplayProps) {
  if (term?.termType === "NamedNode")
    return (
      resolveLabels ? <LabeledIri term={term} /> :
        <Link to="/term/$termId" params={{ termId: term.value }}>
          {term.value}
        </Link>
    );

  if (term?.termType === "BlankNode")
    return <Term className="blanknode">{term.value}</Term>;

  if (term?.termType === "Literal")
    return (
      <Term>
        {term.value}
        {term.language.length > 0 && (
          <span className="lang">{term.language}</span>
        )}
        {term.datatype.value !==
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString" && (
            <DataType>^^{term.datatype.value}</DataType>
          )}
      </Term>
    );

  return <Term>{term?.value}</Term>;
}

function LabeledIri({ term }: { term: Term }) {
  const [label, setLabel] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(true);

  const termId = term.value;

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

      try {
        const labelBindings = await (
          await engine.queryBindings(labelSparql, {
            sources: [{ type: "sparql", value: FEDERATION_URL }],
          })
        )
          .take(1)
          .toArray();
        setLabel(labelBindings[0]?.get("label")?.value ?? termId);
      } catch {
        setLabel(termId);
      }
      setIsLoading(false);
    })();
  }, [termId]);

  return (
    <Tooltip title={termId} placement="right">
      <Term>
        {isLoading ? "…" : (
          <Link to="/term/$termId" params={{ termId }}>
            {label}
          </Link>
        )}
      </Term>
    </Tooltip>
  );
}

const Term = styled("span")`
  font-size: small;

  & .blanknode {
    color: gray;
  }

  & .lang {
    color: gray;
    font-size: x-small;
  }
`;

const DataType = styled("span")`
  color: gray;
  font-size: x-small;
`;
