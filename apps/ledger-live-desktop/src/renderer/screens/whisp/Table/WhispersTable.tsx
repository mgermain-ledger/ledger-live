import React, { useMemo } from "react";
import { Button, CryptoIcon } from "@ledgerhq/react-ui";
import { ColumnDef } from "@tanstack/react-table";
import IconCheck from "~/renderer/icons/Check";
import { colors } from "~/renderer/styles/theme";

import Table from "./Table";
import { CellText } from "./CellText";
import * as S from "./styles";
import { Whisp } from "..";
import LiveAppIcon from "~/renderer/components/WebPlatformPlayer/LiveAppIcon";

export function WhispersTable(props: { data: Whisp[] }) {
  const columns: ColumnDef<Whisp>[] = useMemo(
    () => [
      // {
      //   id: "logo",
      //   header: "",
      //   cell: ctx => {
      //     const { name } = ctx.row.original.value;

      //     return (
      //       <S.FlexRow>
      //         <LiveAppIcon icon={undefined} name={name} size={35} />
      //         {/* <CellText subTitle={description}>{name}</CellText> */}
      //       </S.FlexRow>
      //     );
      //   },
      // },
      {
        id: "description",
        header: "Alert",
        cell: ctx => {
          const { description, name } = ctx.row.original.value;

          return (
            <S.FlexRow>
              <LiveAppIcon icon={undefined} name={name} size={35} />
              <CellText subTitle={description}>{name}</CellText>
            </S.FlexRow>
          );
        },
      },
      // {
      //   id: "addressIcon",
      //   header: "",
      //   cell: ctx => {
      //     const { contract: address, type } = ctx.row.original.value;

      //     return (
      //       <>
      //         <CryptoIcon name={"ETH"} size={32} />
      //       </>
      //     );
      //   },
      // },
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
        id: "active",
        header: "Active",
        cell: ctx => {
          const { min_value: threshold, type: action } = ctx.row.original.value;

          return (
            <CellText>
              <IconCheck color={colors.positiveGreen} size={16} />
            </CellText>
          );
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
                // variant="main"
                size="small"
                borderRadius={20}
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

  return <Table data={props.data} columns={columns} isRowsClickable />;
}
