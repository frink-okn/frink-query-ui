import { Button, styled } from "@mui/joy";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useLocalStorage } from "@uidotdev/usehooks";
import type { SavedQuery } from "../context/savedQueries";
import { PageWrapper } from "../ui/PageWrapper";
import { SettingLine } from "../ui/SettingLine";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [, setSavedQueries] = useLocalStorage<SavedQuery[]>("saved-queries");

  const invalidateCachedExamples = () => {
    queryClient.invalidateQueries({ queryKey: ["examples"] });
  };

  const clearSavedQueries = () => {
    setSavedQueries([]);
  };

  return (
    <PageWrapper title="Settings">
      <SettingsWrapper>
        <SettingLine
          settingName="Delete all saved queries"
          settingDescription="This will delete all saved queries from the local storage. This action cannot be undone."
        >
          <Button color="danger" variant="soft" onClick={clearSavedQueries}>
            Delete
          </Button>
        </SettingLine>

        <SettingLine
          settingName="Invalidate example queries cache"
          settingDescription="Force a refresh of the cached example queries to fetch the latest data from the server. Normally, examples are cached for 24 hours."
        >
          <Button
            color="danger"
            variant="soft"
            onClick={invalidateCachedExamples}
          >
            Refresh
          </Button>
        </SettingLine>
      </SettingsWrapper>
    </PageWrapper>
  );
}

const SettingsWrapper = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 1rem 0;
`;
