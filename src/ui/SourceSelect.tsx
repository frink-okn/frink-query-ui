import {
  Checkbox,
  List,
  ListItem,
  Option,
  Select,
  Typography,
  type SelectOption,
} from "@mui/joy";
import React, { useMemo } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { groupSources, type Source } from "../data/sources";

const SOURCE_LABELS: Record<string, string> = {
  federation: "Federation",
  frink: "Frink graphs",
  "theme-1": "Theme 1 graphs",
  other: "Other graphs",
};

const getLabelString = (
  selectedOptions: SelectOption<Source>[],
  cutoff: number,
) => {
  if (selectedOptions.length > cutoff)
    return `${selectedOptions.length} sources selected`;
  else return selectedOptions.map((so) => so.label).join(", ");
};

const rootRouteApi = getRouteApi("__root__");
const indexRouteApi = getRouteApi("/");

export const SourceSelect = React.memo(() => {
  const { sources } = rootRouteApi.useLoaderData();
  const searchParams = indexRouteApi.useSearch();
  const navigate = indexRouteApi.useNavigate();

  const groupedSources = useMemo(() => groupSources(sources), [sources]);

  const selectedSources = useMemo(
    () => sources.filter((s) => searchParams.sources.includes(s.shortname)),
    [searchParams, sources],
  );

  const isFederatedSparqlSelected = useMemo(
    () => Boolean(selectedSources.find((s) => s.shortname === "federation")),
    [selectedSources],
  );

  return (
    <Select
      multiple
      placeholder="Select Sources"
      renderValue={(opt) => getLabelString(opt, 3)}
      value={selectedSources}
      onChange={(_, newValue) => {
        navigate({
          search: (prev) => ({
            ...prev,
            sources: newValue.map((s) => s.shortname),
          }),
        });
      }}
    >
      {Object.entries(groupedSources).map(([group, sources]) => (
        <List key={group}>
          <ListItem>
            <Typography
              level="body-md"
              sx={{ fontWeight: "bold", color: "var(--p-slate-500)" }}
            >
              {SOURCE_LABELS[group]}
            </Typography>
          </ListItem>
          {sources.map((source) => (
            <Option
              key={source.shortname}
              value={source}
              disabled={
                (isFederatedSparqlSelected &&
                  source.shortname !== "federation") ||
                (!isFederatedSparqlSelected &&
                  selectedSources.length > 0 &&
                  source.shortname === "federation")
              }
            >
              <Checkbox
                tab-index="0"
                checked={
                  selectedSources?.findIndex(
                    (selectedSource) =>
                      selectedSource.shortname === source.shortname,
                  ) !== -1
                }
              />
              {source.name}
            </Option>
          ))}
        </List>
      ))}
    </Select>
  );
});
