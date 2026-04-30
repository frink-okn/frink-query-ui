import { styled } from "@mui/joy";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useComunicaQuery } from "../../../hooks/useComunicaQuery";
import { RDFTable } from "../../RDFTable/RDFTable"

interface TermPanelProps {
  querySparql: string;
}

const rootRouteApi = getRouteApi("__root__");

export function TermPanel({ querySparql }: TermPanelProps) {
  const { sources } = rootRouteApi.useLoaderData();

  const query = useComunicaQuery({
    runOnMount: true,
    query: querySparql,
    sources: sources.filter((s) => s.shortname === "federation"),
  });

  if (query.isRunning) return <div>Loading...</div>;

  return (
    <PanelWrapper>
      <TableHeader>
        <Link
          to="/"
          search={{
            query: querySparql.replace("LIMIT 50", "LIMIT 1000"),
            sources: ["federation"],
          }}
        >
          First 50 results, click to view full query.
        </Link>
      </TableHeader>
      <TableWrapper>
        <RDFTable
          columns={query.columns}
          rows={query.results}
          wrapText={true}
          resolveLabels={true}
        />
      </TableWrapper>
    </PanelWrapper>
  );
}


const PanelWrapper = styled("div")`
  --parent-padding: 0.75rem;
  height: calc(100% + 2 * var(--parent-padding));
  margin: calc(-1 * var(--parent-padding));
  display: flex;
  flex-direction: column;
`;

const TableWrapper = styled("div")`
  flex: 1;
  min-height: 0px;
`;

const TableHeader = styled("header")`
  padding: 0.75rem 1rem 0rem 1rem;
  gap: 0.5rem;
  background-color: var(--p-slate-50);
`;
