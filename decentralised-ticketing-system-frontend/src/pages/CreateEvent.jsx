import React from 'react';
import {ethers} from 'ethers';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TicketInfo from '../components/ui/TicketInfo';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadMutableData, uploadImmutableData } from '../utils/web3.storageEndpoints'
// import { v5 as uuidv5 } from 'uuid
import { keys } from 'libp2p-crypto'
import { TICKET_ADDRESS, TICKET_ABI } from '../constants/contracts';
import { getContract } from '../utils/getContract';
import { useWeb3React } from '@web3-react/core';
import { connectorHooks, getName } from '../utils/connectors';
import * as Name from 'w3name';
import { CID } from 'multiformats/cid'
import * as Digest from 'multiformats/hashes/digest'
import { Web3Storage } from 'web3.storage';
const storage = new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE_API_KEY });
function CreateEvent() {
    const bytes = {"0":1,"1":114,"2":0,"3":36,"4":8,"5":1,"6":18,"7":32,"8":6,"9":158,"10":123,"11":57,"12":97,"13":101,"14":124,"15":48,"16":219,"17":28,"18":67,"19":207,"20":75,"21":8,"22":48,"23":111,"24":241,"25":1,"26":51,"27":226,"28":210,"29":0,"30":213,"31":123,"32":145,"33":216,"34":47,"35":119,"36":166,"37":210,"38":218,"39":139}
    var values = Object.keys(bytes).map(function(key){
    return bytes[key];
    });
    // console.log(values)
    // console.log(values);
    // ethers.utils.defaultAbiCoder.decode(['bytes'], '0x080112400a882e6cb359bfc4868a0fb75256ef8cdb5d14b51d3b4a30aba157648304b341fde1b4c4b4ba13f17060e6419876c48ed1dd0d06ed2d8ef10fcdb7313eefb51f');
    // const keyCid = CID.decode(new Uint8Array(values))
    // const pubKey = keys.unmarshalPublicKey(Digest.decode(keyCid.multihash.bytes).bytes)
    // Name.resolve(new Name.Name(pubKey)).then((revision) => {
    //     storage.get(revision._value).then((cid) => {
    //         cid.files().then((files) => {
    //             for (const file of files) {
    //                     const read = new FileReader();
    //                     read.readAsBinaryString(file);
    //                     read.onloadend = function(){
    //                         console.log(read.result);
    //                     }
    //             }
    //         })
    //     });
    //     console.log(revision._value);
    // });    
    // const test = new keys.supportedKeys.ed25519.Ed25519PublicKey(new Uint8Array(values));
    // console.log(test);
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);
    const [name = '', setName] = useState();
    const [desc = '', setDesc] = useState();
    const [images = [], setImages] = useState();
    const [ticketTypes = [0], setTicketTypes] = useState();
    const [ticketInputFields, setTicketInputFields] = useState([
        { 
            name: '', 
            price: 0,
            quantity: 0,
            image: '',
            souvenir: ''
        }
    ]);
    const { connector } = useWeb3React();
    const hooks = connectorHooks[getName(connector)];
    const { useProvider, useAccount } = hooks;
    const provider = useProvider();
    const account = useAccount();
    const getTypeIndex = (ticket) => {
        return ticketTypes.indexOf(ticket);
    }
    const handleSubmit = async (e) => {
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
        }
        else {
            e.preventDefault();
            setValidated(true);
            const creationTime = new Date().getTime();
            const contract = getContract(TICKET_ADDRESS, TICKET_ABI.abi, provider, account);
            console.log(contract);
            // contract.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), account);
            const eventId = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string"], [name]));
            console.log(eventId);
            const ticketCids = [];
            const ticketPromises = ticketInputFields.map(async ticket => {
                const ticketImagesCid = await uploadImmutableData([ticket.image, ticket.souvenir])
                const ticketMetadata = {
                    name: ticket.name,
                    description: `This is a ${ticket.name} ticket for ${name}`,
                    image: `${process.env.REACT_APP_W3LINK_URL}/${ticketImagesCid}/${ticket.image.name}`,
                    external_url: `https://localhost:3000/events/${eventId}`,
                    attributes: [{
                        price: ticket.price,
                        quantity: ticket.quantity,
                        createdAt: creationTime,
                    }]
                }
                ticketCids.push(ticketImagesCid);
                const souvenirMetadata = {
                    name: `${ticket.name} Souvenir`,
                    description: `This is a ${ticket.name} souvenir for ${name}`,
                    image: `${process.env.REACT_APP_W3LINK_URL}/${ticketImagesCid}/${ticket.souvenir.name}`,
                    external_url: `https://localhost:3000/events/${eventId}`,
                    attributes: [{
                        ticketPrice: ticket.price,
                        quantity: ticket.quantity,
                        createdAt: creationTime,
                    }]
                }
                const ticketBlob = new Blob([JSON.stringify(ticketMetadata)], { type: 'application/json' });
                const souvenirBlob = new Blob([JSON.stringify(souvenirMetadata)], { type: 'application/json' });
                return uploadMutableData([new File([ticketBlob], `${ticket.name}.json`), new File([souvenirBlob], `${ticket.name}_souvenir.json`)]);

            })
            Promise.all(ticketPromises).then(async (responses) => {
                console.log(responses[0].bytes);
                console.log(responses);
                const keysBytes = responses.map(response => response.bytes);
                const imagesCids = await uploadImmutableData(images);
                const event = {
                    images: imagesCids,
                    tickets: keysBytes,
                    creationTime: creationTime
                }
                uploadMutableData([new File([JSON.stringify(event)], `${name}.json`)]).then(
                    async (cid) => {
                        console.log(cid);
                        await contract.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EVENT_ORGANIZER')), account);
                        const tx = await contract.createEvent(eventId, name, desc, cid.bytes);
                        tx.wait().then(() => {

                            ticketInputFields.forEach(async (ticket, index) => {
                                await contract.createTicketType(
                                    eventId,
                                    ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string"], [ticket.name])),
                                    `${process.env.REACT_APP_W3LINK_URL}/${ticketCids[index]}/${ticket.image.name}`,
                                    `${process.env.REACT_APP_W3LINK_URL}/${ticketCids[index]}/${ticket.souvenir.name}`,
                                    ticket.price,
                                    ticket.quantity
                                )
                            });
                        });
                    }
                    );
                }).then(navigate(`/events/${eventId}`));
            } 
        // TODO : Connect to the smart contract and create the event
    }
        
    const changeName = (e) => {
        setName(e.target.value);
    }
        
    const changeDesc = (e) => {
        setDesc(e.target.value);
    }

    const uploadEventImages = (e) => {
        if (Array.from(e.target.files).length > 5) {
            e.preventDefault();
            alert("You can upload up to 5 images");
            const items = new DataTransfer();
            Array.from(e.target.files).forEach((fileObj, i) => {
                if (i < 5) {
                    items.items.add(fileObj);
                }
            });
            e.target.files = items.files;
        }
        let removeIndexes = [];
        Array.from(e.target.files).forEach((file, index) => {
            if (file.size > 1024 * 1024 * 10) {
                e.preventDefault();
                alert("File size cannot be larger than 10MB");
                removeIndexes.push(index);
            }
            if(!file.type.match('image.*')) {
                e.preventDefault();
                alert("Only images are allowed");
                removeIndexes.push(index);
            }
        });
        const items = new DataTransfer();
        Array.from(e.target.files).forEach((fileObj, i) => {
            if (!removeIndexes.includes(i)) {
                items.items.add(fileObj);
            }
        });
        e.target.files = items.files;
        setImages(e.target.files);
    }

    const addTicketInfo = () => {
        console.log(ticketInputFields)
        let newArr = [...ticketTypes];
        newArr.push(ticketTypes[ticketTypes.length-1] + 1);
        setTicketTypes(newArr);
        const values = [...ticketInputFields];
        values.push({ 
            name: '', 
            price: 0, 
            quantity: 0,
            image: '',
            souvenir: '',
        });
        setTicketInputFields(values);
    }


    return (
        <div className="my-5 d-flex flex-column align-items-center">
            <h1>Create event</h1>
            <Form 
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
            >
                <Row className="mb-3">
                    <Form.Group as={Col}  controlId="eventName">
                        <Form.Label>Event name</Form.Label>
                        <Form.Control 
                            type="text"
                            placeholder="Enter event name"
                            onChange={changeName}
                            value={name}
                            maxLength='30'
                            required 
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide an event name.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="eventImages" as={Col}>
                        <Form.Label>Event images</Form.Label>
                        <Form.Control 
                            type="file"
                            accept=".jpg, .png, .jpeg, .gif"
                            multiple 
                            onChange={uploadEventImages}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide atleast one event image.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                    <Form.Group as={Col} controlId="eventDescription">
                        <Form.Label>Event description</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="Enter event description"
                            onChange={changeDesc}
                            value={desc}
                            required 
                            maxLength='200'
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide an event description.
                        </Form.Control.Feedback>
                    </Form.Group>
                        {ticketTypes.map(ticket => 
                            <TicketInfo 
                                key={ticket}
                                ticketInputFields={ticketInputFields}
                                setTicketInputFields={setTicketInputFields}
                                index={getTypeIndex(ticket)}
                                ticketTypes={ticketTypes}
                                setTicketTypes={setTicketTypes}
                                
                            />
                        )}
                    <div className="d-flex justify-content-between">
                        <Button variant="light" onClick={addTicketInfo}>Add ticket</Button>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </div>
            </Form>
            </div>
    );
}

export default CreateEvent;
