import { useEffect, useState } from 'react';
import { formatEther } from '@ethersproject/units';

function useBalances(provider, accounts, tokenContract) {
    const [balances, setBalances] = useState();
    useEffect(() => {
        if (provider && accounts?.length) {
            let stale = false;
            void Promise.all(accounts.map(account => tokenContract.balanceOf(account))).then(
                balances => {
                    if (stale) return;
                    setBalances(balances.map(balance => formatEther(balance)));
                },
            );
            return () => {
                stale = true;
                setBalances(undefined);
            };
        }
    }, [provider, accounts]);
    return balances;
}

export default useBalances;
