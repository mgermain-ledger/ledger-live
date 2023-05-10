import Box, { Card } from "~/renderer/components/Box";
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { openModal } from "~/renderer/actions/modals";
import IconPlus from "~/renderer/icons/Plus";
import Button from "~/renderer/components/Button";
import { focusedShadowStyle } from "~/renderer/components/Box/Tabbable";
import { Tag, Text } from "@ledgerhq/react-ui";
import styled from "styled-components";
import CatalogBanner from "../platform/CatalogBanner";
import ChevronRight from "~/renderer/icons/ChevronRight";
import InfoCircle from "~/renderer/icons/InfoCircle";

interface Alert {
  id: number;
  name: string;
  address: string;
  condition: string;
}

const dummyAlerts: Alert[] = [
  {
    id: 1,
    name: "Mint 4 NFTs",
    address: "0x123456789",
    condition: "mint 4 NFTs of CryptoKitties collection",
  },
  {
    id: 2,
    name: "Large liquidity withdrawal",
    address: "0x987654321",
    condition: "withdrawal of more than 100000 from Uniswap pool",
  },
  {
    id: 3,
    name: "Price increase",
    address: "0xabcdef0123",
    condition: "ETH price exceeds 5000",
  },
];

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 20px;
  width: 100%;
  justify-content: stretch;
  margin: auto;
  padding-bottom: 32px;
`;

const GridItem = styled.div`
  > * {
    height: 100%;
  }
`;

const CardContent = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex: 1;
`;
const CardHeaderContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;
const CardHeader = styled(Text)`
  font-weight: 600;
  font-size: 12px;
  margin-left: 8px;
`;
const CustomButton = styled(Button)`
  border: none;
  padding-right: 14px;
`;

const Title = styled(Box).attrs(p => ({
  ff: "Inter|SemiBold",
  fontSize: 7,
  color: p.theme.colors.palette.secondary.main,
}))``;

const NotificationPanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: top;
  padding: ${p => p.theme.space[3]}px;
  gap: ${p => p.theme.space[3]}px;
  width: 20rem;
  height: 30rem;
  border-radius: 4px;
  margin-left: ${p => p.theme.space[3]}px;
  background-color: ${p => p.theme.colors.palette.opacityDefault.c05};
`;

const AlertsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const AlertCard = styled.div`
  justify-content= start;
  padding: 20px;
  border-radius: 4px;
  background-color: ${p => p.theme.colors.palette.opacityDefault.c05};
`;

const Whisp = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [serverAlerts, setServerAlerts] = useState<Alert[]>([]);

  const ws = new WebSocket('ws://localhost:3000/ws')

  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const openAddAccounts = useCallback(() => {
    dispatch(openModal("MODAL_ADD_ACCOUNTS", undefined));
  }, [dispatch]);

//   useEffect(() => {
//     const ws = new WebSocket("ws://localhost:8080/ws");
//     ws.onopen = () => {
//       console.log("connected");
//     };
//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log(data);
//       const updatedAlerts = [...serverAlerts, data];
//       setServerAlerts(updatedAlerts);
//     };
//     ws.onclose = () => {
//       console.log("disconnected");
//     };
//     return () => {
//       ws.close();
//     };
//   }, [serverAlerts]);
  const push = useCallback(
    (pathname: string) => {
      if (location.pathname === pathname) return;
      history.push({
        pathname,
      });
    },
    [history, location.pathname],
  );

  const maybeRedirectToAccounts = useCallback(() => {
    return location.pathname === "/manager" && push("/accounts");
  }, [location.pathname, push]);

  const handleOpenSendModal = useCallback(() => {
    maybeRedirectToAccounts();
    dispatch(openModal("MODAL_SIGN_TRANSACTION", undefined));
  }, [dispatch, maybeRedirectToAccounts]);

  return (
    <>
      <CatalogBanner />
      <Box grow>
        <Box id="header" horizontal grow marginBottom="18px">
          <Box horizontal grow justifyContent="space-between">
            <Box>
              <Title>Whispers</Title>
            </Box>
            <Box>
              <Button small primary onClick={handleOpenSendModal}>
                <Box horizontal flow={1} alignItems="center">
                  <IconPlus size={12} />
                  <Box>New Account</Box>
                </Box>
              </Button>
            </Box>
          </Box>
        </Box>
        <AlertsGrid>
          {dummyAlerts.map(alert => (
            <AlertCard key={alert.id}>
              <CardHeaderContainer>
                <CardHeader>{alert.name}</CardHeader>
              </CardHeaderContainer>
              <CardContent>
                <p>{alert.address}</p>
                <p>{alert.condition}</p>
              </CardContent>
            </AlertCard>
          ))}
        </AlertsGrid>
        <Box>
          <NotificationPanel></NotificationPanel>
        </Box>
      </Box>
    </>
  );
};

export default Whisp;
