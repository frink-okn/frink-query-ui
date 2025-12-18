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
import { groupSources, sourceCategories } from "../data/sources";
import type { CustomSource } from "./CustomSourcesModal";
import { useQueryContext } from "../context/query";

const SOURCE_LABELS: Record<string, string> = {
  custom: "Custom sources",
  federation: "Federation",
  registry: "OKN registry",
  other: "Other graphs",
};

const getLabelString = (
  selectedOptions: SelectOption<string>[],
  cutoff: number,
  idToLabel: Record<string, string>,
) => {
  if (selectedOptions.length > cutoff)
    return `${selectedOptions.length} sources selected`;
  return selectedOptions.map((so) => idToLabel[so.value]).join(", ");
};

const rootRouteApi = getRouteApi("__root__");
const indexRouteApi = getRouteApi("/");

interface SourceSelectProps {
  customSources: CustomSource[];
}

export const SourceSelect = React.memo(
  ({ customSources }: SourceSelectProps) => {
    const { sources } = rootRouteApi.useLoaderData();
    const searchParams = indexRouteApi.useSearch();
    const navigate = indexRouteApi.useNavigate();
    const { selectedCustomSources, setSelectedCustomSources } =
      useQueryContext()!;

    const groupedSources = useMemo(() => groupSources(sources), [sources]);

    // Map of all value keys to labels for renderValue
    const idToLabel: Record<string, string> = useMemo(() => {
      const map: Record<string, string> = {};
      sources.forEach((s) => (map[s.shortname] = s.name));
      customSources.forEach((cs) => (map[cs.name] = cs.name));
      return map;
    }, [sources, customSources]);

    // Selected IDs for Joy Select
    const selectedIds = useMemo(() => {
      const urlSources = sources
        .filter((s) => searchParams.sources.includes(s.shortname))
        .map((s) => s.shortname);

      const customIds = selectedCustomSources.map((cs) => cs.name);
      return [...urlSources, ...customIds];
    }, [searchParams, sources, selectedCustomSources]);

    const isFederatedSparqlSelected = useMemo(
      () => selectedIds.includes("federation"),
      [selectedIds],
    );

    return (
      <Select
        multiple
        placeholder="Select Sources"
        value={selectedIds}
        renderValue={(opts) => getLabelString(opts, 3, idToLabel)}
        onChange={(_, newValue) => {
          const newCustomSources = newValue
            .filter((id) => !sources.find((s) => s.shortname === id))
            .map((id) => {
              const cs = customSources.find((c) => c.name === id)!;
              return { name: cs.name, url: cs.url };
            });

          const newDefaultSources = newValue
            .filter((id) => sources.find((s) => s.shortname === id))
            .map((id) => {
              const s = sources.find((s) => s.shortname === id)!;
              return {
                source: s,
                type: sourceCategories.get(s.shortname) ?? "other",
              };
            });

          setSelectedCustomSources(newCustomSources);

          navigate({
            search: (prev) => ({
              ...prev,
              sources: newDefaultSources.map((s) => s.source.shortname),
            }),
          });
        }}
        sx={{ flex: 1 }}
      >
        {Object.entries(groupedSources)
          .concat(
            customSources.length
              ? [
                  [
                    "custom",
                    customSources.map((cs) => ({
                      category: "custom" as const,
                      name: cs.name,
                      shortname: cs.name,
                      endpoint: cs.url,
                    })),
                  ],
                ]
              : [],
          )
          .sort(([groupA], [groupB]) => {
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
              {sources
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((source) => (
                  <Option
                    key={source.shortname}
                    value={source.shortname}
                    disabled={
                      (isFederatedSparqlSelected &&
                        source.shortname !== "federation") ||
                      (!isFederatedSparqlSelected &&
                        selectedIds.length > 0 &&
                        source.shortname === "federation")
                    }
                  >
                    <Checkbox
                      tabIndex={0}
                      checked={selectedIds.includes(source.shortname)}
                    />
                    {source.name}
                  </Option>
                ))}
            </List>
          ))}
      </Select>
    );
  },
);
