import Box from "~/renderer/components/Box";
import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { openModal } from "~/renderer/actions/modals";
import IconPlus from "~/renderer/icons/Plus";
import Button from "~/renderer/components/Button";
import { Flex, Text, Tag as TagComponent } from "@ledgerhq/react-ui";
import styled from "styled-components";
import CatalogBanner from "../platform/CatalogBanner";
import { WhispersTable } from "./Table";
import LiveAppIcon from "~/renderer/components/WebPlatformPlayer/LiveAppIcon";
import IconCheck from "~/renderer/icons/Check";
import { colors } from "~/renderer/styles/theme";

enum Type {
  Send = "send",
  Receive = "receive",
  NativeThreshold = "native_transfer_threshold",
  ERC20Mint = "erc20_mint",
  ERC20Burn = "erc20_burn",
  ERC20Threshold = "erc20_transfer_threshold",
  ERC20Send = "erc20_send",
  ERC20Receive = "erc20_receive",
  ERC721Mint = "erc721_mint",
  ERC721Burn = "erc721_burn",
  ERC1155Mint = "erc1155_mint",
  ERC1155Burn = "erc1155_burn",
}

type Whisp = {
  id: number;
  value: {
    type: Type;
    name: string;
    description: string;
    confirmations: number;
    contract?: string;
    min_value?: number;
  };
};

const Whispers: Whisp[] = [
  {
    id: 1,
    value: {
      type: Type.Send,
      name: "Send ETH",
      description: "Send 1 ETH to Bob",
      confirmations: 12,
      contract: undefined,
      min_value: undefined,
    },
  },
  {
    id: 2,
    value: {
      type: Type.Receive,
      name: "Receive ETH",
      description: "Receive 0.5 ETH from Alice",
      confirmations: 6,
      contract: undefined,
      min_value: undefined,
    },
  },
  {
    id: 3,
    value: {
      type: Type.ERC20Mint,
      name: "Mint ERC20",
      description: "Mint 1000 DAI",
      confirmations: 24,
      contract: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      min_value: undefined,
    },
  },
  {
    id: 4,
    value: {
      type: Type.ERC20Burn,
      name: "Burn ERC20",
      description: "Burn 500 USDC",
      confirmations: 18,
      contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      min_value: undefined,
    },
  },
  {
    id: 5,
    value: {
      type: Type.ERC721Mint,
      name: "Mint ERC721",
      description: "Mint a new CryptoKitty",
      confirmations: 5,
      contract: "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d",
      min_value: undefined,
    },
  },
];

console.log(Whispers);

//eth_goerli

// 1. GET http://ns3179261.ip-51-210-220.eu/v0/eth/account/33a4f34f-e0a3-4d3d-80ab-f442a2a7c393'
// 2. PUT http://ns3179261.ip-51-210-220.eu/v0/eth/account/33a4f34f-e0a3-4d3d-80ab-f442a2a7c393'
// 3. PUT Target
// 4. PUT http://ns3179261.ip-51-210-220.eu/v0/eth/account/33a4f34f-e0a3-4d3d-80ab-f442a2a7c393/addresses {body addresses}
// 5. PUT Monitors
// 6. GET Mononitor pour la liste !

interface Alert {
  id: number;
  name: string;
  address: string;
  condition: string;
}

//  temp type until i have data
export type WhispersSubscription = {
  id: number;
  name: string;
  address: string; // "address of interest" | "contract of interest"
  condition: string;
  ticker?: string; // e.g. "ETH" for icon
  action?: "transfer" | "withdrawal" | "mint" | "burn" | "send" | "receive" | string;
  threshold?: number;
  currencyCategory?: "native" | "erc20" | "erc721" | "erc1155";
};

const dummyAlerts: WhispersSubscription[] = [
  {
    id: 1,
    name: "Mint 4 NFTs",
    address: "0x123456789",
    condition: "mint 4 NFTs of CryptoKitties collection",
    threshold: 4,
    action: "mint",
  },
  {
    id: 2,
    name: "Large liquidity withdrawal",
    address: "0x987654321",
    condition: "withdrawal of more than 100,000 from Uniswap pool",
    threshold: 100000,
    action: "withdrawal",
  },
  {
    id: 3,
    name: "Price increase",
    address: "0xabcdef0123",
    condition: "ETH price exceeds 5000",
    threshold: 5000,
    action: undefined,
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
  font-size: 16px;
`;

const CardSubtitle = styled(Text)`
  font-weight: 00;
  font-size: 12px;
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

const AlertRow = styled.div`
  padding: 20px;
  border-radius: 4px;
  flex-direction: row;
  display: flex;
  justify-content: space-between;
  background-color: ${p => p.theme.colors.palette.opacityDefault.c05};
`;

const CustomTag = styled(TagComponent)`
  border-radius: 6px;
  padding: 2px 6px 2px 6px;
`;

const Whisp = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [serverAlerts, setServerAlerts] = useState<Alert[]>([]);

  const ws = new WebSocket("ws://localhost:3000/ws");

  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const openAddWhisper = useCallback(() => {
    dispatch(openModal("MODAL_ADD_WHISPER", undefined));
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
    <Box>
      <CatalogBanner />
      <Box id="header" horizontal grow mb={1}>
        <Flex justifyContent="space-between" flexDirection={"row"} flexGrow={1}>
          <Box>
            <Title>Whispers</Title>
          </Box>
          <Box>
            <Button small primary onClick={handleOpenSendModal}>
              <Box horizontal flow={1} alignItems="center">
                <IconPlus size={12} />
                <Box>Hear new whisper</Box>
              </Box>
            </Button>
          </Box>
        </Flex>
      </Box>

      <Box>
        {/* Beth stuff */}
        {!!dummyAlerts && <WhispersTable data={dummyAlerts} />}
      </Box>

      <Box marginBottom="18px">
        {dummyAlerts.map(alert => (
          <Box marginBottom="12px" key={alert.id}>
            <AlertRow>
              <Box horizontal>
                <LiveAppIcon icon={undefined} name={alert.name} size={35} />
                <Box marginLeft="18px">
                  <CardHeader>{alert.name}</CardHeader>
                  <CardSubtitle>{alert.condition}</CardSubtitle>
                </Box>
              </Box>
              <div>
                {/* <CustomTag active type="plain" size="small">
                    Activated
                  </CustomTag> */}
                <Box>
                  <IconCheck color={colors.positiveGreen} size={16} />
                </Box>
              </div>
            </AlertRow>
          </Box>
        ))}
      </Box>

      <Box id="header" horizontal marginBottom="18px">
        <Box horizontal grow justifyContent="space-between">
          <Box>
            <Title>Discover</Title>
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

      {/* <Box>
        <NotificationPanel></NotificationPanel>
      </Box> */}
    </Box>
  );
};

export default Whisp;
