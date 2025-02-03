import { IconButton, styled } from "@mui/joy";
import { useSavedQueriesContext } from "../../context/savedQueries";
import { Link } from "@tanstack/react-router";
import { Delete } from "@mui/icons-material";

const formatDate = (timestamp: number) =>
  new Date(timestamp)
    .toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
    .replace(" PM", "pm")
    .replace(" AM", "am");

export function Saved() {
  const { savedQueries, deleteQuery } = useSavedQueriesContext()!;

  return (
    <Wrapper>
      <p>
        You can save the current query by pressing the "Save Query" button in
        the <mark>Query</mark> panel. This will be persisted in the browser
        between sessions using local storage. To load a saved query, click on
        the name. Note that just the query is saved, not the results.
      </p>
      {savedQueries.length > 0 && <hr />}
      <QueriesWrapper>
        {savedQueries
          // .sort((a, b) => b.timestamp - a.timestamp)
          .map((saved) => (
            <Query key={saved.title}>
              <Link
                to={"/"}
                search={{ query: saved.query, sources: saved.sources }}
              >
                {saved.title}
                {saved.sources.map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
                <DateStamp>{formatDate(saved.timestamp)}</DateStamp>
              </Link>
              <IconButton size="sm" onClick={() => deleteQuery(saved.title)}>
                <Delete />
              </IconButton>
            </Query>
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

const Query = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
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

const DateStamp = styled("small")`
  font-size: 0.75rem;
  text-decoration: none;
  color: var(--p-slate-500);
  margin-left: 1ch;
`;
