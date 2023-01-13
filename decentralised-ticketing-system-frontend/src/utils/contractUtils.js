import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { ethers } from 'ethers';
import { parseEther } from '@ethersproject/units';

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

export async function onAttemptToApprove(ticketContract, tokenContract, account, amount) {
    console.log(amount);
    const nonce = await tokenContract.nonces(account); // Our Token Contract Nonces
    const deadline = +new Date() + 60 * 60; // Permit with deadline which the permit is valid
    const wrapValue = parseEther(amount); // Value to approve for the spender to use

    const EIP712Domain = [
        // array of objects -> properties from the contract and the types of them ircwithPermit
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'verifyingContract', type: 'address' },
    ];

    const domain = {
        name: await tokenContract.name(),
        version: '1',
        verifyingContract: tokenContract.address,
    };

    const Permit = [
        // array of objects -> properties from erc20withpermit
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
    ];

    const message = {
        owner: account,
        spender: ticketContract.address,
        value: wrapValue.toString(),
        nonce: nonce.toHexString(),
        deadline,
    };

    const data = JSON.stringify({
        types: {
            EIP712Domain,
            Permit,
        },
        domain,
        primaryType: 'Permit',
        message,
    });

    const signatureLike = await ticketContract.provider.send('eth_signTypedData_v4', [
        account,
        data,
    ]);
    const signature = await ethers.utils.splitSignature(signatureLike);

    const preparedSignature = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
        deadline,
    };
    return preparedSignature;
}
