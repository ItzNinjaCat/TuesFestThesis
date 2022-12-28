import React from 'react';
import ImageGallery from 'react-image-gallery';
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

async function fetchImageUrls(storageBytes, setImageUrls) {
    const imageFiles = await Promise.resolve(fetchImageCid(storageBytes));
    const read = new FileReader();
    let urls;
    read.onloadend = async function () {
        console.log(JSON.parse(read.result).images)
        const tmp = await storage.get(JSON.parse(read.result).images);
        const imageFiles = await tmp.files();
        const imageURLs = imageFiles.map((file) => {
            return { original: `${process.env.REACT_APP_W3LINK_URL}/${JSON.parse(read.result).images}/${file.name}` };
        })

        setImageUrls(imageURLs);
    }
    read.readAsBinaryString(imageFiles);
}

function EventCard({
    name,
    description,
    storageBytes,
    id,
    creator
}) {
    const [imageUrls, setImageUrls] = React.useState([]);
    Promise.resolve(fetchImageUrls(storageBytes, setImageUrls));
    

        return (
            <>
                <h1>Event Card</h1>
                <p className='text-break'>Name: {name}</p>
                <p className='text-break'>Desc: {description}</p>
                <p className='text-break'>Id: {id}</p>
                <p className='text-break'>Creator: {creator}</p>
                {imageUrls.length > 0 ? <ImageGallery items={imageUrls} showPlayButton={false} /> : <></>};
            </>
        )
}

export default EventCard;