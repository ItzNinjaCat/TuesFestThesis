import {useContext} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { EVENT_BY_ID_QUERY } from "../utils/subgraphQueries";
import { useQuery } from "@apollo/client";
import { uploadImmutableData } from '../utils/web3.storageEndpoints';
import { Web3Context } from "../components/App";
function EditEvent() {
    const { account, contract } = useContext(Web3Context);

    const { id } = useParams();
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [location, setLocation] = useState('');
    const [images, setImages] = useState(undefined);
    const [cid, setCid] = useState(undefined);
    const [startTime, setStartTime] = useState(new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    }));
    const [endTime, setEndTime] = useState(0);
    const [startDate, setStartDate] = useState(new Date().toJSON().slice(0,10).replace(/-/g,'-'));
    const [endDate, setEndDate] = useState(0);
    const { loading, error, data } = useQuery(EVENT_BY_ID_QUERY, {
        variables: {
            id: String(id)
        }
    });
    useEffect(() => {
        if (!loading) {
            try{
                console.log(data.event.creator.toUpperCase() !== account.toUpperCase());
                if(data.event.creator.toUpperCase() !== account.toUpperCase()){
                    navigate('/');
                }
            }catch(e){
                console.log(e);
                navigate('/');
            }
        }
    }, [loading, data, account]);


    useEffect(() => {
        if (!loading) {
            setName(data.event.name);
            setDesc(data.event.description);
            setLocation(data.event.location);
            setStartTime(new Date(data.event.startTime * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }));
            if (data.event.endTime * 1000 !== 0) {
                setEndTime(new Date(data.event.endTime * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }));
                setEndDate(new Date(data.event.endTime * 1000).toJSON().slice(0, 10).replace(/-/g, '-'));
            }
            setStartDate(new Date(data.event.startTime * 1000).toJSON().slice(0, 10).replace(/-/g, '-'));
        }
    }, [loading, data, id]);

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
            const startTimeSplit = startTime.split(':');
            let startDateUNIX = new Date(`${startDate}T00:00`)
            startDateUNIX.setHours(startTimeSplit[0]);
            startDateUNIX.setMinutes(startTimeSplit[1]);
            startDateUNIX = startDateUNIX.getTime() / 1000;
            let endDateUNIX = 0;
            if (endDate !== 0 && endTime !== 0) {
                const endTimeSplit = endTime.split(':');
                endDateUNIX = new Date(`${endDate}T00:00`)
                endDateUNIX.setHours(endTimeSplit[0]);
                endDateUNIX.setMinutes(endTimeSplit[1]);
                endDateUNIX = endDateUNIX.getTime() / 1000;
            }
            else if (endTime !== 0) {
                const endTimeSplit = endTime.split(':');
                endDateUNIX = new Date(`${startDate}T00:00`)
                endDateUNIX.setHours(endTimeSplit[0]);
                endDateUNIX.setMinutes(endTimeSplit[1]);
                endDateUNIX = endDateUNIX.getTime() / 1000;
            }
            else if (endDate !== 0) {
                endDateUNIX = new Date(`${endDate}T00:00`).getTime() / 1000;
            }
            let imagesCid;
            if (images !== undefined) {
                imagesCid = (await uploadImmutableData(images));
            }
            else {
                imagesCid = cid;
            }
            const tx = await contract.updateEvent(id, name, desc, imagesCid, location, startDateUNIX, endDateUNIX);
            tx.wait.then(() => console.log("Event updated"));

        } 
    }
    const changeStartDate = (e) => {
        setStartDate(e.target.value);
        if(new Date(`${startDate}T00:00`).getTime() > new Date(`${endDate}T00:00`).getTime()) {
            setEndDate(0);
        }
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
    return (
        <div className="mt-5 d-flex flex-column align-items-center">
            <h1>Update event</h1>
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
                            onChange={(e) => setName(e.target.value)}
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
                        />
                        <Form.Text className="text-muted">
                            The first image will be used as a thumbnail
                        </Form.Text>
                    </Form.Group>
                </Row>
                <Form.Group controlId="eventLocation">
                    <Form.Label>Event location</Form.Label>
                    <Form.Control 
                        type="text"
                        placeholder="Enter event location"
                        onChange={(e) => setLocation(e.target.value)}
                        value={location}
                        maxLength='100'
                        required 
                    />
                    <Form.Control.Feedback type="invalid">
                        Please provide an event location.
                    </Form.Control.Feedback>
                </Form.Group>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="eventStartDate">
                        <Form.Label>Event start date</Form.Label>
                        <Form.Control
                            type='date'
                            required
                            min={new Date().toJSON().slice(0,10).replace(/-/g,'-')}
                            value={startDate}
                            onChange={changeStartDate}
                        />
                    </Form.Group>
                    <Form.Group as={Col} controlId="eventEndDate">
                        <Form.Label>Event end date</Form.Label>
                        <Form.Control
                            type='date'
                            value={endDate}
                            min={startDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            Only required for multi-day events
                        </Form.Text>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="eventStartTime">
                        <Form.Label>Event starting time</Form.Label>
                        <Form.Control
                            type='time'
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group as={Col} controlId="eventEndTime">
                        <Form.Label>Event end time</Form.Label>
                        <Form.Control
                            type='time'
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            Only required if you want your event to have a set end hour
                        </Form.Text>
                    </Form.Group>
                </Row>
                    <Form.Group as={Col} controlId="eventDescription">
                        <Form.Label>Event description</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="Enter event description"
                            onChange={(e) => setDesc(e.target.value)}
                            value={desc}
                            required 
                            maxLength='200'
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide an event description.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <div className="d-flex justify-content-between">
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </div>
            </Form>
        </div>
    );
}
    
export default EditEvent;