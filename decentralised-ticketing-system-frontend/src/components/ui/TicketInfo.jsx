import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
function TicketInfo({
    ticketInputFields,
    setTicketInputFields,
    index,
    tickets,
    setTickets
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
        const ticketValues = [...tickets];
        values.splice(index, 1);
        ticketValues.splice(index, 1);
        setTicketInputFields(values);
        setTickets(ticketValues);
    }

    return (
        <>
            <Form.Group controlId="ticketName" className="mb-3">
                <Form.Label>Ticket name</Form.Label>
                <Form.Control 
                    type="text"
                    placeholder="Ticket name"
                    onChange={setTicketName}
                    value={ticketInputFields.name}
                />
            </Form.Group>
            <Form.Group controlId="ticketPrice" className="mb-3">
                <Form.Label>Ticket price (in TIK)</Form.Label>
                <Form.Control 
                    type="number"
                    step="0.01"
                    placeholder="Ticket price"
                    onChange={setTicketPrice}
                    value={ticketInputFields.price}
                />
            </Form.Group>
            <Form.Group controlId="ticketImage" className="mb-3">
                <Form.Label>Ticket image</Form.Label>
                <Form.Control
                    type="file" 
                    onChange={setTicketImage}
                />
            </Form.Group>
            <Form.Group controlId="souvenirImage" className={index !== 0 ? "mb-3" : "mb-5"}>
                <Form.Label>Souvenir image</Form.Label>
                <Form.Control
                    type="file" 
                    onChange={setTicketSouvenir}
                />
            </Form.Group>  
            {index !== 0 ? <div>
                <Button variant="light" className="mb-5" onClick={removeTicketInfo}>Remove ticket</Button>
            </div> : <></> }
        </>
    );
}

export default TicketInfo;
