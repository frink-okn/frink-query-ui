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
  color: white;
  --Icon-color: white;
  border: 1px solid transparent;

  &:hover {
    background-color: color-mix(in srgb, white 12%, transparent);
    color: white;
    text-decoration: none;
  }

  &[data-status="active"] {
    background-color: color-mix(in srgb, white 20%, transparent);
    border: 1px solid color-mix(in srgb, white 35%, transparent);
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
