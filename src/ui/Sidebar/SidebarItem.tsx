import { styled } from "@mui/joy";
import { Link } from "@tanstack/react-router";

interface SidebarItemProps {
  label: string;
  to: string;
  icon: React.ReactElement;
}

export function SidebarItem({ label, to, icon }: SidebarItemProps) {
  return (
    <StyledLink to={to}>
      {icon}
      <Label>{label}</Label>
    </StyledLink>
  );
}

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1ch;
  width: 100%;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  color: var(--p-slate-950);
  border: 1px solid transparent;

  &:hover {
    background-color: color-mix(in srgb, var(--p-slate-300) 30%, transparent);
    color: inherit;
    text-decoration: none;
  }

  &[data-status="active"] {
    background-color: color-mix(in srgb, var(--p-slate-300) 50%, transparent);
    border: 1px solid var(--p-slate-400);
  }

  @media (max-width: 600px) {
    padding: 0.4rem;
  }
`;

const Label = styled("span")`
  @media (max-width: 600px) {
    display: none;
  }
`;
