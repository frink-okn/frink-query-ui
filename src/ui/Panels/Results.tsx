import { useQueryContext } from "../../context/query";
import { IconButton, styled, Tooltip } from "@mui/joy";
import { WrapText, Download } from "@mui/icons-material";
import { RDFTable } from "../RDFTable/RDFTable";
import { useMemo, useState } from "react";
import { ResultsTimer } from "../ResultsTimer";
import { getRouteApi } from "@tanstack/react-router";

const indexRouteApi = getRouteApi("/");

export function Results() {
  const {
    results,
    lastSubmittedQuery,
    columns,
    isRunning,
    possiblyIncomplete,
    errorMessage,
    downloadResultsAsCSV,
    msElapsed,
  } = useQueryContext()!;

  const [isTextWrapped, setIsTextWrapped] = useState(false);

  const searchParams = indexRouteApi.useSearch();

  const queryHasBeenEdited = useMemo(
    () =>
      searchParams.query !== lastSubmittedQuery?.query ||
      searchParams.sources.length !==
      lastSubmittedQuery.sources.filter(
        ({ category }) => category !== "custom"
      ).length ||
      !lastSubmittedQuery.sources
        .filter(({ category }) => category !== "custom")
        .map((s) => s.shortname)
        .every((s) => searchParams.sources.includes(s)),
    [searchParams, lastSubmittedQuery]
  );

  console.log(lastSubmittedQuery?.sources);

  if (msElapsed === 0 && !isRunning) {
    return (
      <CenteredMessage>
        <p>Please run a query to view the results here.</p>
      </CenteredMessage>
    );
  }

  return (
    <Wrapper>
      <Toolbar>
        <div>
          <ResultsTimer />
          {!isRunning && possiblyIncomplete && <div>Possibly incomplete.</div>}
          {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
          {queryHasBeenEdited && (
            <div style={{ color: "red" }}>
              Query has been edited—results may be out of date.
            </div>
          )}
        </div>
        <ButtonWrapper>
          <Tooltip title="Toggle text wrapping" placement="top">
            <IconButton
              variant="soft"
              onClick={() => setIsTextWrapped(!isTextWrapped)}
              color={isTextWrapped ? "primary" : "neutral"}
            >
              <WrapText />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download results as CSV" placement="top">
            <IconButton variant="soft" onClick={downloadResultsAsCSV}>
              <Download />
            </IconButton>
          </Tooltip>
        </ButtonWrapper>
      </Toolbar>
      <TableWrapper>
        <RDFTable columns={columns} rows={results} wrapText={isTextWrapped} />
      </TableWrapper>
    </Wrapper>
  );
}

const Wrapper = styled("div")`
  --parent-padding: 0.75rem;
  margin: calc(-1 * var(--parent-padding));
  display: flex;
  flex-direction: column;
  height: calc(100% + 2 * var(--parent-padding));
`;

const Toolbar = styled("header")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  gap: 0.5rem;
`;

const ButtonWrapper = styled("div")`
  display: flex;
  gap: 0.5rem;
`;

const TableWrapper = styled("div")`
  flex: 1;
  overflow-y: auto;
  min-height: 0px;
`;

const CenteredMessage = styled("div")`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  & > p {
    margin: 0;
    font-style: italic;
    font-size: 1.5rem;
    color: var(--p-slate-400);
  }
`;
