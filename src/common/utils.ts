export const EVM_ADDRESS_REGEXP = /^0x[0-9a-fA-F]{40}$/;

export const VERIDA_DID_REGEXP =
  /did:vda:(devnet|mainnet|testnet):0x[0-9a-fA-F]{40}/;

/**
 * Check if a string value is a valid EVM address.
 *
 * @param address The address or value to test.
 * @returns `true` if a valid EVM address, `false` otherwise.
 */
export function isValidEvmAddress(address?: string): boolean {
  return address ? EVM_ADDRESS_REGEXP.test(address) : false;
}

/**
 * Check if a string value is a valid Verida DID.
 *
 * @param did The DID or value to test.
 * @returns `true` if a valid Verida DID, `false` otherwise.
 */
export function isValidVeridaDid(did?: string): boolean {
  return did ? VERIDA_DID_REGEXP.test(did) : false;
}

export function isPromiseFulfilled<T>(
  result: PromiseSettledResult<T>
): result is PromiseFulfilledResult<T> {
  return result.status === "fulfilled";
}
