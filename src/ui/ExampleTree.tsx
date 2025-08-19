import { Folder, FolderOpen } from "@mui/icons-material";
import type { ExampleNode } from "../data/examples";
import {
  Collection,
  Tree,
  TreeItem,
  TreeItemContent,
} from "react-aria-components";
import { styled } from "@mui/joy";
import { Link } from "@tanstack/react-router";

export function ExampleTree({ rootNodes }: { rootNodes: ExampleNode[] }) {
  return (
    <StyledTree items={rootNodes}>
      {/* @ts-expect-error the styled component causes the renderItem function to throw a type warning */}
      {function renderItem(item: ExampleNode) {
        return (
          <TreeItem textValue={item.title} id={item.sha}>
            <TreeItemContent>
              {({ isExpanded }) =>
                item.type === "folder" ? (
                  <FolderItem item={item} isExpanded={isExpanded} />
                ) : (
                  <ExampleItem item={item} />
                )
              }
            </TreeItemContent>
            {item.type === "folder" && item.children.length > 0 && (
              <Collection items={item.children}>{renderItem}</Collection>
            )}
          </TreeItem>
        );
      }}
    </StyledTree>
  );
}

interface FolderItemProps {
  item: Extract<ExampleNode, { type: "folder" }>;
  isExpanded: boolean;
}
const FolderItem = ({ item, isExpanded }: FolderItemProps) => (
  <FolderItemWrapper>
    {item.type === "folder" &&
      (isExpanded ? (
        <FolderOpen htmlColor="var(--p-slate-400)" />
      ) : (
        <Folder htmlColor="var(--p-slate-400)" />
      ))}
    {item.title}
  </FolderItemWrapper>
);

interface ExampleItemProps {
  item: Extract<ExampleNode, { type: "example" }>;
}
const ExampleItem = ({ item }: ExampleItemProps) => (
  <Link to={"/"} search={{ query: item.query, sources: item.sources }}>
    {item.title}
    {item.sources.map((s) => (
      <Chip key={s}>{s}</Chip>
    ))}
  </Link>
);

const StyledTree = styled(Tree)`
  display: flex;
  flex-direction: column;

  & > div:not(:last-of-type) {
    padding-bottom: 0.25rem;
    margin-bottom: 0.25rem;
    border-bottom: 1px dotted var(--p-slate-300);
  }

  & .react-aria-TreeItem {
    --gap: 4px;
    --icon-size: 24px; // this should match the folder icon size
    margin-left: calc(
      (var(--tree-item-level) - 1) * (var(--icon-size) + var(--gap))
    );
  }
`;

const FolderItemWrapper = styled("div")`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--gap);
`;

const Chip = styled("span")`
  font-size: 0.7rem;
  font-weight: 500;
  padding: 2px 4px;
  background-color: var(--p-slate-200);
  border-radius: 6px;
  transform: translateY(-1.5px);
  margin-left: 1ch;
  color: var(--p-slate-700);
  display: inline-block; // removes underline
`;
