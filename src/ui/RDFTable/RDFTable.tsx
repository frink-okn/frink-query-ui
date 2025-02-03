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

interface RDFTableProps {
  columns: Variable[];
  rows: Bindings[];
  wrapText?: boolean;
}
export function RDFTable({ columns, rows, wrapText = false }: RDFTableProps) {
  const agGridColumns = useMemo(
    () =>
      columns.map(({ value: col }) => ({
        field: col as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filterValueGetter: (params: any) =>
          params.data?.[params.column?.getColId()]?.value ?? "",
        comparator: (a: Term, b: Term) => a.value.localeCompare(b.value),
      })),
    [columns],
  );

  const defaultColDef: ColDef = useMemo(
    () => ({
      flex: 1,
      filter: true,
      cellRenderer: (props: { value: Term }) => {
        return <RDFTermDisplay term={props.value} />;
      },
      ...(wrapText && {
        wrapText: true,
        autoHeight: true,
      }),
    }),
    [wrapText],
  );

  const agGridRows = rows.map((result) =>
    columns.reduce(
      (row, { value: colKey }) => {
        row[colKey] = result.get(colKey) ?? "";
        return row;
      },
      {} as Record<string, Term | string>,
    ),
  );

  return (
    <AgGridReact
      columnDefs={agGridColumns}
      rowData={agGridRows}
      theme={customTheme}
      pagination={true}
      paginationAutoPageSize={true}
      defaultColDef={defaultColDef}
      enableCellTextSelection={true}
    />
  );
}
