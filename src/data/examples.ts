import { getFilesFromGithubFlattened } from "./github-utils";
import yaml from "js-yaml";
import * as v from 'valibot';

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

const examplesFrontmatterSchema = v.object({
  summary: v.string(),
  tags: v.array(v.string()),
});

interface Example {
  title: string;
  sources: string[];
  query: string;
}

export async function fetchExamples(): Promise<Example[]> {
  const files = await getFilesFromGithubFlattened(import.meta.env.VITE_GH_EXAMPLES_DIRECTORY);

  return files.map((file) => {
    const { frontmatter, sparql } = extractSparqlFrontMatter(file);

    const validatorResult = v.safeParse(examplesFrontmatterSchema, frontmatter);
    if (!validatorResult.success) {
      throw new Error(`Error validating example frontmatter: \n${validatorResult.issues}`);
    }

    const { summary, tags } = validatorResult.output;

    return {
      title: summary,
      sources: tags,
      query: sparql,
    }
  })
}
