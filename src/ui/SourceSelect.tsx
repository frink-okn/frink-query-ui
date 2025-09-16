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
import type { CustomSource } from "./CustomSourcesModal";

const SOURCE_LABELS: Record<string, string> = {
  custom: "Custom Sources",
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

interface SourceSelectProps {
  customSources: CustomSource[]
}
export const SourceSelect = React.memo(({ customSources }: SourceSelectProps) => {
  const { sources } = rootRouteApi.useLoaderData();
  const searchParams = indexRouteApi.useSearch();
  const navigate = indexRouteApi.useNavigate();

  const groupedSources = useMemo(() => groupSources(sources), [sources]);

  const selectedSources = useMemo(
    () => {
      const selectedCustomSources: Source[] = searchParams.sources.filter((cs) => typeof cs !== "string").map((cs) => ({
        category: "other",
        name: cs.name,
        shortname: cs.name,
        endpoint: cs.url
      }))
      const selectedNormalSources = sources.filter((s) => searchParams.sources.includes(s.shortname));
      return selectedNormalSources.concat(selectedCustomSources);
    },
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
            // TODO: fix source type cast
            sources: newValue.map((s) => s.category === "custom" ? ({ name: s.name, url: (s as { endpoint: string }).endpoint }) : s.shortname),
          }),
        });
      }}
      sx={{ flex: 1 }}
    >
      {Object.entries(groupedSources)
        .concat(customSources.length ? [["custom",
          customSources.map((cs) => ({
            category: "custom" as const,
            name: cs.name,
            shortname: cs.name,
            endpoint: cs.url,
          }))
        ]] : [])
        .sort(([groupA], [groupB]) => {
          // sort by order of appearance in SOURCE_LABELS
          const indexA = Object.keys(SOURCE_LABELS).indexOf(groupA);
          const indexB = Object.keys(SOURCE_LABELS).indexOf(groupB);
          return indexA - indexB;
        })
        .map(([group, sources]) => (
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
