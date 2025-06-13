import * as v from "valibot";

const githubDirectorySchema = v.array(
  v.looseObject({
    name: v.string(),
    download_url: v.nullable(v.string()),
    type: v.union([v.literal("file"), v.literal("dir")]),
    _links: v.looseObject({
      self: v.pipe(v.string(), v.url()),
    }),
  })
);

export type FileNode =
  | {
      type: "dir";
      name: string;
      children: FileNode[];
    }
  | {
      type: "file";
      contents: string;
    };

/**
 * Gets a tree of files from a public Github directory.
 * @param directory the directory in Github. This directory needs to be public.
 * Formatted like this: `{owner}/{repo}/{path_to_directory}
 * @param maxDepth the depth of the subdirectory tree to search. 1 means only files
 * in the top level directory will included in the output.
 * @returns a tree of files in the directory, including nested folders up to the
 * specified depth
 * @warn this function can cause request waterfalls that take a long time,
 * especially with a large `maxDepth` or on a directory with many files.
 * @link https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content
 */
export const getFilesFromGithub = async (
  path: string,
  maxDepth = 2
): Promise<FileNode[]> => {
  const apiBase = `https://api.github.com/repos/${import.meta.env.VITE_GH_REPO}/contents`;

  const traverse = async (url: string, depth = 0): Promise<FileNode[]> => {
    const output: FileNode[] = [];

    if (depth >= maxDepth) {
      return output;
    }

    const res = await fetch(url, {
      method: "get",
      headers: {
        Accept: "application/vnd.github+json",
        ...(import.meta.env.VITE_GH_TOKEN && {
          Authorization: `Bearer ${import.meta.env.VITE_GH_TOKEN}`,
        }),
      },
    });
    if (!res.ok)
      throw new Error("Error fetching from Github API: " + res.statusText);
    const validatorResult = v.safeParse(
      githubDirectorySchema,
      await res.json()
    );
    if (!validatorResult.success) {
      throw new Error(
        "Error validating Github API response: \n" + validatorResult.issues
      );
    }
    const data = validatorResult.output;

    const fileQueries: Promise<string>[] = data
      .map(({ download_url }) => download_url)
      .filter((url) => url !== null)
      .map((url) =>
        fetch(url).then((res) => {
          if (!res.ok)
            throw new Error(
              "Error fetching from Github API: " + res.statusText
            );
          return res.text();
        })
      );

    const directories: FileNode[] = (
      await Promise.all(
        data
          .filter((entry) => entry.type === "dir")
          .map((dir) =>
            traverse(dir._links.self, depth + 1).then((children) => ({
              parentName: dir.name,
              children,
            }))
          )
      )
    ).map(({ parentName, children }) => ({
      type: "dir" as const,
      name: parentName,
      children,
    }));

    const files: FileNode[] = (await Promise.all(fileQueries)).map(
      (contents) => ({
        type: "file" as const,
        contents,
      })
    );

    output.push(...directories, ...files);
    return output;
  };

  return traverse(apiBase + path);
};
