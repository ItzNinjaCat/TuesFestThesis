import React from 'react';
import {ethers} from 'ethers';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TicketInfo from '../components/ui/TicketInfo';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadMutableData, uploadImmutableData } from '../utils/web3.storageEndpints'
// import { v5 as uuidv5 } from 'uuid

function CreateEvent() {
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

    const getTypeIndex = (ticket) => {
        return ticketTypes.indexOf(ticket);
    }
    function readFiles(files) {
        return Promise.all([].map.call(files, function (file) {
            return new Promise(function (resolve, reject) {
                var reader = new FileReader();
                reader.onloadend = function () {
                    resolve(reader.result);
                };
                reader.readAsDataURL(file);
            });
        })).then(function (results) {
            return results;
        });
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
            const eventId = "fsdfsdfsfsf";
            const ticketPromises = ticketInputFields.map(async ticket => {
                console.log(ticket.name);
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
                const blob = new Blob([JSON.stringify(ticketMetadata)], { type: 'application/json' });
                return uploadMutableData([new File([blob], `${ticket.name}.json`)]);

            })
            Promise.all(ticketPromises).then(async (responses) => {
                console.log(responses[0].key);
                const imagesCids = await uploadImmutableData(images);
                const event = {
                    name: name,
                    description: desc,
                    images: imagesCids,
                    tickets: responses,
                    creationTime: creationTime
                }
                uploadMutableData([new File([JSON.stringify(event)], `${name}.json`)]).then(
                    (cid) => {
                        console.log(cid);
                        navigate(`/events/${cid}`);
                    }
                );
            });
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
