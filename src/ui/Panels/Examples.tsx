import { styled } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { fetchExamples } from "../../data/examples";
import { ExampleTree } from "../ExampleTree";

export function Examples() {
  const {
    data: examples,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["examples"],
    queryFn: fetchExamples,
    staleTime: 0,
    refetchOnMount: true,
  });

  return (
    <Wrapper>
      {isLoading || !examples ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>{error.message}</div>
      ) : (
        <>
          <p>
            Select a example query below to load it into the <mark>query</mark>{" "}
            panel. Then press the "Run Query" button to execute the query.
          </p>
          <hr />
          <ExampleTree rootNodes={examples} />
        </>
      )}
    </Wrapper>
  );
}

const Wrapper = styled("div")`
  & p {
    margin: 0;

    & mark {
      padding: 0.25rem 0.4rem;
      background-color: var(--p-blue-400);
      text-transform: uppercase;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }
  }

  & hr {
    margin: 0.5rem 0px;
  }
`;
