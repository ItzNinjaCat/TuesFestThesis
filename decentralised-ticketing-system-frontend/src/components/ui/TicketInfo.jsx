import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { resizeImage } from '../../utils/utils';
function TicketInfo({
    ticketInputFields,
    setTicketInputFields,
    index,
    ticketTypes,
    setTicketTypes
    }) {
    const setTicketName = (e) => {
        const values = [...ticketInputFields];
        values[index].name = e.target.value;
        setTicketInputFields(values);
    }

    const setTicketQuantity = (e) => {
        const value = Number(e.target.value);
        if (value < 0 && value > -100000) {
            e.target.value = -Number(e.target.value);
        }
        else if (value < -100000 || value > 100000) {
            e.target.value = 100000;
        }
        const values = [...ticketInputFields];
        values[index].quantity = e.target.value;
        setTicketInputFields(values);
    }

    const setTicketPrice = (e) => {
        const value = Number(e.target.value);
        if (value < 0 && value > -100) {
            e.target.value = -Number(e.target.value);
        }
        else if (value < -100 || value > 100) {
            e.target.value = 100;
        }
        const values = [...ticketInputFields];
        values[index].price = e.target.value;
        setTicketInputFields(values);
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
        const values = [...ticketInputFields];
        resizeImage(e.target.files[0]).then((resizedImage) => {
            values[index].image = resizedImage;
            setTicketInputFields(values);
        });
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
        const values = [...ticketInputFields];
        resizeImage(e.target.files[0]).then((resizedImage) => {
            console.log(resizedImage);
            values[index].souvenir = resizedImage;
            setTicketInputFields(values);
        });
    }
    const removeTicketInfo = () => {
        const values = [...ticketInputFields];
        const ticketValues = [...ticketTypes];
        values.splice(index, 1);
        ticketValues.splice(index, 1);
        setTicketInputFields(values);
        setTicketTypes(ticketValues);
    }

    return (
        <div className={!index ? "mb-5 mt-5" : "mb-5"}>
            <h3 className="text-center">Create Ticket type</h3>
            <Form.Group controlId="ticketName" className="mb-3">
                <Form.Label>Ticket name</Form.Label>
                <Form.Control 
                    type="text"
                    placeholder="Ticket name"
                    onChange={setTicketName}
                    value={ticketInputFields.name}
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
                    value={ticketInputFields.price}
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
                    value={ticketInputFields.quantity}
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
                        required 
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
                        required 
                    />
                    <Form.Control.Feedback type="invalid">
                        Please provide a souvenir price.
                    </Form.Control.Feedback>
                </Form.Group>
            </Row>
            {index !== 0 ? <div>
                <Button variant="light" onClick={removeTicketInfo}>Remove ticket</Button>
                </div> : null}
            </div>
        
    );
}

export default TicketInfo;
