import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Row, Col, Button, Modal } from "react-bootstrap";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers } from "ethers";
import { uploadImmutableData } from "../utils/web3.storageEndpoints";
import { Web3Context } from "../components/App";
import { useQuery } from "@apollo/client";
import { EVENT_WITH_TYPES_BY_ID_QUERY } from "../utils/subgraphQueries";

function Tickets() {
    const { id } = useParams();
    const [event, setEvent] = useState(undefined);
    const [ticketTypes, setTicketTypes] = useState(undefined);
    const [validated, setValidated] = useState(false);
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [newMaxSupply, setNewMaxSupply] = useState("");
    const [newTokenURI, setNewTokenURI] = useState("");
    const [newSouvenirURI, setNewSouvenirURI] = useState("");
    const [isAuthorised, setIsAuthorised] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState({
        name: "",
        price: "",
        quantity: "",
        image: "",
        souvenir: "",
    });
    const [selectedTicketId, setSelectedTicketId] = useState("");
    const { loading, data } = useQuery(EVENT_WITH_TYPES_BY_ID_QUERY, {
        variables: {
            id: id,
        }
    });
    const { account, contract } = useContext(Web3Context);
    useEffect(() => {
        if (isAuthorised) {
            return;
        }
        if (!loading) {
            try{
                if(data.event.creator !== account.toLowerCase()){
                    navigate('/');
                }
                else {
                    setIsAuthorised(true);
                }
            }catch(e){
                console.log(e);
                navigate('/');
            }
        }
    }, [loading, data, account]);
    useEffect(() => {
        if (!loading) {
            setEvent(data.event);
            console.log(data.event.ticketTypes);
            setTicketTypes(data.event.ticketTypes);            
        }

    }, [loading, data]);

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    const setSelected = ((e) => {
        setSelectedTicketId(e.target.value);
        const ticket = ticketTypes.find((ticket) => ticket.id === e.target.value);
        setSelectedTicket({
            name: ticket.name,
            price: formatEther(ticket.price),
            maxSupply: Number(ticket.maxSupply),
            tokenURI: ticket.tokenURI,
            souvenirURI: ticket.souvenirTokenURI,
            image: "",
            souvenir: "",
        });
    });

    const setTicketQuantity =((e, newTicket = false) => {
        const value = Number(e.target.value);
        if (value < 0 && value > -100000) {
            e.target.value = -Number(e.target.value);
        }
        else if (value < -100000 || value > 100000) {
            e.target.value = 100000;
            }
            if (newTicket) {
                setNewMaxSupply(value);
            }
            else {
                setSelectedTicket({ ...selectedTicket, maxSupply: value });
            }
    });

    const setTicketPrice = ((e, newTicket = false) => {
        const value = Number(e.target.value);
        if (value < 0 && value > -100) {
            e.target.value = -Number(e.target.value);
        }
        else if (value < -100 || value > 100) {
            e.target.value = 100;
        }
        if (newTicket) {
            setNewPrice(value);
        }
        else {
            setSelectedTicket({ ...selectedTicket, price: value });
        }
    });

    const setTicketImage = ((e, newTicket = false) => {
        if (e.target.files[0].size > 1024 * 1024 * 10) {
            e.preventDefault();
            alert("File size cannot be larger than 10MB");
            const items = new DataTransfer();
            e.target.files = items.files;
        }
        if (!e.target.files[0].type.match('image.*')) {
            e.preventDefault();
            alert("Only images are allowed");
            e.target.files = new DataTransfer().files;
        }
        if (newTicket) {
            setNewTokenURI(e.target.files[0]);
        }
        else {
            setSelectedTicket({ ...selectedTicket, image: e.target.files[0] });
        }
    });
    const setTicketSouvenir = ((e, newTicket = false) => {
        if (e.target.files[0].size > 1024 * 1024 * 10) {
            e.preventDefault();
            alert("File size cannot be larger than 10MB");
            e.target.files = new DataTransfer().files;
        }
        if (!e.target.files[0].type.match('image.*')) {
            e.preventDefault();
            alert("Only images are allowed");
            e.target.files = new DataTransfer().files;
        }
        if (newTicket) {
            setNewSouvenirURI(e.target.files[0]);
        }
        else {
            setSelectedTicket({ ...selectedTicket, souvenir: e.target.files[0] });
        }
    });

    const handleSubmitNew = async (e) => {
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
        }
        else {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            const ticketImagesCid = await uploadImmutableData([newTokenURI, newSouvenirURI]);
            const creationTime = new Date().getTime() / 1000;
            const ticketMetadata = {
                name: newName,
                description: `This is a ${newName} ticket for ${event.name}`,
                image: encodeURI(`${import.meta.env.VITE_W3LINK_URL}/${ticketImagesCid}/${newTokenURI.name}`),
                external_url: encodeURI(`https://localhost:3000/events/${event.id}`),
                attributes: [{
                    price: newPrice,
                    quantity: newMaxSupply,
                    createdAt: creationTime
                }]
            }
            const souvenirMetadata = {
                name: `${newName} Souvenir`,
                description: `This is a ${newName} souvenir for ${event.name}`,
                image: encodeURI(`${import.meta.env.VITE_W3LINK_URL}/${ticketImagesCid}/${newSouvenirURI.name}`),
                external_url: encodeURI(`https://localhost:3000/events/${event.id}`),
                attributes: [{
                    ticketPrice: newPrice,
                    quantity: newMaxSupply,
                    createdAt: creationTime
                }]
            }
            const ticketBlob = new Blob([JSON.stringify(ticketMetadata)], { type: 'application/json' });
            const souvenirBlob = new Blob([JSON.stringify(souvenirMetadata)], { type: 'application/json' });

            const cid = await uploadImmutableData([
                new File([ticketBlob], `${newName}_metadata.json`),
                new File([souvenirBlob], `${newName}_souvenir_metadate.json`)
            ]);
            const tokenURI = encodeURI(`${import.meta.env.VITE_W3LINK_URL}/${cid}/${newName}_metadata.json`);
            const souvenirTOkenURI = encodeURI(`${import.meta.env.VITE_W3LINK_URL}/${cid}/${newName}_souvenir_metadate.json`);
            contract.createTicketType(
                event.id,
                ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string"], [newName])),
                newName,
                tokenURI,
                souvenirTOkenURI,
                parseEther(String(newPrice)),
                newMaxSupply
            ).then((tx) => {
                tx.wait().then((receipt) => {
                    console.log(receipt);
                    setNewName("");
                    setNewPrice(0);
                    setNewMaxSupply(0);
                    setNewTokenURI("");
                    setNewSouvenirURI("");
                    setValidated(false);
                    handleClose();
                })
            });
            

        }
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
            e.stopPropagation();
            setValidated(true);
            if (selectedTicket.image !== "" && selectedTicket.souvenir !== "") {
                const ticketImagesCid = await uploadImmutableData([selectedTicket.image, selectedTicket.souvenir]);
                const creationTime = new Date().getTime() / 1000;
                const ticketMetadata = {
                    name: selectedTicket.name,
                    description: `This is a ${selectedTicket.name} ticket for ${event.name}`,
                    image: encodeURI(`${import.meta.env.VITE_W3LINK_URL}/${ticketImagesCid}/${selectedTicket.image.name}`),
                    external_url: encodeURI(`https://localhost:3000/events/${event.id}`),
                    attributes: [{
                        price: selectedTicket.price,
                        quantity: selectedTicket.maxSupply,
                        createdAt: creationTime
                    }]
                }
                const souvenirMetadata = {
                    name: `${selectedTicket.name} Souvenir`,
                    description: `This is a ${selectedTicket.name} souvenir for ${event.name}`,
                    image: encodeURI(`${import.meta.env.VITE_W3LINK_URL}/${ticketImagesCid}/${selectedTicket.souvenir.name}`),
                    external_url: encodeURI(`https://localhost:3000/events/${event.id}`),
                    attributes: {
                        ticketPrice: selectedTicket.price,
                        quantity: selectedTicket.maxSupply,
                        createdAt: creationTime
                    }
                }
                const ticketBlob = new Blob([JSON.stringify(ticketMetadata)], { type: 'application/json' });
                const souvenirBlob = new Blob([JSON.stringify(souvenirMetadata)], { type: 'application/json' });

                const cid = await uploadImmutableData([
                    new File([ticketBlob], `${selectedTicket.name}_metadata.json`),
                    new File([souvenirBlob], `${selectedTicket.name}_souvenir_metadate.json`)
                ]);
                selectedTicket.image = encodeURI(`${import.meta.env.VITE_W3LINK_URL}/${cid}/${selectedTicket.name}_metadata.json`);
                selectedTicket.souvenir = encodeURI(`${import.meta.env.VITE_W3LINK_URL}/${cid}/${selectedTicket.name}_souvenir_metadate.json`);
            }
            else if (selectedTicket.image !== "") {
                const ticketImagesCid = await uploadImmutableData([selectedTicket.image]);
                const creationTime = new Date().getTime() / 1000;
                const ticketMetadata = {
                    name: selectedTicket.name,
                    description: `This is a ${selectedTicket.name} ticket for ${event.name}`,
                    image: encodeURI(`${import.meta.env.VITE_W3LINK_URL}/${ticketImagesCid}/${selectedTicket.image.name}`),
                    external_url: encodeURI(`https://localhost:3000/events/${event.id}`),
                    attributes: {
                        price: selectedTicket.price,
                        quantity: selectedTicket.maxSupply,
                        createdAt: creationTime
                    }
                }
                const ticketBlob = new Blob([JSON.stringify(ticketMetadata)], { type: 'application/json' });

                const cid = await uploadImmutableData([
                    new File([ticketBlob], `${selectedTicket.name}_metadata.json`)
                ]);
                selectedTicket.image = encodeURI(`${import.meta.env.VITE_W3LINK_URL}/${cid}/${selectedTicket.name}_metadata.json`);
                selectedTicket.souvenir = selectedTicket.souvenirURI;
            }
            else if (selectedTicket.souvenir !== "") {
                const ticketImagesCid = await uploadImmutableData([selectedTicket.souvenir]);
                const creationTime = new Date().getTime() / 1000;
                const souvenirMetadata = {
                    name: `${selectedTicket.name} Souvenir`,
                    description: `This is a ${selectedTicket.name} souvenir for ${event.name}`,
                    image: encodeURI(`${import.meta.env.VITE_W3LINK_URL}/${ticketImagesCid}/${selectedTicket.souvenir.name}`),
                    external_url: encodeURI(`https://localhost:3000/events/${event.id}`),
                    attributes: [{
                        ticketPrice: selectedTicket.price,
                        quantity: selectedTicket.maxSupply,
                        createdAt: creationTime
                    }]
                }
                const souvenirBlob = new Blob([JSON.stringify(souvenirMetadata)], { type: 'application/json' });
                const cid = await uploadImmutableData([
                    new File([souvenirBlob], `${selectedTicket.name}_souvenir_metadate.json`)
                ]);

                selectedTicket.image = selectedTicket.tokenURI;
                selectedTicket.souvenir = encodeURI(`${import.meta.env.VITE_W3LINK_URL}/${cid}/${selectedTicket.name}_souvenir_metadate.json`);
            }
            else {
                selectedTicket.image = selectedTicket.tokenURI;
                selectedTicket.souvenir = selectedTicket.souvenirURI;
            }    
            contract.updateTicketType(
                event.id,
                selectedTicketId,
                selectedTicket.name,
                selectedTicket.image,
                selectedTicket.souvenir,
                parseEther(String(selectedTicket.price)),
                selectedTicket.maxSupply
            );
            

        }
    }

    const deleteType = async () => {
        const tx = await contract.deleteTicketType(event.id, selectedTicketId);
        await tx.wait();
    }

    return (
        <>
            <div className="mt-5 mb-3 d-flex flex-column align-items-center">
                <h1>Update ticket types</h1>
                <Form
                    onSubmit={handleSubmit}
                    noValidate
                    validated={validated}
                >
                <Form.Group controlId="price">
                <Form.Label>Ticket type</Form.Label>
                <Form.Select
                    value={selectedTicketId}
                        onChange={setSelected}
                    required
                    >
                        <option value="" disabled hidden>Choose here</option>
                        {
                    ticketTypes?.map((ticket) => ( 
                            ticket?.id ?
                        <option key={ticket.id} value={ticket.id}>{ticket.name}</option> : null
                        ))
                        }
                </Form.Select>
                </Form.Group>
                <Form.Group controlId="ticketName" className="mb-3">
                    <Form.Label>Ticket name</Form.Label>
                    <Form.Control 
                        type="text"
                        placeholder="Ticket name"
                        onChange={(e) => setSelectedTicket({ ...selectedTicket, name: e.target.value })}
                        value={selectedTicket?.name}
                        maxLength='25'    
                        required 
                        disabled = {selectedTicketId === ""}    
                    />
                    <Form.Control.Feedback type="invalid">
                        Please provide a ticket name.
                    </Form.Control.Feedback>
                </Form.Group>
                <Row className="mb-3">
                    <Form.Group controlId="ticketPrice"  as={Col}>
                        <Form.Label>Ticket price (in TIK)</Form.Label>
                        <Form.Control 
                            type="number"
                            step="0.001"
                            placeholder="Ticket price"
                            onChange={setTicketPrice}
                            value={selectedTicket?.price}
                            required
                            min="0.001"
                            max="100"
                            disabled = {selectedTicketId === ""}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a ticket price bigger than 0.001 Tik.
                        </Form.Control.Feedback>
                        </Form.Group>
                    <Form.Group controlId="ticketQuantity"  as={Col}>
                        <Form.Label>Ticket quantity</Form.Label>
                        <Form.Control 
                            type="number"
                            step="1"
                            placeholder="Ticket quantity"
                            onChange={setTicketQuantity}
                            value={selectedTicket?.maxSupply}
                            required
                            min="1"
                            max="100000"
                            disabled = {selectedTicketId === ""}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a ticket quantity of atleast 1.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="ticketImage">
                        <Form.Label>Ticket image</Form.Label>
                        <Form.Control
                            type="file" 
                            accept=".jpg, .png, .jpeg"
                            onChange={setTicketImage} 
                            disabled = {selectedTicketId === ""}    
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a ticket image.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="souvenirImage" as={Col} >
                        <Form.Label>Souvenir image</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".jpg, .png, .jpeg"
                            onChange={setTicketSouvenir} 
                            disabled = {selectedTicketId === ""}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a souvenir price.
                        </Form.Control.Feedback>
                    </Form.Group>
                    </Row>
                    <div className="d-flex justify-content-between">
                        <Button variant="success" onClick={handleShow}>Add new type</Button>
                        <Button type="submit" disabled = {selectedTicketId === ""}>Update this type</Button>
                        <Button variant="danger" onClick={deleteType} disabled={ticketTypes?.length <= 1 || selectedTicketId === ""}>Delete this type</Button>
                    </div>
            </Form>
            </div>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add ticket type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form
                    onSubmit={handleSubmitNew}
                    noValidate
                    validated={validated}
                >
                <Form.Group controlId="ticketName" className="mb-3">
                    <Form.Label>Ticket name</Form.Label>
                    <Form.Control 
                        type="text"
                        placeholder="Ticket name"
                        onChange={(e) => setNewName(e.target.value)}
                        value={newName}
                        maxLength='25'    
                        required 
                    />
                    <Form.Control.Feedback type="invalid">
                        Please provide a ticket name.
                    </Form.Control.Feedback>
                </Form.Group>
                <Row className="mb-3">
                    <Form.Group controlId="ticketPrice"  as={Col}>
                        <Form.Label>Ticket price (in TIK)</Form.Label>
                        <Form.Control 
                            type="number"
                            step="0.001"
                            placeholder="Ticket price"
                            onChange={(e) => setTicketPrice(e, true)}
                            value={newPrice}
                            required
                            min="0.001"
                            max="100"
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a ticket price bigger than 0.001 Tik.
                        </Form.Control.Feedback>
                        </Form.Group>
                    <Form.Group controlId="ticketQuantity"  as={Col}>
                        <Form.Label>Ticket quantity</Form.Label>
                        <Form.Control 
                            type="number"
                            step="1"
                            placeholder="Ticket quantity"
                            onChange={(e) => setTicketQuantity(e, true)}
                            value={newMaxSupply}
                            required
                            min="1"
                            max="100000"
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a ticket quantity of atleast 1.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="ticketImage">
                        <Form.Label>Ticket image</Form.Label>
                        <Form.Control
                            type="file" 
                            accept=".jpg, .png, .jpeg"
                            onChange={(e) => setTicketImage(e,true)} 
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a ticket image.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="souvenirImage" as={Col} >
                        <Form.Label>Souvenir image</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".jpg, .png, .jpeg"
                            onChange={(e) => setTicketSouvenir(e, true)} 
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a souvenir price.
                        </Form.Control.Feedback>
                    </Form.Group>
                    </Row>
                    <div className="d-flex justify-content-center">
                        <Button type="submit">Add ticket type</Button>
                    </div>
            </Form>
                </Modal.Body>
            </Modal>
        </>
        );
        
}

export default Tickets;