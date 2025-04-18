import { styled } from "@mui/joy";
import { exampleQueries } from "../../data/examples";
import { Link } from "@tanstack/react-router";

export function Examples() {
  return (
    <Wrapper>
      <p>
        Select a example query below to load it into the <mark>query</mark>{" "}
        panel. Then press the "Run Query" button to execute the query.
      </p>
      <hr />
      <QueriesWrapper>
        {exampleQueries.map((example) => (
          <div key={example.title}>
            <Link
              to={"/"}
              search={{ query: example.query, sources: example.sources }}
            >
              {example.title}
              {example.sources.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </Link>
          </div>
        ))}
      </QueriesWrapper>
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

const QueriesWrapper = styled("div")`
  display: flex;
  flex-direction: column;

  & > div:not(:last-of-type) {
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px dotted var(--p-slate-300);
  }
`;

const Chip = styled("span")`
  font-size: 0.7rem;
  font-weight: 500;
  padding: 2px 4px;
  background-color: var(--p-slate-200);
  border-radius: 6px;
  transform: translateY(-1.5px);
  margin-left: 1ch;
  color: var(--p-slate-700);
  display: inline-block; // removes underline
`;
