import {
  Contract,
  ContractTransactionResponse,
  JsonRpcProvider,
  Wallet,
  parseUnits,
} from "ethers";
import { config } from "../../config";
import { BlockchainTransactionFailureError } from "../errors";

// Value in the env vars will define whether it's on Polygon mainnet or amoy
const blockchainProvider = new JsonRpcProvider(config.BLOCKCHAIN_RPC_URL);

const vdaTokenErc20Abi = [
  "function transfer(address to, uint256 value) returns (bool)",
];

export async function transferVdaTokens({
  to,
  amount,
}: {
  to: string;
  amount: number;
}): Promise<string> {
  try {
    const senderWallet = new Wallet(
      config.AIRDROPS_SENDER_ACCOUNT_PRIVATE_KEY,
      blockchainProvider
    );

    // Value in the env vars will define whether it's on Polygon mainnet or amoy
    const vdaTokenContract = new Contract(
      config.BLOCKCHAIN_VDA_CONTRACT_ADDRESS,
      vdaTokenErc20Abi,
      senderWallet
    );

    const tokenAmount = parseUnits(amount.toString(), 18);

    const transaction = (await vdaTokenContract.transfer(
      to,
      tokenAmount
    )) as ContractTransactionResponse;

    const transactionReceipt = await transaction.wait();
    if (!transactionReceipt) {
      throw new BlockchainTransactionFailureError(
        "Transaction returned no receipt"
      );
    }

    return transactionReceipt.hash;
  } catch (error) {
    throw new BlockchainTransactionFailureError(undefined, undefined, {
      cause: error,
    });
  }
}

export function getBlockchainExplorerTransactionUrl(txHash: string): string {
  return `${config.BLOCKCHAIN_TRANSACTION_EXPLORER_URL}${txHash}`;
}
