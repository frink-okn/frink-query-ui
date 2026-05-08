import { styled } from "@mui/joy";
import React from "react";

export type Tab = {
  label: string;
  color: string;
  jsx: React.ReactElement;
};

interface TabsPanelProps {
  tabs: Record<string, Tab>;
  selectedTab: string;
  handleTabSelect: (tabId: string) => void;
}

export function TabsPanel({
  tabs,
  selectedTab,
  handleTabSelect,
}: TabsPanelProps) {
  const _selectedTab = tabs[selectedTab];

  if (!_selectedTab) {
    throw new Error(`Tab ${selectedTab} is not a defined tab.`);
  }

  return (
    <Panel
      style={{ "--accent-color": _selectedTab.color } as React.CSSProperties}
    >
      <header>
        {Object.entries(tabs).map(([tabId, tab]) => (
          <Tab
            key={tabId}
            tabIndex={0}
            role="button"
            style={
              { "--button-accent-color": tab.color } as React.CSSProperties
            }
            className={tabId === selectedTab ? "selected" : undefined}
            onClick={() => {
              handleTabSelect(tabId);
            }}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") handleTabSelect(tabId);
            }}
          >
            <h2>{tab.label}</h2>
          </Tab>
        ))}
      </header>

      {Object.entries(tabs).map(([tabId, tab]) => (
        <Content
          key={tabId}
          style={{ display: selectedTab === tabId ? "block" : "none" }}
        >
          {tab.jsx}
        </Content>
      ))}
    </Panel>
  );
}

const Panel = styled("div")`
  height: 100%;
  display: flex;
  flex-direction: column;
  isolation: isolate; /* Create stacking context for tab z-index */

  header {
    display: flex;
    flex-direction: row;
    gap: 0.25rem;
    overflow-x: auto;
    color: var(--p-slate-950);
    user-select: none;
  }
`;

const Tab = styled("div")`
  border: none;
  color: inherit;
  background-color: var(--button-accent-color);
  padding: 0.5rem 0.75rem 0.3rem 0.75rem;
  align-self: stretch;
  border-radius: 8px 8px 0px 0px;
  position: relative;
  display: flex;
  gap: 4px;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  --tab-flare-size: 10px;

  &:not(.selected)::before {
    content: "";
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      transparent 50%,
      rgba(0, 0, 0, 0.15)
    );
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  &.selected:not(:first-of-type)::before {
    z-index: 2;
    position: absolute;
    content: "";
    width: var(--tab-flare-size);
    height: var(--tab-flare-size);
    background: radial-gradient(
      circle farthest-side at top left,
      transparent 95%,
      var(--button-accent-color) 100%
    );
    bottom: 0;
    left: calc(-1 * var(--tab-flare-size));
  }
  &.selected:not(:last-of-type)::after {
    z-index: 2;
    position: absolute;
    content: "";
    width: var(--tab-flare-size);
    height: var(--tab-flare-size);
    background: radial-gradient(
      circle farthest-side at top right,
      transparent 95%,
      var(--button-accent-color) 100%
    );
    bottom: 0;
    right: calc(-1 * var(--tab-flare-size));
  }

  & > h2 {
    margin: 0;
    font-weight: 500;
    letter-spacing: 1px;
    font-size: 0.9rem;
    text-transform: uppercase;
  }
`;

const Content = styled("div")`
  flex: 1;
  background-color: white;
  border: 2px solid var(--accent-color);
  padding: 0.75rem;
  border-radius: 8px;
  border-top-left-radius: 0px;
  overflow: auto;

  @media (max-width: 490px) {
    border-radius: 0px 0px 8px 8px;
  }
`;
