import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
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
    const setTicketPrice = (e) => {
        const values = [...ticketInputFields];
        values[index].price = e.target.value;
        setTicketInputFields(values);
    }
    const setTicketImage = (e) => {
        const values = [...ticketInputFields];
        values[index].image = e.target.files[0];
        setTicketInputFields(values);
    }
    const setTicketSouvenir = (e) => {
        const values = [...ticketInputFields];
        values[index].souvenir = e.target.files[0];
        setTicketInputFields(values);
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
        <div className={!index ?  "mb-5 mt-5" : "mb-5" }>
            <Row className="mb-3">
            <Form.Group controlId="ticketName"  as={Col} >
                <Form.Label>Ticket name</Form.Label>
                <Form.Control 
                    type="text"
                    placeholder="Ticket name"
                    onChange={setTicketName}
                    value={ticketInputFields.name}
                    required 
                />
                <Form.Control.Feedback type="invalid">
                    Please provide a ticket name.
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="ticketPrice"  as={Col}>
                <Form.Label>Ticket price (in TIK)</Form.Label>
                <Form.Control 
                    type="number"
                    step="0.01"
                    placeholder="Ticket price"
                    onChange={setTicketPrice}
                    value={ticketInputFields.price}
                    required
                    min="0"
                />
                <Form.Control.Feedback type="invalid">
                    Please provide a ticket price.
                </Form.Control.Feedback>
                </Form.Group>
            </Row>
            <Row className="mb-3">
                <Form.Group as={Col} controlId="ticketImage">
                    <Form.Label>Ticket image</Form.Label>
                    <Form.Control
                        type="file" 
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
                </div> : <></>}
            </div>
        
    );
}

export default TicketInfo;
