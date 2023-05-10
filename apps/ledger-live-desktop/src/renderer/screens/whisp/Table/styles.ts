import { Text } from "@ledgerhq/react-ui";
import styled from "styled-components";

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 16px;
`;

export const TableHead = styled.thead`
  height: 40px;
  td {
    padding: 0 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.c30};
  }
`;

export const TableBodyRow = styled.tr`
  td {
    padding: 8px 16px;
  }
`;

export const TableBodyRowClickable = styled.tr`
  background-color: ${({ theme }) => theme.colors.neutral.c20};

  td {
    padding: 14px;
  }

  // Set border-radius on the top-left and bottom-left of the first table data on the table row
  td:first-child,
  th:first-child {
    border-radius: 10px 0 0 10px;
  }

  // Set border-radius on the top-right and bottom-right of the last table data on the table row
  td:last-child,
  th:last-child {
    border-radius: 0 10px 10px 0;
  }
`;

export const HeaderText = styled(Text)`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  > span {
    height: 12px;
  }
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
`;

export const FirstColumn = styled.div`
  display: flex;
  gap: 12px;
`;
