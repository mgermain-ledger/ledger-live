import React from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import * as S from "./styles";

interface ReactTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  isRowsClickable?: boolean;
}

const Table = <T extends object>({ data, columns, isRowsClickable }: ReactTableProps<T>) => {
  const { getHeaderGroups, getRowModel } = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const Row = isRowsClickable ? S.TableBodyRowClickable : S.TableBodyRow;

  return (
    <S.Table>
      <S.TableHead>
        {getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <td key={header.id}>
                <S.HeaderText variant="small" fontWeight="medium" color="neutral.c70">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </S.HeaderText>
              </td>
            ))}
          </tr>
        ))}
      </S.TableHead>
      <tbody>
        {getRowModel().rows.map(row => (
          <Row key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </Row>
        ))}
      </tbody>
    </S.Table>
  );
};

export default Table;
