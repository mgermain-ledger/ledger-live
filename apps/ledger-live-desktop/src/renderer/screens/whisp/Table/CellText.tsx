import React, { ReactElement } from "react";
import { Text } from "@ledgerhq/react-ui";
import * as S from "./styles";

type TableCellProps = {
  children: string | number | ReactElement | null;
  subTitle?: string | number | null;
};

export const CellText: React.FC<TableCellProps> = ({ children, subTitle }: TableCellProps) => {
  return (
    <S.FlexColumn>
      <Text variant="body" fontWeight="semiBold">
        {children}
      </Text>
      {!!subTitle && <CellSubText>{subTitle}</CellSubText>}
    </S.FlexColumn>
  );
};

export const CellSubText = (props: { children?: string | number | null }) => (
  <Text variant="small" fontWeight="medium" color="neutral.c70">
    {props.children}
  </Text>
);
