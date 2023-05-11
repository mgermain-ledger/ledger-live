import network from "@ledgerhq/live-common/network";

const baseUrl = (accountId: string) =>
  `http://ns3179261.ip-51-210-220.eu/chainwatch/v0/eth_goerli/account/${accountId}`;

export const setupAccount = async (accountId = "0x22F9DF1a8f82682E05b53A739dc61e5BE061391b") => {
  try {
    const response = await network({
      method: "GET",
      headers: {
        // Origin: "http://localhost:8080",
        // Host: "http://ns3179261.ip-51-210-220.eu",
        Accept: "*/*",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      url: `http://ns3179261.ip-51-210-220.eu/chainwatch/v0/eth_goerli/account/${accountId}`,
    });

    if (response.status !== 200) {
      const putResponse = await network({
        method: "PUT",
        headers: {
          // Origin: "http://localhost:8080",
          // Host: "http://ns3179261.ip-51-210-220.eu",
          Accept: "*/*",
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        url: `http://ns3179261.ip-51-210-220.eu/chainwatch/v0/eth_goerli/account/${accountId}`,
      });
      if (putResponse.status === 200) {
        console.log("success");
      } else {
        console.log("%cfail", "color: #007acc;", putResponse);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

export const getMonitors = async (
  accountId = "0x22F9DF1a8f82682E05b53A739dc61e5BE061391b",
  monitorId: string,
) => {
  // /v0/{network}/account/{id}/monitor/{monitor}
  // res {
  //   "name": "string",
  //   "description": "string",
  //   "confirmations": 0,
  //   "contract": "string"
  // }
  const monitorsResponse = await network({
    method: "GET",
    headers: {
      // Origin: "http://localhost:8080",
      // Host: "http://ns3179261.ip-51-210-220.eu",
      Accept: "*/*",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    url: `${baseUrl(accountId)}/monitor/${monitorId}`,
  });

  return monitorsResponse.data;
};
