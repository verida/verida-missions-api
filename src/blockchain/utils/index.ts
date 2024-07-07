import { POLYGON_AMOY_CHAIN_ID, POLYGON_MAINNET_CHAIN_ID } from "../constants";

export function getBlockchainExplorerTransactionUrl(
  txHash: string,
  network: string
): string {
  switch (network) {
    case POLYGON_MAINNET_CHAIN_ID:
      return `https://polygonscan.com/tx/${txHash}`;
    case POLYGON_AMOY_CHAIN_ID:
      return `https://amoy.polygonscan.com/tx/${txHash}`;
    default:
      return "";
  }
}

export async function transferVdaTokens({
  to,
  amount,
  network,
}: {
  to: string;
  amount: number;
  network: string;
}): Promise<string> {
  console.debug("Transferring VDA tokens", {
    to,
    amount,
    network,
  });

  // TODO: To implement

  return Promise.resolve("");
}
