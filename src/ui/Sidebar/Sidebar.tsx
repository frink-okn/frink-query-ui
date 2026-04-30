import { Divider, styled } from "@mui/joy";
import { Link } from "@tanstack/react-router";
import { SidebarItem } from "./SidebarItem";
import { HelpRounded, HomeRounded, Settings } from "@mui/icons-material";

export function Sidebar() {
  return (
    <Nav>
      <HeaderBox>
        <a target="_blank" href="https://proto-okn.net/"><LogoImage src={`${import.meta.env.BASE_URL}Purple-no-background-300x200.png`}></LogoImage></a>
        <Logo><InvisibleA target="_blank" href="https://proto-okn.net/">Proto-OKN</InvisibleA></Logo>
        <Subtitle><InvisibleLink to={"/"}>Query the Graphs</InvisibleLink></Subtitle>
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
  flex-direction: row;
  backdrop-filter: blur(2px);
  background-color: color-mix(in srgb, var(--p-slate-50) 10%, transparent);
  border-bottom: 0.2em solid #664e96;
`;

const LinksWrapper = styled("div")`
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 5px;
`;

const LinksSpacer = styled("div")`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
`;

const HeaderBox = styled("div")`
  padding: 0;
  text-align: center;
  display: flex;
  @media (max-width: 600px) {
    display: none;
  }
`;

const Logo = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0rem 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
`;

const LogoImage = styled("img")`
  width: 7em;
  height: 3.3em;
  padding: 0rem 0.75rem;
`;

const Subtitle = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 0rem 0.75rem;
  align-items: center;
  font-style: italic;
`;

const InvisibleA = styled("a")`
  text-decoration: none;
  color: #5f308c;
`

const InvisibleLink = styled(Link)`
  text-decoration: none;
  color: #5f308c;
`
