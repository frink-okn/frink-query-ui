import { styled } from "@mui/material";

interface PageWrapperProps {
  title?: string;
  children: React.ReactNode;
}

export function PageWrapper({ children, title }: PageWrapperProps) {
  return (
    <CenteringContainer>
      <MaxWidthContainer>
        {title ? <Title>{title}</Title> : null}
        <ContentContainer>{children}</ContentContainer>
      </MaxWidthContainer>
    </CenteringContainer>
  );
}

const CenteringContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;

  @media screen and (max-width: 800px) {
    padding: 0.5rem;
  }
`;

const MaxWidthContainer = styled("div")`
  display: flex;
  flex-direction: column;
  max-width: 800px;
  width: 100%;
`;

const Title = styled("h1")`
  margin: 0px;
  padding: 1rem 2rem;

  @media screen and (max-width: 800px) {
    padding: 1rem;
  }
`;

const ContentContainer = styled("div")`
  background-color: var(--p-slate-50);
  padding: 1rem 2rem;
  border: 1px solid var(--p-slate-300);
  border-radius: 8px;
  box-shadow: 0px 8px 16px 0px var(--p-slate-300);

  @media screen and (max-width: 800px) {
    padding: 0rem 1rem;
  }
`;
