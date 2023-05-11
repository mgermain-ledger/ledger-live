import React, { useMemo } from "react";
import { Button, CryptoIcon } from "@ledgerhq/react-ui";
import { ColumnDef } from "@tanstack/react-table";

import Table from "./Table";
import { CellText } from "./CellText";
import * as S from "./styles";
import { WhispScreen } from "..";

export function WhispersTable(props: { data: Whisp[] }) {
  const columns: ColumnDef<Whisp>[] = useMemo(
    () => [
      {
        id: "address",
        header: "Address",
        accessorKey: "address",
        cell: ctx => {
          const { contract: address, type } = ctx.row.original.value;

          return (
            <S.FlexRow>
              {/* TODO: make sure we have the chain ticker for name */}
              <CryptoIcon name={"ETH"} size={32} />

              <CellText subTitle={type}>{address || "No contract"}</CellText>
            </S.FlexRow>
          );
        },
      },
      {
        id: "description",
        header: "Description",
        cell: ctx => {
          const { description, name: title } = ctx.row.original.value;

          return <CellText subTitle={description}>{title}</CellText>;
        },
      },
      {
        id: "threshold",
        header: "Threshold",
        cell: ctx => {
          const { min_value: threshold, type: action } = ctx.row.original.value;

          return <CellText subTitle={action}>{`Exceeds ${threshold}`}</CellText>;
        },
      },
      {
        id: "cancelButton",
        cell: ctx => {
          const { id } = ctx.row.original;

          return (
            <S.FlexColumn>
              <Button
                onClick={() => console.log(`Delete subscription id: ${id}`)}
                variant="main"
                size="small"
              >
                Unsubscribe
              </Button>
            </S.FlexColumn>
          );
        },
      },
    ],
    [],
  );

  return <Table data={props.data} columns={columns} />;
}
