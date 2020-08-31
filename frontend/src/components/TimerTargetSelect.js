import React from 'react';
import { Form } from 'react-bootstrap';
import { useEffect } from 'react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const TimerTargetSelect = ({ targets, selectedTimerTargetId, setSelectedTimerTargetId }) => {
    const {loggedIn} = useContext(AuthContext);

    const [options, setOptions] = useState([]);

    // Generate an option for each target
    useEffect(() => {
        if (targets) {
            let optionHTML = targets.map(target => {
                return (
                    <option key={uuidv4()} value={target._id}>{target.title}</option>
                )
            });
            setOptions(optionHTML);
        }
    }, [targets])

    const handleChange = (e) => {
        console.log('Change');
        setSelectedTimerTargetId(e.target.value);
    }

    if (targets) {
        return (
            <Form.Group controlId="target-timer-select">
                {/* <div>Selected: {selectedTimerTargetId}</div>
                <Form.Label>Working Towards:</Form.Label> */}
                <Form.Control as="select" onChange={handleChange} value={selectedTimerTargetId}>
                    {options}
                </Form.Control>
            </Form.Group>
        )
    } else if (loggedIn) {
        return (
            <div>Loading...</div>
        )
    } else{
        return null;
    }

}

export default TimerTargetSelect;