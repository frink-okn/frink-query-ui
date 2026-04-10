import { useWindowSize } from "@uidotdev/usehooks";
import {
  PanelGroup,
  Panel as ResizablePanel,
  PanelResizeHandle,
} from "react-resizable-panels";
import { Panel } from "./Panel";
import { TabsPanel } from "./TabsPanel";
import { styled } from "@mui/joy";
import { useState } from "react";
import dedent from "dedent";
import { TermPanel } from "./TermPanel";

interface TermPagePanelsProps {
  termId: string;
}

export function TermPagePanels({ termId }: TermPagePanelsProps) {
  const { width } = useWindowSize();

  const [selectedTab, setSelectedTab] = useState("as-subject")

  if (!width) return null;


  const relationsTabs = {
    "as-subject": {
      label: "As Subject",
      color: "var(--p-orange-400)",
      jsx: (
        <TermPanel
          querySparql={dedent`
            SELECT ?predicate ?object
            WHERE {
              <${termId}> ?predicate ?object
              FILTER(!isLiteral(?object))
            }
            LIMIT 50
          `}
        />
      ),
    },

    "as-object": {
      label: "As Object",
      color: "var(--p-cyan-400)",
      jsx: (
        <TermPanel
          querySparql={dedent`
            SELECT ?subject ?predicate
            WHERE {
              ?subject ?predicate <${termId}>
              FILTER(!isLiteral(?subject))
            }
            LIMIT 50
          `}
        />
      ),
    },

    "as-predicate": {
      label: "As Predicate",
      color: "var(--p-pink-400)",
      jsx: (
        <TermPanel
          querySparql={dedent`
            SELECT ?subject ?object
            WHERE {
              ?subject <${termId}> ?object
            }
            LIMIT 50
          `}
        />
      ),
    },
  };

  const attributesTabs = {
    attributes: {
      label: "Attributes",
      color: "var(--p-indigo-300)",
      jsx: (
        <TermPanel
          querySparql={dedent`
            SELECT ?property ?value
            WHERE {
              <${termId}> ?property ?value
              FILTER(isLiteral(?value))
            }
            LIMIT 50
          `}
        />
      ),
    },
  };

  if (width > 700)
    return (
      <WrapperPanelGroup
        autoSaveId="localstorage-term-panels"
        direction="vertical"
      >
        <ResizablePanel defaultSize={30} minSize={10} collapsible={true}>
          <Panel tab={attributesTabs.attributes} />
        </ResizablePanel>

        <Handle horizontal={"true"} />

        <ResizablePanel defaultSize={80} minSize={10} collapsible={true}>
          <TabsPanel
            tabs={relationsTabs}
            selectedTab={selectedTab}
            handleTabSelect={(tabId) => setSelectedTab(tabId)}
          />
        </ResizablePanel>
      </WrapperPanelGroup>
    );

  return (
    <TabsPanel
      tabs={{
        ...attributesTabs,
        ...relationsTabs,
      }}
      selectedTab={selectedTab}
      handleTabSelect={(tabId) => setSelectedTab(tabId)}
    />
  );
}

const WrapperPanelGroup = styled(PanelGroup)`
  flex: 1;
  min-height: 0;
`;

interface HandleProps {
  horizontal: string;
}
const Handle = styled(PanelResizeHandle)<HandleProps>`
  align-self: center;
  width: 12px;
  border-radius: 6px;
  height: 64px;
  margin: 0 4px;
  backdrop-filter: blur(2px);
  background-color: color-mix(in srgb, var(--p-slate-200) 30%, transparent);
  border: 1px solid var(--p-slate-400);
  transition: all 250ms cubic-bezier(0.19, 1, 0.22, 1);

  &[data-resize-handle-active="pointer"],
  &:hover {
    background-color: color-mix(in srgb, var(--p-slate-500) 20%, transparent);
    border-color: var(--p-slate-500);
    transition: all 250ms cubic-bezier(0.19, 1, 0.22, 1);
  }

  &[data-resize-handle-active="pointer"] {
    height: 96px;
    transition: all 250ms cubic-bezier(0.19, 1, 0.22, 1);
  }

  ${({ horizontal }) =>
    horizontal === "true"
      ? `
    & {
      width: 64px;
      height: 12px;
      margin: 4px 0;
    }

    &[data-resize-handle-active='pointer'] {
      width: 96px;
      height: 12px;
      transition: all 250ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  `
      : ""}
`;
