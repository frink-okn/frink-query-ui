import { getFilesFromGithubFlattened } from "./github-utils";
import yaml from "js-yaml";

interface Example {
  title: string;
  sources: string[];
  query: string;
}

/**
 * Extracts the frontmatter from a SPARQL query string and parses it with
 * js-yaml. Frontmatter must be at the start of the file, contiguous, start
 * with `#+`, and be valid yaml when extracted
 * @param sparql the SPARQL query string
 * @param removeFrontmatter should the return string have the frontmatter stripped? 
 * @returns the SPARQL query string and the parsed frontmatter
 */
function extractSparqlFrontMatter(sparql: string, removeFrontmatter = true): {
  sparql: string,
  frontmatter: unknown;
} {
  const frontMatterRegex = /^#\+ (?<value>.*)$/;
  let frontmatterLines = [];
  let splitLineNumber = 0;
  
  for (const [lineNumber, line] of Object.entries(sparql.split("\n"))) {
    const match = line.match(frontMatterRegex);
    if (!match) break;
    splitLineNumber = parseInt(lineNumber);
    frontmatterLines.push(match.groups!.value);
  }

  return {
    frontmatter: yaml.load(frontmatterLines.join("\n")),
    sparql: removeFrontmatter
      ? sparql
          .split("\n")
          .slice(splitLineNumber + 1, -1)
          .join("\n")
      : sparql,
  }
  
}

export async function fetchExamples(): Promise<Example[]> {
  const files = await getFilesFromGithubFlattened(import.meta.env.VITE_GH_EXAMPLES_DIRECTORY);

  const examples = files.map((file, i) => ({
    title: "Temp title " + i,
    sources: ["hydrologykg"],
    query: file,
  }))

  return examples;
}
