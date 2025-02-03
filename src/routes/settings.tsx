import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "../ui/PageWrapper";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageWrapper title="Settings">Settings</PageWrapper>;
}
