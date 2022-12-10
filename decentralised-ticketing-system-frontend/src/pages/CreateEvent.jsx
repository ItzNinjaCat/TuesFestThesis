import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TicketInfo from '../components/ui/TicketInfo';
import { useState, useNavigate } from 'react';
// import { Web3Storage, getFilesFromPath } from 'web3.storage';
// import { v5 as uuidv5 } from 'uuid';
function CreateEvent() {
    // const navigate = useNavigate();
    const [validated, setValidated] = useState(false);
    const [name = '', setName] = useState();
    const [desc = '', setDesc] = useState();
    const [images = [], setImages] = useState();
    const [ticketTypes = [0], setTicketTypes] = useState();
    const [fileLimitReached = false, setFileLimitReached] = useState();
    const [ticketInputFields, setTicketInputFields] = useState([
        { 
            name: '', 
            price: 0, 
            image: [],
            souvenir: []
        }
    ]);
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
        e.preventDefault();
        if (form.checkValidity() === false) {
            e.stopPropagation();
        }
        else {
            setValidated(true);
            console.log(ticketInputFields);
            const imagesUploadData = await readFiles(images);
           // TODO web3.storage upload
        }
        // navigate("/");
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
            setFileLimitReached(true);
            return;
        } else {
            setImages(e.target.files);
        }
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
            image: "",
            souvenir: ""
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
                // className="w-30"
            >
                <Row className="mb-3">
                    <Form.Group as={Col}  controlId="eventName">
                        <Form.Label>Event name</Form.Label>
                        <Form.Control 
                            type="text"
                            placeholder="Enter event name"
                            onChange={changeName}
                            value={name}
                            maxLength='50'
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
                            maxLength='500'
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
                                index={ticket}
                                ticketTypes={ticketTypes}
                                setTicketTypes={setTicketTypes}
                                
                            />
                        )}
                    <Row>
                        <Button as={Col} md="2" variant="light" onClick={addTicketInfo}>Add ticket</Button>
                        <Button as={Col}  md={{ span: 2, offset: 8 }}  variant="primary" type="submit">
                            Submit
                        </Button>
                    </Row>
            </Form>
            </div>
    );
}

export default CreateEvent;
