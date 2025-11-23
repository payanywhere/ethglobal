/**
 * LZ Config for Polygon as Default Destination Chain
 */

import stargatePools from "./stargate-pools.json";

const destinationAddressEnv =
  process.env.NEXT_PUBLIC_PAYANYWHERE_FEE_COMPOSER_ADDRESS ||
  process.env.PAYANYWHERE_FEE_COMPOSER_ADDRESS ||
  "";

export const ENDPOINT_ID=30109;
export const DESTINATION_ADDRESS=destinationAddressEnv;

type StargatePool = {
  Chain: string;
  "Chain ID": string;
  "Asset Name": string;
  "Asset Symbol": string;
  Issuer: string;
  "Asset Type": string;
  "OFT Address": string;
  "Token Address": string;
  "Endpoint ID": string;
  Stage: string;
};

/**
 * Get the OFT Address for a given chain ID
 * @param chainId - The chain ID as a string or number
 * @returns The OFT Address if found, undefined otherwise
 */
export function getOFTAddressByChainId(chainId: string | number): string | undefined {
  const chainIdStr = String(chainId);
  const pool = (stargatePools as StargatePool[]).find(
    (p) => p["Chain ID"] === chainIdStr
  );
  return pool?.["OFT Address"];
}
