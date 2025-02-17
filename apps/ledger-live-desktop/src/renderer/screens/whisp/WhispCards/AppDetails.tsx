import React from "react";
import { useTranslation } from "react-i18next";
import styled, { DefaultTheme } from "styled-components";

import Box from "~/renderer/components/Box";
import LiveAppIcon from "~/renderer/components/WebPlatformPlayer/LiveAppIcon";
import { Whisp } from "..";
import { CryptoIcon } from "@ledgerhq/react-ui";

const getBranchColor = (branch: string, colors: DefaultTheme["colors"]) => {
  switch (branch) {
    case "soon":
      return colors.palette.text.shade100;
    case "experimental":
      return colors.warning;
    case "debug":
      return colors.palette.text.shade40;
    default:
      return "currentColor";
  }
};
const HeaderContainer = styled(Box)`
  width: 100%;
  flex-direction: row;
  align-items: center;
  // justify-content: space-between;
  > :last-child {
    justify-self: flex-end;
  }
`;
export const IconContainer = styled(Box).attrs(() => ({
  mr: 2,
}))`
  user-select: none;
  pointer-events: none;
`;
const TitleContainer = styled.div`
  flex-shrink: 1;
`;
const AppName = styled(Box).attrs(p => ({
  ff: "Inter|SemiBold",
  fontSize: 5,
  textAlign: "left",
  color: p.theme.colors.palette.secondary.main,
}))`
  line-height: 18px;
`;
const Content = styled(Box)`
  margin-top: 16px;
  width: 100%;

  :empty {
    display: none;
  }
`;
const BranchBadge = styled(Box).attrs<{ branch: string }>(p => ({
  ff: "Inter|SemiBold",
  fontSize: 1,
  color: getBranchColor(p.branch, p.theme.colors),
}))<{ branch: string }>`
  display: inline-block;
  padding: 2px 4px;
  border: 1px solid currentColor;
  border-radius: 3px;
  text-transform: uppercase;
  margin-top: 4px;
  margin-bottom: 6px;
  flex-grow: 0;
  flex-shrink: 1;

  ${p =>
    p.branch === "soon" &&
    `
    background: ${p.theme.colors.palette.text.shade20};
    border-width: 0;
  `}
`;
type Props = {
  manifest: Whisp;
};
const AppDetails = ({ manifest }: Props) => {
  const { t } = useTranslation();
  const description = manifest.value.description;
  return (
    <>
      <HeaderContainer>
        <IconContainer data-test-id="live-icon-container">
          <LiveAppIcon icon={undefined} name={manifest.value.name} size={48} />
        </IconContainer>
        <TitleContainer>
          <span>
            <AppName>{manifest.value.name}</AppName>
          </span>
          {/* <BranchBadge branch={"branch"}>{manifest.value.confirmations}</BranchBadge> */}
        </TitleContainer>

        <CryptoIcon name={"ETH"} size={32} />
      </HeaderContainer>
      <Content>
        <span>
          {" Confirmations required   > "}
          <BranchBadge branch={"branch"}>{manifest.value.confirmations}</BranchBadge>
        </span>
        <Content>{description}</Content>
      </Content>
    </>
  );
};
export default AppDetails;
