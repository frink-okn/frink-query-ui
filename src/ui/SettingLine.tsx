import { styled } from "@mui/joy";

interface SettingLineProps {
  children?: React.ReactNode;
  settingName: string;
  settingDescription?: string;
}

export function SettingLine({
  children,
  settingName,
  settingDescription,
}: SettingLineProps) {
  return (
    <SettingLineWrapper>
      <div>
        <h3>{settingName}</h3>
        {settingDescription && <p>{settingDescription}</p>}
      </div>
      {children}
    </SettingLineWrapper>
  );
}

const SettingLineWrapper = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  border: 1px solid var(--p-slate-200);
  border-radius: 8px;
  padding: 1rem;

  & div {
    display: flex;
    flex-direction: column;

    & h3 {
      margin: 0;
      color: var(--p-slate-600);
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.5;
    }

    & p {
      margin: 0;
    }
  }
`;
