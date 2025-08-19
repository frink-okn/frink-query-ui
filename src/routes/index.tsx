import { createFileRoute } from "@tanstack/react-router";
import { IndexPagePanels } from "../ui/Panels/layout/IndexPagePanels";
import { Saved } from "../ui/Panels/Saved";
import { Examples } from "../ui/Panels/Examples";
import { Query } from "../ui/Panels/Query";
import { Results } from "../ui/Panels/Results";
import { styled, SvgIcon } from "@mui/joy";
import { GitHub } from "@mui/icons-material";
import * as v from "valibot";
import { fetchExamples } from "../data/examples";

const DEFAULT_QUERY = `\
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT * WHERE {
  ?sub ?pred ?obj .
} LIMIT 10\
`;

const DEFAULT_SOURCES = ["federation"];

const getSourcesFromLocalStorage = (): string[] => {
  const rawSources = localStorage.getItem("sources");
  if (!rawSources) return DEFAULT_SOURCES;
  let jsonParsedSources;
  try {
    jsonParsedSources = JSON.parse(rawSources);
  } catch {
    return DEFAULT_SOURCES;
  }
  const parsedSources = v.safeParse(v.array(v.string()), jsonParsedSources);
  return parsedSources.success ? parsedSources.output : DEFAULT_SOURCES;
};

// make optional search params always have a default value
const searchParamsSchema = v.pipe(
  v.object({
    query: v.optional(v.string()),
    sources: v.optional(v.array(v.string())),
  }),
  v.transform((obj) => ({
    query: obj.query ?? localStorage.getItem("sparql-query") ?? DEFAULT_QUERY,
    sources: obj.sources ?? getSourcesFromLocalStorage(),
  })),
);

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    // We can kick off the examples fetching here, without blocking the page.
    // The useQuery hook in the Examples component will use the cached data
    // if available
    queryClient.fetchQuery({
      queryKey: ["examples"],
      queryFn: fetchExamples,
      staleTime: 24 * 60 * 60 * 1000,
    });
  },
  validateSearch: searchParamsSchema,
});

function RouteComponent() {
  return (
    <Wrapper>
      <IndexPagePanels
        tabs={[
          {
            id: "examples",
            label: "Examples",
            color: "var(--p-teal-400)",
            jsx: <Examples />,
          },
          {
            id: "saved",
            label: "Saved",
            color: "var(--p-amber-400)",
            jsx: <Saved />,
          },
          {
            id: "query",
            label: "Query",
            color: "var(--p-blue-400)",
            jsx: <Query />,
          },
          {
            id: "results",
            label: "Results",
            color: "var(--p-purple-400)",
            jsx: <Results />,
          },
        ]}
      />

      <Footer>
        <AttributionText>
          <BackgroundFader aria-hidden="true"></BackgroundFader>
          <small>
            <a
              href="https://renci.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              RENCI
            </a>
          </small>
          <small>
            <a
              href="https://github.com/frink-okn/frink-query-ui/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source code available on{" "}
              <SvgIcon component={GitHub} fontSize="lg" color="inherit" />
            </a>
          </small>
          <small>
            Powered by{" "}
            <a
              href="https://comunica.dev/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Comunica
            </a>
          </small>
        </AttributionText>
      </Footer>
    </Wrapper>
  );
}

const Wrapper = styled("div")`
  height: 100%;
  padding: 1rem;
  padding-bottom: 0;

  display: flex;
  flex-direction: column;

  @media (max-width: 800px) {
    padding: 0.5rem;
    padding-bottom: 0;
  }
`;

const Footer = styled("footer")`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AttributionText = styled("div")`
  padding: 8px;
  text-align: center;
  position: relative;

  & > small:not(:last-of-type)::after {
    content: "|";
    color: var(--p-slate-500);
    margin: 0px 1ch 0px 1.5ch;
  }
`;

const BackgroundFader = styled("div")`
  background-color: var(--p-slate-50);
  filter: blur(10px);
  z-index: -1;
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 0px;
  right: 0px;
`;
