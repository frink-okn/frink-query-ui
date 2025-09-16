import yaml from "js-yaml";
import * as v from "valibot";

// This info isn't currently in the yaml, so it needs to be manually
// linked here. If that changes in the future, this file can be updated.
const federationSource = {
  name: "FRINK Federated SPARQL",
  shortname: "federation",
  endpoint: "https://frink.apps.renci.org/federation/sparql",
};

type SourceCategory = "theme-1" | "frink" | "federation" | "other" | "custom";

// prettier-ignore
const sourceCategories: Map<string, SourceCategory> = new Map([
  ["biobricks-ice",   "theme-1"],
  ["biohealth",       "theme-1"],
  ["nasa-gesdisc-kg", "theme-1"],
  ["climatemodelskg", "theme-1"],
  ["dreamkg",         "theme-1"],
  ["ruralkg",         "theme-1"],
  ["sawgraph",        "theme-1"],
  ["hydrologykg",     "theme-1"],
  ["fiokg",           "theme-1"],
  ["spatialkg",       "theme-1"],
  ["scales",          "theme-1"],
  ["securechainkg",   "theme-1"],
  ["semopenalex",     "theme-1"],
  ["sockg",           "theme-1"],
  ["spoke",           "theme-1"],
  ["sudokn",          "theme-1"],
  ["ufokn",           "theme-1"],
  ["wildlifekn",      "theme-1"],
  ["nikg",            "theme-1"],
  ["geoconnex",       "theme-1"],
  ["ubergraph",       "frink"],
  ["wikidata",        "frink"],
  ["federation",      "federation"],
]);

const compoundSourceSchema = v.object({
  title: v.string(),
  shortname: v.string(),
  // optional for Bio-Health KG, ideally made required when yaml file is fixed:
  sparql: v.optional(v.pipe(v.string(), v.url())),
  tpf: v.optional(v.pipe(v.string(), v.url())),
});
const allCompoundSourcesSchema = v.pipe(
  v.object({ kgs: v.array(compoundSourceSchema) }),
  v.transform(({ kgs }) =>
    kgs
      .filter(
        // Bio-Health KG doesn't have these values we need, so filter it
        (
          source
        ): source is Required<v.InferOutput<typeof compoundSourceSchema>> =>
          source.sparql !== undefined && source.tpf !== undefined
      )
      .map((source) => ({
        name: source.title,
        shortname: source.shortname,
        sparqlEndpoint: source.sparql,
        tpfEndpoint: source.tpf,
      }))
  )
);

type SPARQLSource = {
  category: SourceCategory;
  name: string;
  shortname: string;
  endpoint: string;
};
type CompoundSource = {
  category: SourceCategory;
  name: string;
  shortname: string;
  sparqlEndpoint: string;
  tpfEndpoint: string;
};
export type Source = SPARQLSource | CompoundSource;

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

  // parse the compound kg sources from the yaml into JSON, and validate
  // and transform with Valibot
  const sourcesJson = yaml.load(await res.text());
  const validatedSources = v.parse(allCompoundSourcesSchema, sourcesJson);

  // Apply information not in the yaml file (see top of file):
  //   - federation source
  //   - categories
  const combinedSources = [...validatedSources, federationSource].map(
    (source) => ({
      ...source,
      category: sourceCategories.get(source.shortname) ?? "other",
    })
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
    {} as Record<SourceCategory, Source[]>
  );
}
