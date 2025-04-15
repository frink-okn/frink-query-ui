import { getFilesFromGithubFlattened } from "./github-utils";

interface Example {
  title: string;
  sources: string[];
  query: string;
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
