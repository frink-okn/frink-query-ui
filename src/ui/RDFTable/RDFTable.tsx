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
  rowHeight: 16 * 2,
});

interface RDFTableProps {
  columns: Variable[];
  rows: Bindings[];
  wrapText?: boolean;
}

export function RDFTable({ columns, rows, wrapText = false }: RDFTableProps) {
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
        return <RDFTermDisplay term={props.value} />;
      },
      ...(wrapText && {
        wrapText: true,
        autoHeight: true,
      }),
    }),
    [wrapText],
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
