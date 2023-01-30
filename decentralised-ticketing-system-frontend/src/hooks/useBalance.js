import { useEffect, useState } from 'react';
import { formatEther } from '@ethersproject/units';

function useBalance(isActive, provider, account, tokenContract, balanceUpdate, setBalanceUpdate) {
    const [balance, setBalance] = useState(undefined);
    useEffect(() => {
        if (isActive && provider && account) {
            let stale = false;
            tokenContract.balanceOf(account).then(bal => {
                if (stale) return;
                setBalance(formatEther(bal));
                setBalanceUpdate(false);
            });
            return () => {
                stale = true;
                setBalance(undefined);
                setBalanceUpdate(false);
            };
        }
    }, [provider, account, isActive, balanceUpdate]);
    return balance;
}

export default useBalance;
