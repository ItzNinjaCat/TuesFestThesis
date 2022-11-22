import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import TicketInfo from '../components/ui/TicketInfo';
import { useState} from 'react';
function CreateEvent() {
    const [name = '', setName] = useState();
    const [desc = '', setDesc] = useState();
    const [images = [], setImages] = useState();
    const [tickets = [0], setTickets] = useState();
    const [ticketInputFields, setTicketInputFields] = useState([
        { 
            name: '', 
            price: 0, 
            imageFile: [],
            souvenirFile: []
        }
    ]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(ticketInputFields);
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
            alert(`Cannot upload more than ${5} images`);
            return;
        }
        setImages(e.target.files);
    }

    const addTicketInfo = () => {
        console.log(ticketInputFields)
        let newArr = [...tickets];
        newArr.push(tickets[tickets.length-1] + 1);
        setTickets(newArr);
        const values = [...ticketInputFields];
        values.push({ 
            name: '', 
            price: 0, 
            imageFile: [],
            souvenirFile: []
        });
        setTicketInputFields(values);
    }


    return (
        <div className="container my-5">
            <h1>Create event</h1>
                <Form 
                onSubmit={handleSubmit}
                className="d-flex flex-column"
                >
                    <Form.Group className="mb-3" controlId="eventName">
                        <Form.Label>Event name</Form.Label>
                        <Form.Control 
                            type="text"
                            placeholder="Enter event name"
                            onChange={changeName}
                            value={name}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="eventDescription">
                        <Form.Label>Event description</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="Enter event description"
                            onChange={changeDesc}
                            value={desc}
                        />
                    </Form.Group>
                    <Form.Group controlId="eventImages" className="mb-6">
                        <Form.Label>Event images</Form.Label>
                        <Form.Control 
                            type="file"
                            multiple 
                            onChange={uploadEventImages}
                            />
                    </Form.Group>
                        {tickets.map(ticket => 
                            <TicketInfo 
                                key={ticket}
                                ticketInputFields={ticketInputFields}
                                setTicketInputFields={setTicketInputFields}
                                index={ticket}
                                tickets={tickets}
                                setTickets={setTickets}
                            />
                        )}
                    <div>
                        <Button variant="light" onClick={addTicketInfo}>Add ticket</Button>
                    </div>
                    <div className='d-flex flex-row-reverse'>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </div>
            </Form>
        </div>
    );
}

export default CreateEvent;
