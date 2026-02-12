import type { Bindings } from "@comunica/types";
import type { Term, Variable } from "@rdfjs/types";
import { themeQuartz, type ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { RDFTermDisplay } from "./RDFTermDisplay";
import { useMemo } from "react";

const customTheme = themeQuartz.withParams({
  wrapperBorderRadius: "0px",
  wrapperBorder: "none",
  headerBackgroundColor: "var(--p-slate-50)",
  fontFamily: "var(--font-family)",
});

const XSD_NAMESPACE = "http://www.w3.org/2001/XMLSchema#";

// XSD numeric datatypes that should be sorted numerically
const NUMERIC_XSD_TYPES = new Set([
  "integer",
  "int",
  "long",
  "short",
  "byte",
  "decimal",
  "float",
  "double",
  "positiveInteger",
  "negativeInteger",
  "nonPositiveInteger",
  "nonNegativeInteger",
  "unsignedLong",
  "unsignedInt",
  "unsignedShort",
  "unsignedByte",
]);

/**
 * Checks if a term is a literal with a numeric XSD datatype
 */
function isNumericLiteral(term: Term | null | undefined): boolean {
  if (!term || term.termType !== "Literal") return false;
  const datatypeUri = term.datatype.value;
  if (!datatypeUri.startsWith(XSD_NAMESPACE)) return false;
  const localName = datatypeUri.slice(XSD_NAMESPACE.length);
  return NUMERIC_XSD_TYPES.has(localName);
}

interface RDFTableProps {
  columns: Variable[];
  rows: Bindings[];
  wrapText?: boolean;
  resolveLabels?: boolean;
}

export function RDFTable({
  columns,
  rows,
  wrapText = false,
  resolveLabels = false,
}: RDFTableProps) {
  const agGridColumns = useMemo(
    () =>
      columns.map((variable) => {
        const col: ColDef<Bindings, Term> = {
          headerName: variable.value,
          valueGetter: (d) => {
            return d.data?.get(variable.value);
          },
          filterValueGetter: (params) =>
            params.data?.get(variable.value)?.value ?? "",
          comparator: (
            a: Term | null | undefined,
            b: Term | null | undefined,
          ) => {
            if (a == null) return 1;
            if (b == null) return -1;

            // If both terms are numeric literals, compare numerically
            const aIsNumeric = isNumericLiteral(a);
            const bIsNumeric = isNumericLiteral(b);

            if (aIsNumeric && bIsNumeric) {
              const aNum = parseFloat(a.value);
              const bNum = parseFloat(b.value);

              // Handle NaN cases (invalid numbers)
              if (isNaN(aNum) && isNaN(bNum)) return 0;
              if (isNaN(aNum)) return 1;
              if (isNaN(bNum)) return -1;

              return aNum - bNum;
            }

            // If only one is numeric, sort numerics before non-numerics
            if (aIsNumeric) return -1;
            if (bIsNumeric) return 1;

            // For non-numeric values, use string comparison
            return a.value.localeCompare(b.value);
          },
        };

        return col;
      }),
    [columns],
  );

  const defaultColDef: ColDef<Bindings, Term> = useMemo(
    () => ({
      flex: 1,
      filter: true,
      cellRenderer: (props: { value: Term }) => {
        return (
          <RDFTermDisplay term={props.value} resolveLabels={resolveLabels} />
        );
      },
      ...(wrapText && {
        wrapText: true,
        autoHeight: true,
      }),
    }),
    [wrapText, resolveLabels],
  );

  return (
    <AgGridReact
      columnDefs={agGridColumns}
      rowData={rows}
      theme={customTheme}
      pagination={true}
      paginationAutoPageSize={true}
      defaultColDef={defaultColDef}
      enableCellTextSelection={true}
    />
  );
}
