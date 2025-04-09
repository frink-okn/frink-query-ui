import { styled } from "@mui/joy";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useWindowSize } from "@uidotdev/usehooks";
import { TermPagePanels } from "../ui/Panels/layout/TermPagePanels";

export const Route = createFileRoute("/term/$termId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { termId } = Route.useParams();

  const { width } = useWindowSize();
  if (!width) return null;

  return (
    <Wrapper>
      <header>
        <Heading style={{ margin: 0 }}>{termId}</Heading>
        <Link to="/" search={{ query: termId, sources: ["ubergraph"] }}>
          Test query
        </Link>
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
