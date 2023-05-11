import React, { useMemo } from "react";
import { Button, CryptoIcon, InvertTheme } from "@ledgerhq/react-ui";
import { ColumnDef } from "@tanstack/react-table";

import Table from "./Table";
import { CellText } from "./CellText";
import * as S from "./styles";
import { WhispersSubscription } from "..";

export function WhispersTable(props: { data: WhispersSubscription[] }) {
  const columns: ColumnDef<WhispersSubscription>[] = useMemo(
    () => [
      {
        id: "address",
        header: "Address",
        accessorKey: "address",
        cell: ctx => {
          const { address, ticker, action } = ctx.row.original;

          return (
            <S.FlexRow>
              {/* TODO: make sure we have the chain ticker for name */}
              <CryptoIcon name={ticker || "BTC"} size={32} />

              <CellText subTitle={action}>{address}</CellText>
            </S.FlexRow>
          );
        },
      },
      {
        id: "description",
        header: "Description",
        cell: ctx => {
          const { condition: description, name: title } = ctx.row.original;

          return <CellText subTitle={description}>{title}</CellText>;
        },
      },
      {
        id: "threshold",
        header: "Threshold",
        cell: ctx => {
          const { threshold, action } = ctx.row.original;

          return <CellText subTitle={action}>{`Exceeds ${threshold}`}</CellText>;
        },
      },
      // {
      //   id: "currencyCategory",
      //   header: "Category",
      //   cell: ctx => {
      //     const { currencyCategory } = ctx.row.original;

      //     return <CellText>{currencyCategory}</CellText>;
      //   },
      // },
      {
        id: "cancelButton",
        cell: ctx => {
          const { id } = ctx.row.original;

          return (
            <S.FlexColumn>
              {/* <InvertTheme>  */}
              <Button
                onClick={() => console.log(`Delete subscription id: ${id}`)}
                variant="main"
                size="small"
              >
                Unsubscribe
              </Button>
              {/* </InvertTheme> */}
            </S.FlexColumn>
          );
        },
      },
    ],
    [],
  );

  return <Table data={props.data} columns={columns} />;
}
