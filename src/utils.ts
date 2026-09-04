import type * as RDF from "@rdfjs/types";
import { DataFactory } from "rdf-data-factory";
import { BindingsFactory } from "@comunica/bindings-factory";
import { type Bindings } from "@comunica/types";

const DF = new DataFactory();
const BF = new BindingsFactory();

function downloadTextAsFile(
  text: string | Array<string>,
  filename: string,
  contentType: string,
) {
  const content = typeof text === "string" ? [text] : text;
  const blob = new Blob(content, { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = filename;
  a.href = url;
  a.click();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
}

function asBindings(result: RDF.Quad | boolean): Bindings {
  if (typeof result === "boolean") {
    return BF.fromRecord({
      result: result
        ? DF.literal(
            "true",
            DF.namedNode("http://www.w3.org/2001/XMLSchema#boolean"),
          )
        : DF.literal(
            "false",
            DF.namedNode("http://www.w3.org/2001/XMLSchema#boolean"),
          ),
    });
  } else {
    return BF.fromRecord({
      subject: result.subject,
      predicate: result.predicate,
      object: result.object,
      graph: result.graph,
    });
  }
}

function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export { downloadTextAsFile, asBindings, isUrl };
