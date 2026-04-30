import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "../ui/PageWrapper";
import Markdown from "react-markdown";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

const content = `\
Welcome to the SPARQL query service for the NSF Prototype Open Knowledge Network (Proto-OKN). For more information, please see the following:

- [Proto-OKN technical documentation](https://frink.renci.org)
- [NSF Proto-OKN](https://www.proto-okn.net)
    - The Proto-OKN Fabric is funded by [NSF award 2535091](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2535091&HistoricalAwards=false).
    - [RENCI](https://renci.org)'s portion of the project was previously funded by [NSF award 2333810](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2333810&HistoricalAwards=false).

This query service is built on open source software:

- [Query UI](https://github.com/frink-okn/frink-query-ui/)
- [Comunica](https://comunica.dev)
- [QLever](https://qlever.dev)
- [RDF HDT](https://www.rdfhdt.org) (and an [HDT Creator](https://github.com/frink-okn/hdtc))
- [qEndpoint CLI tools](https://github.com/the-qa-company/qEndpoint)
- [Apache Jena](https://jena.apache.org)
`;

function RouteComponent() {
  return (
    <PageWrapper title="About">
      <Markdown>{content}</Markdown>
    </PageWrapper>
  );
}
