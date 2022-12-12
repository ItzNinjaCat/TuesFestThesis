import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';

export function isAddress(value) {
    try {
        return getAddress(value);
    } catch {
        return false;
    }
}

export function getSigner(library, account) {
    return library.getSigner(account).connectUnchecked();
}

export function getProviderOrSigner(library, account) {
    return account ? getSigner(library, account) : library;
}

export function getContract(address, ABI, library, account) {
    if (!isAddress(address) || address === AddressZero) {
        throw Error(`Invalid 'address' parameter '${address}'.`);
    }

    return new Contract(address, ABI, getProviderOrSigner(library, account));
}
