"use client";

/**
 * Real Unicity wallet for Attest — same pattern as Mint.
 *
 * Identity is derived locally from a BIP-39 mnemonic using the Sphere SDK's
 * pure primitives, so connect always works. Balance/network sync is
 * best-effort; attestation signing uses the local key.
 */

import {
  generateMnemonic,
  identityFromMnemonicSync,
  deriveAddressInfo,
  getAddressId,
  signMessage,
} from "@unicitylabs/sphere-sdk";

export interface UnicityWallet {
  address: string; // DIRECT://...
  addressId: string;
  nametag: string;
  created: boolean;
  generatedMnemonic?: string;
}

const BASE_PATH = "m/44'/0'/0'";
const MNEMONIC_KEY = "frani-attest:mnemonic";

export function addressFromMnemonic(mnemonic: string): { address: string; addressId: string } {
  const mk = identityFromMnemonicSync(mnemonic.trim());
  const info = deriveAddressInfo(mk, BASE_PATH, 0, false);
  const address = `DIRECT://${info.publicKey}` as const;
  return { address, addressId: getAddressId(address) };
}

export function isValidMnemonic(phrase: string): boolean {
  const words = phrase.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
}

export function generateFreshMnemonic(): string {
  return generateMnemonic(128);
}

export function readStoredMnemonic(): string | null {
  try {
    return window.localStorage.getItem(MNEMONIC_KEY);
  } catch {
    return null;
  }
}

export function storeMnemonic(phrase: string) {
  try {
    window.localStorage.setItem(MNEMONIC_KEY, phrase);
  } catch {
    /* ignore */
  }
}

export function clearStoredMnemonic() {
  try {
    window.localStorage.removeItem(MNEMONIC_KEY);
  } catch {
    /* ignore */
  }
}

/** Sign a message with the wallet's key — used to sign attestations. */
export function signWithWallet(mnemonic: string, message: string): string {
  const mk = identityFromMnemonicSync(mnemonic.trim());
  const info = deriveAddressInfo(mk, BASE_PATH, 0, false);
  return signMessage(info.privateKey, message);
}

export function connectUnicityWallet(input?: { mnemonic?: string }): UnicityWallet {
  const mnemonic = input?.mnemonic?.trim() || generateFreshMnemonic();
  if (!isValidMnemonic(mnemonic)) {
    throw new Error("That recovery phrase isn't valid. Check the words and their order.");
  }
  const { address, addressId } = addressFromMnemonic(mnemonic);
  storeMnemonic(mnemonic);
  return {
    address,
    addressId,
    nametag: `wallet_${address.slice(-6)}`,
    created: !input?.mnemonic,
    generatedMnemonic: !input?.mnemonic ? mnemonic : undefined,
  };
}

export function loadUnicityWallet(): UnicityWallet | null {
  const mnemonic = readStoredMnemonic();
  if (!mnemonic || !isValidMnemonic(mnemonic)) return null;
  const { address, addressId } = addressFromMnemonic(mnemonic);
  return {
    address,
    addressId,
    nametag: `wallet_${address.slice(-6)}`,
    created: false,
  };
}

export function disconnectUnicityWallet() {
  clearStoredMnemonic();
}
