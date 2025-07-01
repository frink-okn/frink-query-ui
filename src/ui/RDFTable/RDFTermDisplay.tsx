import { styled } from "@mui/joy";
import type { Term } from "@rdfjs/types";
import { Link } from "@tanstack/react-router";
import { HoverTermCard } from "./HoverTermCard";

interface RDFTermDisplayProps {
  term?: Term;
}

export function RDFTermDisplay({ term }: RDFTermDisplayProps) {
  if (term?.termType === "NamedNode")
    return (
      <HoverTermCard term={term}>
        <Term>
          <Link to="/term/$termId" params={{ termId: term.value }}>
            {term.value}
          </Link>
        </Term>
      </HoverTermCard>
    );

  if (term?.termType === "BlankNode")
    return <Term className="blanknode">{term.value}</Term>;

  if (term?.termType === "Literal")
    return (
      <Term>
        {term.value}
        {term.language.length > 0 && (
          <sup className="lang">@{term.language}</sup>
        )}
        {term.datatype.value !==
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString" && (
          <DataType>^^{term.datatype.value}</DataType>
        )}
      </Term>
    );

  return <Term>{term?.value}</Term>;
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

const DataType = styled("sup")`
  color: gray;
  font-size: x-small;
`;
