import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Row, Col, Button } from "react-bootstrap";
import { formatEther, parseEther } from "ethers/lib/utils";
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
    const [selectedTicket, setSelectedTicket] = useState({
        name: "",
        price: "",
        quantity: "",
        image: "",
        souvenir: "",
    });
    const [selectedTicketId, setSelectedTicketId] = useState("");
    const { loading, data, error } = useQuery(EVENT_WITH_TYPES_BY_ID_QUERY, {
        variables: {
            id: id,
        },
        pollInterval: 500,
    });
    const { account, contract, isActive } = useContext(Web3Context);
    useEffect(() => {
        if (!loading) {
            if (isActive && account.toUpperCase() !== data.event.creator.toUpperCase()) navigate("/");
            setEvent(data.event);
            console.log(data.event.ticketTypes);
            setTicketTypes(data.event.ticketTypes);            
        }

    }, [account, loading, isActive, data]);

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

        const setTicketQuantity = (e) => {
        const value = Number(e.target.value);
        if (value < 0 && value > -100000) {
            e.target.value = -Number(e.target.value);
        }
        else if (value < -100000 || value > 100000) {
            e.target.value = 100000;
        }
        setSelectedTicket({ ...selectedTicket, maxSupply: value });
    }

    const setTicketPrice = (e) => {
        const value = Number(e.target.value);
        if (value < 0 && value > -100) {
            e.target.value = -Number(e.target.value);
        }
        else if (value < -100 || value > 100) {
            e.target.value = 100;
        }
        setSelectedTicket({ ...selectedTicket, price: value });
    }

    const setTicketImage = (e) => {
        if (e.target.files[0].size > 1024 * 1024 * 10) {
            e.preventDefault();
            alert("File size cannot be larger than 10MB");
            const items = new DataTransfer();
            e.target.files = items.files;
        }
        if(!e.target.files[0].type.match('image.*')) {
            e.preventDefault();
            alert("Only images are allowed");
            e.target.files = new DataTransfer().files;
        }
        setSelectedTicket({ ...selectedTicket, image: e.target.files[0] });
    }
    const setTicketSouvenir = (e) => {
        if (e.target.files[0].size > 1024 * 1024 * 10) {
            e.preventDefault();
            alert("File size cannot be larger than 10MB");
            e.target.files = new DataTransfer().files;
        }
        if(!e.target.files[0].type.match('image.*')) {
            e.preventDefault();
            alert("Only images are allowed");
            e.target.files = new DataTransfer().files;
        }
        setSelectedTicket({ ...selectedTicket, souvenir: e.target.files[0] });
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
                    image: encodeURI(`${process.env.REACT_APP_W3LINK_URL}/${ticketImagesCid}/${selectedTicket.image.name}`),
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
                    image: encodeURI(`${process.env.REACT_APP_W3LINK_URL}/${ticketImagesCid}/${selectedTicket.souvenir.name}`),
                    external_url: encodeURI(`https://localhost:3000/events/${event.id}`),
                    attributes: [{
                        ticketPrice: selectedTicket.price,
                        quantity: selectedTicket.maxSupply,
                        createdAt: creationTime
                    }]
                }
                const ticketBlob = new Blob([JSON.stringify(ticketMetadata)], { type: 'application/json' });
                const souvenirBlob = new Blob([JSON.stringify(souvenirMetadata)], { type: 'application/json' });

                const cid = await uploadImmutableData([
                    new File([ticketBlob], `${selectedTicket.name}_metadata.json`),
                    new File([souvenirBlob], `${selectedTicket.name}_souvenir_metadate.json`)
                ]);
                selectedTicket.image = encodeURI(`${process.env.REACT_APP_W3LINK_URL}/${cid}/${selectedTicket.name}_metadata.json`);
                selectedTicket.souvenir = encodeURI(`${process.env.REACT_APP_W3LINK_URL}/${cid}/${selectedTicket.name}_souvenir_metadate.json`);
            }
            else if (selectedTicket.image !== "") {
                const ticketImagesCid = await uploadImmutableData([selectedTicket.image]);
                const creationTime = new Date().getTime() / 1000;
                const ticketMetadata = {
                    name: selectedTicket.name,
                    description: `This is a ${selectedTicket.name} ticket for ${event.name}`,
                    image: encodeURI(`${process.env.REACT_APP_W3LINK_URL}/${ticketImagesCid}/${selectedTicket.image.name}`),
                    external_url: encodeURI(`https://localhost:3000/events/${event.id}`),
                    attributes: [{
                        price: selectedTicket.price,
                        quantity: selectedTicket.maxSupply,
                        createdAt: creationTime
                    }]
                }
                const ticketBlob = new Blob([JSON.stringify(ticketMetadata)], { type: 'application/json' });

                const cid = await uploadImmutableData([
                    new File([ticketBlob], `${selectedTicket.name}_metadata.json`)
                ]);
                selectedTicket.image = encodeURI(`${process.env.REACT_APP_W3LINK_URL}/${cid}/${selectedTicket.name}_metadata.json`);
                selectedTicket.souvenir = selectedTicket.souvenirURI;
            }
            else if (selectedTicket.souvenir !== "") {
                const ticketImagesCid = await uploadImmutableData([selectedTicket.souvenir]);
                const creationTime = new Date().getTime() / 1000;
                const souvenirMetadata = {
                    name: `${selectedTicket.name} Souvenir`,
                    description: `This is a ${selectedTicket.name} souvenir for ${event.name}`,
                    image: encodeURI(`${process.env.REACT_APP_W3LINK_URL}/${ticketImagesCid}/${selectedTicket.souvenir.name}`),
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
                selectedTicket.souvenir = encodeURI(`${process.env.REACT_APP_W3LINK_URL}/${cid}/${selectedTicket.name}_souvenir_metadate.json`);
            }
            else {
                selectedTicket.image = selectedTicket.tokenURI;
                selectedTicket.souvenir = selectedTicket.souvenirURI;
            }    
            console.log(
                event.eventId,
                selectedTicketId,
                selectedTicket.name,
                selectedTicket.image,
                selectedTicket.souvenir,
                parseEther(String(selectedTicket.price)),
                selectedTicket.maxSupply
            );
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
        <div className="mt-10 mb-3 d-flex flex-column align-items-center">
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
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a souvenir price.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                    <Button type="submit">Update</Button>
            </Form>
            </div>
            <div className="d-flex justify-content-around">
                <Button variant="success">Add new type</Button>
                <Button variant="danger" onClick={deleteType} disabled={ticketTypes?.length <= 1 || selectedTicketId === ""}>Delete this type</Button>
            </div>
        </>
        );
        
}

export default Tickets;