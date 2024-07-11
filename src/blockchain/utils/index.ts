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
  onTransferStarted,
}: {
  to: string;
  amount: number;
  onTransferStarted?: (txHash: string) => Promise<void>;
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

    if (onTransferStarted) {
      void onTransferStarted(transaction.hash);
    }

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

export async function isTransactionSuccessfull(txHash: string) {
  const transactionReceipt =
    await blockchainProvider.getTransactionReceipt(txHash);

  return transactionReceipt?.status === 1;
}

export function getBlockchainExplorerTransactionUrl(txHash: string): string {
  return `${config.BLOCKCHAIN_TRANSACTION_EXPLORER_URL}${txHash}`;
}
