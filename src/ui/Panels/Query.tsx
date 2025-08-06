import { ArrowForwardRounded, SaveRounded, Stop } from "@mui/icons-material";
import { Button, ButtonGroup, styled } from "@mui/joy";
import { SourceSelect } from "../SourceSelect";
import { YasqeEditor } from "../YasqeEditor";
import { useEffect, useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { useQueryContext } from "../../context/query";
import { SaveQueryDialog } from "../SaveQueryDialog";

const rootRouteApi = getRouteApi("__root__");
const indexRouteApi = getRouteApi("/");

export function Query() {
  const { sources } = rootRouteApi.useLoaderData();
  const searchParams = indexRouteApi.useSearch();
  const navigate = indexRouteApi.useNavigate();

  const { runQuery, stopQuery, isRunning } = useQueryContext()!;

  const [saveQueryDialogOpen, setSaveQueryDialogOpen] = useState(false);

  const [isSparqlValid, setIsSparqlValid] = useState(true);
  const [fastUpdatingSparql, setFastUpdatingSparql] = useState(
    searchParams.query,
  );
  const debouncedSparql = useDebounce(fastUpdatingSparql, 250);

  useEffect(() => {
    navigate({
      search: (prev) => ({ ...prev, query: debouncedSparql }),
      replace: true,
    });
    localStorage.setItem("sparql-query", debouncedSparql);
  }, [debouncedSparql, navigate]);

  useEffect(() => {
    setFastUpdatingSparql(searchParams.query);
  }, [searchParams.query]);

  useEffect(() => {
    localStorage.setItem("sources", JSON.stringify(searchParams.sources));
  }, [searchParams.sources])

  const selectedSources = useMemo(
    () => sources.filter((s) => searchParams.sources.includes(s.shortname)),
    [searchParams, sources],
  );

  return (
    <Wrapper>
      <LabelContainer>
        <h3>Sources</h3>
        <SourceSelect />
      </LabelContainer>

      <LabelContainer className="query">
        <h3>SPARQL Query</h3>
        <YasqeEditor
          value={fastUpdatingSparql}
          onChange={(newValue, isSyntaxValid) => {
            setFastUpdatingSparql(newValue);
            setIsSparqlValid(isSyntaxValid);
          }}
        />
      </LabelContainer>

      <ButtonsContainer>
        <ButtonGroup>
          <Button
            color={"neutral"}
            variant={"outlined"}
            endDecorator={<SaveRounded />}
            onClick={() => setSaveQueryDialogOpen(true)}
          >
            Save Query
          </Button>
          {isRunning ? (
            <Button
              color={"danger"}
              variant={"solid"}
              endDecorator={<Stop />}
              onClick={stopQuery}
            >
              Stop Query
            </Button>
          ) : (
            <Button
              color={"primary"}
              variant={"solid"}
              endDecorator={<ArrowForwardRounded />}
              disabled={!isSparqlValid || selectedSources.length < 1}
              onClick={() => {
                runQuery(searchParams.query, selectedSources);
              }}
            >
              Run Query
            </Button>
          )}
        </ButtonGroup>
      </ButtonsContainer>

      <SaveQueryDialog
        open={saveQueryDialogOpen}
        setOpen={setSaveQueryDialogOpen}
        query={fastUpdatingSparql}
        sources={selectedSources.map((s) => s.shortname)}
      />
    </Wrapper>
  );
}

const Wrapper = styled("div")`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LabelContainer = styled("div")`
  display: flex;
  flex-direction: column;

  &.query {
    flex: 1;
    display: flex;
    flex-direction: column;

    /*
    By default this is auto, we have to set it to 0 so that it can be
    smaller than its content. This is important for the .editor-wrapper
    to overflow properly.
    */
    min-height: 0px;
  }

  & > h3 {
    margin: 0px;
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 6px;
  }
`;

const ButtonsContainer = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 1rem;
`;
