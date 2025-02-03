import { Divider, styled } from "@mui/joy";
import { SidebarItem } from "./SidebarItem";
import { HelpRounded, HomeRounded, Settings } from "@mui/icons-material";

export function Sidebar() {
  return (
    <Nav>
      <HeaderBox>
        <Logo>FRINK</Logo>
        <Subtitle>Query the Proto-OKN</Subtitle>
        <Divider sx={{ my: 2 }} />
      </HeaderBox>

      <LinksWrapper>
        <LinksSpacer>
          <SidebarItem label="Home" to="/" icon={<HomeRounded />} />
          <SidebarItem label="About" to="/about" icon={<HelpRounded />} />
        </LinksSpacer>
        <LinksSpacer>
          <Divider />
          <SidebarItem label="Settings" to="/settings" icon={<Settings />} />
        </LinksSpacer>
      </LinksWrapper>
    </Nav>
  );
}

const Nav = styled("nav")`
  flex: 0 0 auto;
  display: flex;
  min-width: max-content;
  padding: 8px;
  border-right: 1px solid var(--p-slate-300);
  flex-direction: column;
  backdrop-filter: blur(2px);
  background-color: color-mix(in srgb, var(--p-slate-50) 10%, transparent);
  box-shadow: 0px 8px 8px 0px var(--p-slate-300);
`;

const LinksWrapper = styled("div")`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 5px;
`;

const LinksSpacer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HeaderBox = styled("div")`
  padding: 1rem 0 0 0;
  text-align: center;

  @media (max-width: 600px) {
    display: none;
  }
`;

const Logo = styled("div")`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
`;

const Subtitle = styled("div")`
  font-style: italic;
`;
