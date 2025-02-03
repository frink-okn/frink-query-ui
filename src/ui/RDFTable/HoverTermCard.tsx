import type { Literal, NamedNode, Term } from "@rdfjs/types";
import {
  arrow,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Sheet, Table } from "@mui/joy";
import { useEffect, useMemo, useRef, useState } from "react";
import { QueryEngine } from "@comunica/query-sparql";
import { RDFTermDisplay } from "./RDFTermDisplay";

interface HoverTermCardProps {
  children: React.ReactNode;
  term: Term;
}

const engine = new QueryEngine();

export function HoverTermCard({ children, term }: HoverTermCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift(), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
    placement: "left",
  });

  const attributesSparql = useMemo(
    () =>
      `\
SELECT ?p ?v
WHERE {
  <${term.value}> ?p ?v
  FILTER(isLiteral(?v))
}
LIMIT 10`,
    [term],
  );

  const [attributes, setAttributes] = useState<
    { property: NamedNode<string>; value: Literal }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const hover = useHover(context, { delay: 500, move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  useEffect(() => {
    (async () => {
      if (isOpen && attributes.length === 0) {
        setIsLoading(true);
        try {
          const attributesBindings = await (
            await engine.queryBindings(attributesSparql, {
              sources: [
                {
                  type: "sparql",
                  value: "https://frink.apps.renci.org/federation/sparql",
                },
              ],
            })
          ).toArray();
          attributesBindings.forEach((bindings) => {
            const pValue = bindings.get("p");
            const vValue = bindings.get("v");
            if (
              pValue &&
              vValue &&
              pValue.termType === "NamedNode" &&
              vValue.termType === "Literal"
            ) {
              const vals = [];
              vals.push({
                property: pValue,
                value: vValue,
              });
              setAttributes(vals);
            }
          });
        } catch (e) {
          setError(e?.toString() ?? "Unknown error occurred");
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [attributesSparql, isOpen, attributes.length]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </div>
      {isOpen && (
        <FloatingPortal>
          <Sheet
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            sx={{
              p: 1,
              borderRadius: "8px",
              border: "1px solid var(--p-slate-300)",
              boxShadow: "0 2px 8px var(--p-slate-300)",
              zIndex: 1000,
            }}
          >
            <FloatingArrow
              ref={arrowRef}
              context={context}
              fill={"#FBFCFE"}
              stroke={"var(--p-slate-300)"}
              strokeWidth={1}
            />
            <em>{term.value}</em>
            {isLoading ? (
              <p style={{ fontStyle: "italic" }}>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <Table sx={{ width: "500px", maxWidth: "600px" }}>
                <tbody>
                  {attributes.map(({ property, value }, i) => (
                    <tr key={i}>
                      <td>
                        <RDFTermDisplay term={property} />
                      </td>
                      <td>
                        <RDFTermDisplay term={value} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Sheet>
        </FloatingPortal>
      )}
    </>
  );
}
