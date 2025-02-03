import { styled } from "@mui/joy";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/term/$termId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { termId } = Route.useParams();

  return (
    <Wrapper>
      <h1 style={{ margin: 0 }}>{termId}</h1>
      <Link to="/" search={{ query: termId, sources: ["ubergraph"] }}>
        Test query
      </Link>
    </Wrapper>
  );
}

const Wrapper = styled("div")`
  height: 100%;
  padding: 1rem;
  padding-bottom: 0;

  @media (max-width: 800px) {
    padding: 0.5rem;
    padding-bottom: 0;
  }
`;
