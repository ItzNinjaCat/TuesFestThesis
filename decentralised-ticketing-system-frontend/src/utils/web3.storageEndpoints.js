import { Web3Storage } from 'web3.storage';

const storage = new Web3Storage({ token: import.meta.env.VITE_WEB3_STORAGE_API_KEY });

export const getData = async cid => {
    const files = await storage.get(cid);
    return files;
};

export const uploadImmutableData = async files => {
    const cid = await storage.put(files);
    return cid;
};
