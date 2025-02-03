import { styled } from "@mui/joy";

interface PanelProps {
  tab: {
    id: string;
    label: string;
    color: string;
    jsx: React.ReactElement;
  };
}

export function Panel({ tab: { color, label, jsx } }: PanelProps) {
  return (
    <Wrapper style={{ "--accent-color": color } as React.CSSProperties}>
      <Header>
        <h2>{label}</h2>
      </Header>
      <Content>{jsx}</Content>
    </Wrapper>
  );
}

const Wrapper = styled("div")`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled("header")`
  background-color: var(--accent-color);
  padding: 0.5rem 0.75rem 0.3rem 0.75rem;
  align-self: flex-start;
  border-radius: 8px 8px 0px 0px;
  position: relative;

  &:after {
    --size: 8px;
    position: absolute;
    content: "";
    width: var(--size);
    height: var(--size);
    background: radial-gradient(
      circle farthest-side at top right,
      transparent 95%,
      var(--accent-color) 100%
    );
    bottom: 0;
    right: calc(-1 * var(--size));
  }

  & h2 {
    margin: 0;
    font-weight: 500;
    letter-spacing: 1px;
    font-size: 0.9rem;
    text-transform: uppercase;
  }
`;

const Content = styled("div")`
  flex: 1;
  background-color: var(--p-slate-50);
  border: 2px solid var(--accent-color);
  padding: 0.75rem;
  border-radius: 8px;
  border-top-left-radius: 0px;
  overflow: auto;
`;
