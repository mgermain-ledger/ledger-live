import Box from "~/renderer/components/Box";
import React, { useState, useCallback, useEffect } from "react";
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
import { colors } from "~/renderer/styles/theme";

import { setupAccount } from "./api";
import AppCard from "./WhispCards/AppCard";

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

export type Whisp = {
  id: number;
  value: {
    type: Type;
    name: string;
    description: string;
    confirmations: number;
    contract?: string;
    // eslint-disable-next-line camelcase
    min_value?: number;
  };
};

const mockWhispers: Whisp[] = [
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

console.log(mockWhispers);

// eth_goerli

// 1. GET http://ns3179261.ip-51-210-220.eu/v0/eth/account/33a4f34f-e0a3-4d3d-80ab-f442a2a7c393'
// 2. PUT http://ns3179261.ip-51-210-220.eu/v0/eth/account/33a4f34f-e0a3-4d3d-80ab-f442a2a7c393'
// 3. PUT Target
// 4. PUT http://ns3179261.ip-51-210-220.eu/v0/eth/account/33a4f34f-e0a3-4d3d-80ab-f442a2a7c393/addresses {body addresses}
// 5. PUT Monitors
// 6. GET Mononitor pour la liste !

// const dummyAlerts = [
//   {
//     id: 1,
//     name: "Mint 4 NFTs",
//     address: "0x123456789",
//     condition: "mint 4 NFTs of CryptoKitties collection",
//     threshold: 4,
//     action: "mint",
//   },
//   {
//     id: 2,
//     name: "Large liquidity withdrawal",
//     address: "0x987654321",
//     condition: "withdrawal of more than 100,000 from Uniswap pool",
//     threshold: 100000,
//     action: "withdrawal",
//   },
//   {
//     id: 3,
//     name: "Price increase",
//     address: "0xabcdef0123",
//     condition: "ETH price exceeds 5000",
//     threshold: 5000,
//     action: undefined,
//   },
// ];

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

const Title = styled(Box).attrs(p => ({
  ff: "Inter|SemiBold",
  fontSize: 7,
  color: p.theme.colors.palette.secondary.main,
}))``;

const WhispScreen = () => {
  const [alerts, setAlerts] = useState<Whisp[]>([mockWhispers[3], mockWhispers[0]]);

  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const openAddWhisper = useCallback(() => {
    dispatch(openModal("MODAL_ADD_WHISPER", undefined));
  }, [dispatch]);

  useEffect(() => {
    console.log("whispy whisp");

    console.log("%cWhisp.tsx line:265 whisp?", "color: white; background-color: #007acc;", {
      alerts,
    });
    setupAccount();
  }, [alerts]);

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
      <Box id="header" horizontal grow mb={0}>
        <Flex
          alignItems={"center"}
          justifyContent="space-between"
          flexDirection={"row"}
          flexGrow={1}
        >
          {/* <Box> */}
          <Title>Whispers</Title>
          {/* </Box> */}
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
        {/* Active alerts table */}
        {!!alerts && <WhispersTable data={alerts} />}
      </Box>

      {/* Clickable new alerts */}
      <Box horizontal marginTop="28px" marginBottom="10px">
        <Flex
          alignItems={"center"}
          justifyContent="space-between"
          flexDirection={"row"}
          flexGrow={1}
        >
          <Title>Discover</Title>
        </Flex>
      </Box>
      <Grid>
        {mockWhispers.map(alert => (
          <GridItem key={alert.id}>
            <AppCard
              id={`catalog-${alert.id}`}
              manifest={alert}
              onClick={() =>
                setAlerts([
                  ...alerts,
                  mockWhispers.find(whisp => whisp.id === alert.id) ?? mockWhispers[0],
                ])
              }
            />
          </GridItem>
        ))}
      </Grid>

      {/* Prev grid */}
      {/* <Grid>
        {mockWhispers.map(({ id, value }) => (
          <GridItem key={id}>
            <AlertCard key={id}>
              <CardHeaderContainer>
                <LiveAppIcon icon={undefined} name={value.name} size={35} />
                <CardHeader>{value.name}</CardHeader>
              </CardHeaderContainer>
              <CardContent>
                <p>{value.contract}</p>
                <p>{value.description}</p>
              </CardContent>
            </AlertCard>
          </GridItem>
        ))}
      </Grid> */}

      {/* <Box>
        <NotificationPanel></NotificationPanel>
      </Box> */}
    </Box>
  );
};

export default WhispScreen;
