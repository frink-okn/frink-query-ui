import * as v from 'valibot';

const githubDirectorySchema = v.array(v.looseObject({
  download_url: v.nullable(v.string()),
  type: v.union([v.literal("file"), v.literal("dir")]),
  _links: v.looseObject({
    self: v.pipe(v.string(), v.url()),
  }),
}));

/**
 * Gets the files from a public Github directory and flattens the results into
 * a string array.
 * @param directory the directory in Github. This directory needs to be public.
 * Formatted like this: `{owner}/{repo}/{path_to_directory}
 * @param maxDepth the depth of the subdirectory tree to search. 1 means only files
 * in the top level directory will included in the output.
 * @returns a list of files in the directory, including nested folders up to the
 * specified depth, flattened
 * @warn this function can cause request waterfalls that take a long time, 
 * especially with a large `maxDepth` or on a directory with many files.
 * @link https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content
 */
export const getFilesFromGithubFlattened = async (path: string, maxDepth = 2): Promise<string[]> => {
  const apiBase = `https://api.github.com/repos/${import.meta.env.VITE_GH_REPO}/contents`;

  const traverse = async (url: string, depth = 0): Promise<string[]> => {
    const output: string[] = [];
  
    if (depth >= maxDepth) {
      return output;
    }
  
    const res = await fetch(url, {
      method: "get",
      headers: {
        Accept: "application/vnd.github+json",
      },
    });
    if (!res.ok) throw new Error("Error fetching from Github API: " + res.statusText);
    const validatorResult = v.safeParse(githubDirectorySchema, await res.json());
    if (!validatorResult.success) {
      throw new Error("Error validating Github API response: \n" + validatorResult.issues);
    }
    const data = validatorResult.output;
  
    const fileQueries = data
      .map(({ download_url }) => download_url)
      .filter(url => url !== null)
      .map(url => fetch(url).then(res => {
        if (!res.ok) throw new Error("Error fetching from Github API: " + res.statusText);
        return res.text();
      }));
  
    const nestedFiles = await Promise.all(
      data
        .filter((entry) => entry.type === "dir")
        .map((dir) => traverse(dir._links.self, depth + 1))
    );
    nestedFiles.forEach(files => output.push(...files));
  
    const files = await Promise.all(fileQueries);
    output.push(...files);
  
    return output;
  };

  return traverse(apiBase + path);
}
