/* eslint-disable react/prop-types */

import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { Trans } from "react-i18next";
import { InView } from "react-intersection-observer";
import { useDispatch, useSelector } from "react-redux";
import InfoCircle from "~/renderer/icons/InfoCircle";
import TriangleWarning from "~/renderer/icons/TriangleWarning";
import LinkWithExternalIcon from "~/renderer/components/LinkWithExternalIcon";
import { openURL } from "~/renderer/linking";
import { ScrollArea } from "~/renderer/components/Onboarding/ScrollArea";
import Box from "~/renderer/components/Box";
import Text from "~/renderer/components/Text";
import { useDeepLinkHandler } from "~/renderer/hooks/useDeeplinking";
import { closeInformationCenter } from "~/renderer/actions/UI";
import useDateTimeFormat from "~/renderer/hooks/useDateTimeFormat";
import { useNotifications } from "~/renderer/hooks/useNotifications";
import TrackPage from "~/renderer/analytics/TrackPage";
import { urls } from "~/config/urls";
import Button from "~/renderer/components/Button";
import { ContentCard, LocationContentCard, NotificationContentCard } from "~/types/dynamicContent";
import { flattenAccountsSelector } from "~/renderer/reducers/accounts";
import { openModal } from "~/renderer/actions/modals";
// Martin's loco test
import { Params } from "~/renderer/modals/SignTransaction/Body"; // import Params type from your types file
import { SignedOperation } from "@ledgerhq/types-live/lib/transaction";
import BigNumber from "bignumber.js";
import { PlatformTransaction } from "@ledgerhq/live-common/platform/types";
import { RawPlatformTransaction } from "@ledgerhq/live-common/platform/rawTypes";
import { useWhispers } from "~/renderer/hooks/useWhispers";
import { ActionDefault } from "~/renderer/screens/account/AccountActionsDefault";
import IconReceive from "~/renderer/icons/Receive";
import IconSend from "~/renderer/icons/Send";
import IconSwap from "~/renderer/icons/Swap";
import IconExchange from "~/renderer/icons/Exchange";
import IconSell from "~/renderer/icons/Plus";
import { Console } from "console";
import { ClassicCard, ContentCards } from "@braze/web-sdk";
import { unary } from "lodash";

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

interface Alert {
  title: string;
  description: string;
}

const addressMap: { [key: string]: any } = {
  "8c8d7c46219d9205f056f28fee5950ad564d7465": "DeFi 🤖",
  "0x9490372141": "dupont",
};
// const addressMap: { [key: string]: any } = { '8c8d7c46219d9205f056f28fee5950ad564d7465': 'Binance US ⚠️', "0x9490372141": "dupont"};

function getValueOrKey(key: string, dictionary: { [key: string]: any }): any {
  if (key.toLowerCase() in dictionary) {
    return dictionary[key];
  } else {
    return "0x" + key + " (Unknown Address)";
  }
}

const alertsDict: Record<Type, Alert> = {
  [Type.NativeThreshold]: {
    title: "Native Transfer Threshold Exceeded",
    description: "Alert triggered when the threshold for native token transfers is exceeded.",
  },
  [Type.Send]: {
    title: "🚨 Watched address transaction detected 🚨",
    description:
      "Alert triggered when a transaction involves sending native tokens to another address.",
  },
  [Type.Receive]: {
    title: "Native Token Received",
    description:
      "Alert triggered when a transaction involves receiving native tokens from another address.",
  },
  [Type.ERC20Threshold]: {
    title: "🐋 Big Spender Alert! Watch out!",
    description: "Alert triggered when the threshold for ERC20 token transfers is exceeded.",
  },
  [Type.ERC20Send]: {
    title: "ERC20 Token Sent",
    description:
      "Alert triggered when a transaction involves sending ERC20 tokens to another address.",
  },
  [Type.ERC20Receive]: {
    title: "ERC20 Token Received",
    description:
      "Alert triggered when a transaction involves receiving ERC20 tokens from another address.",
  },
  [Type.ERC20Mint]: {
    title: "ERC20 Tokens Minted",
    description: "Alert triggered when new ERC20 tokens are minted.",
  },
  [Type.ERC20Burn]: {
    title: "ERC20 Tokens Burned",
    description: "Alert triggered when existing ERC20 tokens are burned (destroyed).",
  },
  [Type.ERC721Mint]: {
    title: "🖼 Watched collection has been minted 🖼",
    description: "Alert triggered when a new ERC721 token is minted.",
  },
  [Type.ERC721Burn]: {
    title: "ERC721 Token Burned",
    description: "Alert triggered when an existing ERC721 token is burned (destroyed).",
  },
  [Type.ERC1155Mint]: {
    title: "ERC1155 Tokens Minted",
    description: "Alert triggered when new ERC1155 tokens are minted.",
  },
  [Type.ERC1155Burn]: {
    title: "ERC1155 Tokens Burned",
    description: "Alert triggered when existing ERC1155 tokens are burned (destroyed).",
  },
};

// account_id: "0abc";
// account_network: "eth";
// address_hash: "f0b294994851a1d94e470a612ab64b942e76fbd5f9d65b722378d330c7043e7b";
// address_suffix: "564d7465";
// alert_name: "send";
// amount: "57639773989589042";
// from: "8c8d7c46219d9205f056f28fee5950ad564d7465";
// location: "whisper";
// monitor: "Send(0)";
// to: "84804deedf364a5b1ebb3f8939339fc0f6fbb7e0";
// tx_hash: "480f83a4bb56c3fd9b24e34e675010e3be343ba18c11f48045ab3299f52d28f4";
// when: "17235916";

function getTitle(alertKey: Type): string | null {
  const alert = alertsDict[alertKey];
  return alert ? alert.title : null;
}

function getDescription(alertKey: Type, brazeCard: ClassicCard): string | null {
  if (alertKey === Type.Send) {
    return `${getValueOrKey(brazeCard?.extras?.from, addressMap)} sent ${0.0 +
      brazeCard?.extras?.amount / 10 ** 18} ETH to ${getValueOrKey(
      brazeCard?.extras?.to,
      addressMap,
    )}`;
  }
  if (alertKey === Type.ERC721Mint) {
    return `Doodles (DOODLE) was minted by ${getValueOrKey(brazeCard?.extras?.to, addressMap)}`;
  }
  if (alertKey === Type.ERC20Threshold) {
    return `${getValueOrKey(brazeCard?.extras?.from, addressMap)} moved ${0.0 +
      brazeCard?.extras?.amount / 10 ** 18} WETH to ${getValueOrKey(
      brazeCard?.extras?.to,
      addressMap,
    )}`;
    return `${getValueOrKey(
      brazeCard?.extras?.from,
      addressMap,
    )} moved 1000 WETH to ${getValueOrKey(brazeCard?.extras?.to, addressMap)}`;
  } else {
    const alert = alertsDict[alertKey];
    return alert ? alert.description : null;
  }
}

const DateRowContainer = styled.div`
  padding: 4px 16px;
  background-color: ${({ theme }) => theme.colors.palette.background.default};
  border-radius: 4px;
  margin: 25px 0px;
`;
const levelThemes = {
  info: {
    title: "palette.text.shade100",
    text: "palette.text.shade50",
    background: undefined,
    icon: undefined,
    link: undefined,
    padding: undefined,
  },
  warning: {
    title: "white",
    text: "white",
    background: "orange",
    icon: "white",
    link: "white",
    padding: "16px",
  },
  alert: {
    title: "palette.text.shade100",
    text: "palette.text.shade50",
    background: "red",
    icon: "white",
    link: "white",
    padding: undefined,
  },
};
const getLevelTheme = (levelName: keyof typeof levelThemes) => {
  const levelData = levelThemes[levelName];
  if (levelData) {
    return levelData;
  }
  return levelThemes.info;
};
const UnReadNotifBadge = styled.div`
  width: 8px;
  height: 8px;
  background-color: ${p => p.theme.colors.wallet};
  border-radius: 8px;
  position: absolute;
  top: calc(50% - 4px);
  left: 0px;
  z-index: 1;
`;
type DateRowProps = {
  date: Date;
};
const DateLabel = styled(Text).attrs({
  color: "palette.text.shade60",
  ff: "Inter|SemiBold",
  fontSize: "11px",
  lineHeight: "18px",
})`
  display: inline-block;

  &::first-letter {
    text-transform: uppercase;
  }
`;
function DateRow({ date }: DateRowProps) {
  const dateFormatter = useDateTimeFormat({
    dateStyle: "full",
  });
  return (
    <DateRowContainer>
      <DateLabel>{dateFormatter(date)}</DateLabel>
    </DateRowContainer>
  );
}
const ArticleRootContainer = styled.div<{ isRead?: boolean }>`
  padding-left: ${p => (p.isRead ? 0 : 16)}px;
  position: relative;
`;
const ArticleContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  border-radius: 4px;
`;
const ArticleRightColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
type ArticleProps = {
  level: keyof typeof levelThemes;
  icon: keyof typeof icons;
  title: React.ReactNode;
  text: React.ReactNode;
  brazeCard: ClassicCard;
  link?: {
    label?: string;
    href: string;
  };
  utmCampaign?: string;
  isRead?: boolean;
};
const icons = {
  warning: {
    defaultIconColor: "orange",
    Icon: TriangleWarning,
  },
  info: {
    defaultIconColor: "wallet",
    Icon: InfoCircle,
  },
};
const getIcon = (iconName: keyof typeof icons) => {
  const iconData = icons[iconName];
  if (iconData) {
    return iconData;
  }
  return icons.info;
};
type ArticleLinkProps = {
  label?: string;
  href: string;
  utmCampaign?: string;
  color?: string;
  brazeCard?: ClassicCard;
};
function ArticleLink({ label, href, utmCampaign, brazeCard, color }: ArticleLinkProps) {

  const accounts = useSelector(flattenAccountsSelector);
  
  function signTransaction({
    canEditFees,
    useApp,
    account,
    transactionData,
    onResult,
    onCancel,
    parentAccount,
    startWithWarning,
    recipient,
    amount,
  }: Params): Promise<void> {
    return new Promise((resolve, reject) =>
      dispatch(
        openModal("MODAL_SIGN_TRANSACTION", {
          canEditFees,
          stepId: canEditFees ? "amount" : "summary",
          transactionData: {
            ...transactionData,
            recipient,
            amount,
          },
          useApp,
          account,
          parentAccount,
          onResult: (signedOperation: SignedOperation) => {
            onResult(signedOperation);
            resolve();
          },
          onCancel: (error: Error) => {
            // onCancel(error);
            reject(error);
          },
          startWithWarning,
        }),
      ),
    );
  }

  function createRawEtherumTransaction(): RawPlatformTransaction {
    return {
      family: "ethereum" as any,
      amount: "0",
      recipient: "0x932Ca55B9Ef0b3094E8Fa82435b3b4c50d713043",
      nonce: 8,
      data: "0x6ecd23060000000000000000000000000000000000000000000000000000000000000001",
      gasPrice: new BigNumber("21000"),
      gasLimit: new BigNumber("21000"),
    };
  }

  const MyTxParams: Params = {
    canEditFees: true,
    useApp: undefined,
    account: accounts[12],
    transactionData: {
      ...createRawEtherumTransaction(),
    },
    onResult: (signedOperation: SignedOperation) => {
      // Handle success
    },
    onCancel: (reason: unknown) => {
      // Handle error
    },
    parentAccount: null,
    startWithWarning: false,
    recipient: "0x932Ca55B9Ef0b3094E8Fa82435b3b4c50d713043",
    amount: new BigNumber(1000),
  };

  const { handler } = useDeepLinkHandler();
  const dispatch = useDispatch();
  // const url = useMemo(() => {
  //   url.searchParams.set("utm_medium", "announcement");
  //   if (utmCampaign) {
  //     url.searchParams.set("utm_campaign", utmCampaign);
  //   }
  //   return url;
  // }, [href, utmCampaign]);
  const onLinkClick = useCallback(() => {

    if (brazeCard?.extras?.account_network?.toString() == "eth") {
      openURL("https://etherscan.io/tx/0x" + brazeCard?.extras?.tx_hash);
    }
    if (brazeCard?.extras?.account_network?.toString() == "eth_goerli") {
      openURL("https:///goerli.etherscan.io/.com/tx/0x" + brazeCard?.extras?.tx_hash);
    }
  }, [handler, dispatch]);

  const onBuyClick = useCallback(() => {
    handler(null, "ledgerlive://buy");
    dispatch(closeInformationCenter());
  }, [handler, dispatch]);

  const onSwapClick = useCallback(() => {
    handler(null, "ledgerlive://swap");
    dispatch(closeInformationCenter());
  }, [handler, dispatch]);

  return (
    <>
      {brazeCard?.extras?.alert_name === Type.Send.toString() ? (
        <Box horizontal>
          <Button my={2} mr={2} small primary onClick={onBuyClick}>
            <Box horizontal flow={1} alignItems="center">
              <IconExchange size={14} />
              <Box ml={2}>Buy</Box>
            </Box>
          </Button>

          <Button my={2} small primary onClick={onSwapClick}>
            <Box horizontal flow={1} alignItems="center">
              <IconSwap size={14} />
              <Box>Swap</Box>
            </Box>
          </Button>
        </Box>
      ) : null}
      {brazeCard?.extras?.alert_name === Type.ERC721Mint.toString() ||
      brazeCard?.extras?.alert_name === Type.ERC1155Mint.toString() ? (
        <div>
          <Button my={2} mr={2} small primary onClick={() => signTransaction(MyTxParams) }>
            <Box horizontal flow={1} alignItems="center">
              <IconSend size={14} />
              <Box ml={2}>Clone Transaction</Box>
            </Box>
          </Button>
        </div>
      ) : null}
      <LinkWithExternalIcon
        color={color}
        onClick={onLinkClick}
        style={{
          marginTop: 15,
        }}
      >
        View on Etherscan
      </LinkWithExternalIcon>
    </>
  );
}
function Article({
  level = "info",
  icon = "info",
  title,
  brazeCard,
  text,
  link,
  utmCampaign,
  isRead,
}: ArticleProps) {
  const levelTheme = getLevelTheme(level);
  const { Icon, defaultIconColor } = getIcon(icon);
  const alertName = brazeCard?.extras?.alert_name;
  const type = alertName && Object.values(Type).includes(alertName) ? (alertName as Type) : null;
  console.log(type);

  if (brazeCard.extras?.alert_name) {
    return (
      <ArticleRootContainer isRead={isRead}>
        <ArticleContainer
          bg={levelTheme.background}
          py={levelTheme.padding}
          px="16px"
          color={levelTheme.icon || defaultIconColor}
        >
          <ArticleRightColumnContainer>
            <Box horizontal alignItems="center" justifyContent="center">
              <Icon size={15} />
              <Box ml={2} flex="1">
                <Text
                  color={levelTheme.title}
                  ff="Inter|SemiBold"
                  fontSize="14px"
                  lineHeight="16.94px"
                >
                  {getTitle(type)}
                </Text>
              </Box>
            </Box>

            <Text
              mt="4px"
              color={levelTheme.text}
              ff="Inter|Medium"
              fontSize="12px"
              lineHeight="18px"
            >
              {getDescription(type, brazeCard)}
            </Text>
            {link ? (
              <ArticleLink
                href={link.href}
                label={link.label}
                utmCampaign={utmCampaign}
                color={levelTheme.link}
                brazeCard={brazeCard}
              />
            ) : null}
          </ArticleRightColumnContainer>
        </ArticleContainer>
        {isRead ? null : <UnReadNotifBadge />}
      </ArticleRootContainer>
    );
  } else {
    return <></>;
  }
}
const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;
const Separator = styled.div`
  margin: 25px 0px;
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.neutral.c40};
`;

export function WhisperPanel() {
  const {
    cachedWhispers,
    whisperCards,
    logWhisperImpression,
    groupWhispers,
    onClickWhisper,
  } = useWhispers();
  // const { logNotificationImpression, groupNotifications, onClickNotif } = useNotifications();
  //Modals
  const accounts = useSelector(flattenAccountsSelector);
  const dispatch = useDispatch();

  const groups = useMemo(
    () => groupWhispers(whisperCards),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [whisperCards],
  );


  const { handler } = useDeepLinkHandler();
  // const baseMockTransaction: Transaction = {
  //   amount: new BigNumber(0),
  //   recipient: "",
  //   useAllAmount: false,
  //   mode: "send",
  //   family: "ethereum",
  //   gasPrice: null,
  //   maxFeePerGas: new BigNumber("28026227316"),
  //   maxPriorityFeePerGas: new BigNumber("1000000000"),
  //   userGasLimit: null,
  //   estimatedGasLimit: null,
  //   feeCustomUnit: null,
  //   networkInfo: {
  //     family: "ethereum",
  //   },

  // const myTransactionData: PlatformTransaction & { gasLimit: BigNumber } = {
  //   family: "ethereum",
  //   amount: new BigNumber("100000000000000000"), // 1 ETH in wei
  //   recipient: "0xEb01D9cD600De20100753459B619A3e0cd86456e".toLowerCase(),
  //   gasPrice: new BigNumber("50000000000"), // 50 gwei
  //   gasLimit: new BigNumber("21000")
  // };

  const timeoutByUUID = useRef<Record<string, NodeJS.Timeout>>({});
  const handleInViewNotif = useCallback(
    (visible: boolean, uuid: keyof typeof timeoutByUUID.current) => {
      const timeouts = timeoutByUUID.current;
      console.log("handleInViewNotif");
      if (whisperCards.find(n => !n.viewed && n.id === uuid) && visible && !timeouts[uuid]) {
        timeouts[uuid] = setTimeout(() => {
          logWhisperImpression(uuid);
          delete timeouts[uuid];
        }, 2000);
      }
      if (!visible && timeouts[uuid]) {
        clearTimeout(timeouts[uuid]);
        delete timeouts[uuid];
      }
    },
    [logWhisperImpression, whisperCards],
  );

  if (whisperCards.length === 0) {
    return (
      <PanelContainer>
        <Text
          mt="22px"
          color="palette.text.shade100"
          ff="Inter|SemiBold"
          fontSize="18px"
          lineHeight="21.78px"
        >
          Let the chain whisper your next move
        </Text>
        <Text
          mt="8px"
          color="palette.text.shade50"
          ff="Inter|Regular"
          fontSize="13px"
          lineHeight="16px"
        >
          Create a new whisper to get started
        </Text>
        <Box
          mt={5}
          mb={5}
          horizontal
          style={{
            width: 300,
          }}
          flow={3}
          justifyContent="center"
        >
          <Button
            primary
            onClick={() => { handler(null, "ledgerlive://whisp");
            dispatch(closeInformationCenter());}}
            data-test-id="portfolio-empty-state-add-account-button"
          >
            Add Whisper
          </Button>
        </Box>
      </PanelContainer>
    );
  }
  return (
    <ScrollArea hideScrollbar>
      <Box py="32px">
        {groups.map((group, index) => (
          <React.Fragment key={index}>
            {group.day ? <DateRow date={group.day} /> : null}
            {group.data.map(
              ({ title, description, brazeCard, path, url, viewed, id, cta }, index) => (
                <React.Fragment key={id}>
                  {brazeCard.extras &&
                    brazeCard.extras?.alert_name?.toString() ==
                      (brazeCard.extras.alert_name as keyof typeof Type) && (
                      <>
                        <InView
                          as="div"
                          onChange={visible => handleInViewNotif(visible, id)}
                          onClick={() => onClickWhisper(group.data[index])}
                        >
                          <Article
                            title={title}
                            text={description}
                            isRead={viewed}
                            brazeCard={brazeCard}
                            level={"info"}
                            icon={"info"}
                            link={{
                              label: cta,
                              href: url || path || urls.ledger,
                            }}
                          />
                        </InView>
                        {index < group.data.length - 1 ? <Separator /> : null}
                      </>
                    )}
                  {/* <InView
                  as="div"
                  onChange={visible => handleInViewNotif(visible, id)}
                  onClick={() => onClickWhisper(group.data[index])}
                >
                  <Article
                    title={title}
                    text={description}
                    isRead={viewed}
                    brazeCard={brazeCard}
                    level={"info"}
                    icon={"info"}
                    link={{
                      label: cta,
                      href: url || path || urls.ledger,
                    }}
                  />
                </InView>
                {index < group.data.length - 1 ? <Separator /> : null} */}
                </React.Fragment>
              ),
            )}
          </React.Fragment>
        ))}
      </Box>
    </ScrollArea>
  );
}
