import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "../ui/PageWrapper";
import Markdown from "react-markdown";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

const content = `\
Welcome to the FRINK query service for the NSF Prototype Open Knowledge Network (Proto-OKN). For more information, please see the following:

- [FRINK documentation](https://frink.renci.org)
- [NSF Proto-OKN](https://www.proto-okn.net)
- FRINK is funded by [NSF award 2333810](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2333810&HistoricalAwards=false) to [RENCI](https://renci.org)

The FRINK query service is built on open source software:

- [FRINK query UI](https://github.com/frink-okn/frink-query-ui/)
- [Comunica](https://comunica.dev)
- [RDF HDT](https://www.rdfhdt.org)
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
