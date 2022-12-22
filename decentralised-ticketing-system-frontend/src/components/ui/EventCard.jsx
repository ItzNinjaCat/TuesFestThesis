import React from 'react';
import ImageScroller from './ImageScroller';
import * as Name from 'w3name';
import { CID } from 'multiformats/cid';
import * as Digest from 'multiformats/hashes/digest';
import { Web3Storage } from 'web3.storage';
import { keys } from 'libp2p-crypto';
const storage = new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE_API_KEY });

function hexToBytes(hex) {
    for (var bytes = [], c = 2; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

async function fetchImageCid(storageBytes) {
    const keyCid = CID.decode(new Uint8Array(hexToBytes(storageBytes)))
    const pubKey = keys.unmarshalPublicKey(Digest.decode(keyCid.multihash.bytes).bytes)
    const revision = await Name.resolve(new Name.Name(pubKey))
    const results = await storage.get(revision._value)
    const imageFiles = await results.files();
    return imageFiles[0];
}

async function fetchImageUrls(storageBytes) {
    const imageFiles = await Promise.resolve(fetchImageCid(storageBytes));
    const read = new FileReader();
    let urls;
    read.onloadend = async function () {
        const tmp = await storage.get(JSON.parse(read.result).images);
        const imageFiles = await tmp.files();
        const imageURLs = imageFiles.map((file) => {
            return `${process.env.REACT_APP_W3LINK_URL}/${JSON.parse(read.result).images}/${file.name}`;
        })
        urls =  imageURLs;
    }
    read.readAsBinaryString(imageFiles).then(console.log(urls));
    
    // return await read.onloadend();
}

function EventCard({
    name,
    description,
    storageBytes,
    id,
    creator
}) {
    Promise.resolve(fetchImageUrls(storageBytes)).then((imageURLs) => {
        console.log(imageURLs);
    })

    return (
            <>
            <h1>Event Card</h1>
            <p>Name: {name}</p>
            <p>Desc: {description}</p>
            <p>Id: {id}</p>
                <p>Creator: {creator}</p>
                {/* <ImageScroller images={imageURLs} /> */}
            </>
        )

}

export default EventCard;