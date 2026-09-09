import yaml from "js-yaml";
import * as v from "valibot";
import { FEDERATION_SPARQL_ENDPOINT } from "../config";

// This info isn't currently in the yaml, so it needs to be manually
// linked here. If that changes in the future, this file can be updated.
const federationSource = {
  name: "Proto-OKN Federated SPARQL",
  shortname: "federation",
  endpoint: FEDERATION_SPARQL_ENDPOINT,
};

export type SourceCategory = "registry" | "federation" | "other" | "custom";

// Categories for sources. Most sources from the OKN registry YAML will
// automatically be categorized as "registry". Only sources that need
// special categorization (like hardcoded graphs or federation) are listed here.
export const sourceCategories: Map<string, SourceCategory> = new Map([
  ["ubergraph", "other"],
  ["wikidata", "other"],
  ["federation", "federation"],
]);

type SPARQLSource = {
  category: SourceCategory;
  name: string;
  shortname: string;
  endpoint: string;
};
type TPFSource = {
  category: SourceCategory;
  name: string;
  shortname: string;
  tpfEndpoint: string;
};
type CompoundSource = {
  category: SourceCategory;
  name: string;
  shortname: string;
  sparqlEndpoint: string;
  tpfEndpoint: string;
};
export type Source = SPARQLSource | TPFSource | CompoundSource;

type RegistrySource =
  | Omit<SPARQLSource, "category">
  | Omit<TPFSource, "category">
  | Omit<CompoundSource, "category">;

const registrySourceSchema = v.object({
  title: v.string(),
  shortname: v.string(),
  sparql: v.optional(v.pipe(v.string(), v.url())),
  tpf: v.optional(v.pipe(v.string(), v.url())),
});
const allRegistrySourcesSchema = v.pipe(
  v.object({ kgs: v.array(registrySourceSchema) }),
  v.transform(({ kgs }) =>
    kgs.flatMap<RegistrySource>((source) => {
      const common = {
        name: source.title,
        shortname: source.shortname,
      };

      if (source.sparql === undefined) {
        return source.tpf === undefined
          ? []
          : [{ ...common, tpfEndpoint: source.tpf }];
      }

      // Keep both endpoints when possible so multi-source queries can prefer
      // TPF, while single-source queries continue to use SPARQL.
      return source.tpf === undefined
        ? [{ ...common, endpoint: source.sparql }]
        : [
            {
              ...common,
              sparqlEndpoint: source.sparql,
              tpfEndpoint: source.tpf,
            },
          ];
    }),
  ),
);

/**
 * fetches kg list yaml from github and constructs a json array of sources
 */
export async function fetchSources(): Promise<Source[]> {
  const yamlSourcesUrl = `https://raw.githubusercontent.com/${
    import.meta.env.VITE_GH_REPO
  }/refs/heads/main${import.meta.env.VITE_GH_SOURCES}`;

  // fetch yaml from frink-landing-zone Github. Ensure env var is set!
  const res = await fetch(yamlSourcesUrl, {
    method: "get",
    headers: { Accept: "text/plain" },
  });
  if (!res.ok) throw new Error(`HTTP Error: ${res.statusText}`);

  // Parse the registry sources from the YAML, then select the endpoint shape
  // that Comunica should use for single-source and federated queries.
  const sourcesJson = yaml.load(await res.text());
  const validatedSources = v.parse(allRegistrySourcesSchema, sourcesJson);

  // Apply information not in the yaml file (see top of file):
  //   - federation source
  //   - categories
  const combinedSources = [...validatedSources, federationSource].map(
    (source) => ({
      ...source,
      category: sourceCategories.get(source.shortname) ?? "registry",
    }),
  );

  return combinedSources;
}

/**
 * Helper function to group sources into an object with categories mapping to sources arrays
 */
export function groupSources(sources: Source[]): {
  [c in SourceCategory]: Source[];
} {
  return sources.reduce(
    (obj, curr) => {
      (obj[curr.category] ??= []).push(curr);
      return obj;
    },
    {} as Record<SourceCategory, Source[]>,
  );
}
