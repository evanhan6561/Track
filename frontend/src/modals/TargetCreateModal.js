import React, { useState, useContext } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import AddIcon from '@material-ui/icons/Add';

import {fetchCall} from '../utils';
import {AuthContext} from '../contexts/AuthContext';

function TargetCreateModal({targets, setTargets, setCurrentTarget}) {
    const { loggedIn } = useContext(AuthContext);
    

    // Form Logic
    const [titleInput, setTitleInput] = useState('');
    const [notesInput, setNotesInput] = useState('');
    const [weeklyTargetTimeInput, setWeeklyTargetTimeInput] = useState(null);  // Should be an integer >= 1
    const [success, setSuccess] = useState(null);


    // API Response message
    let feedback = null;
    if (success === true){
        feedback = <div style={{color: 'green'}}>Target Created Successfully</div>
    }else if (success === false){
        feedback = <div style={{color: 'red'}}>Failed to create target. Title and Weekly Target Time are required.</div>
    }

    const handleCreate = async (e) => {
        e.preventDefault();


        let url = process.env.REACT_APP_API_HOST + '/api/targets';
        let data = JSON.stringify({
            title: titleInput,
            notes: notesInput,
            weeklyTargetTime: weeklyTargetTimeInput
        });
        let options = {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: data
        }
        let response = await fetchCall(url, options);
        console.log('Create Target response :>> ', response);
        if (response.success) {
            // push the returned target onto a copy to trigger rerender
            setSuccess(true);
            
            setTargets(targets => {
                let copy = targets.map(target => target);
                copy.push(response.target);

                // If the user has 0 targets, setCurrentTarget to the one entry
                if (targets.length === 0){
                    setCurrentTarget(copy[0]);
                }
                return copy;
            });
            
        }else{
            // Todo: Tell the user if an error occurs with something red.
            setSuccess(false);
        }
    }

    // Modal Logic
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setSuccess(false);
        setShow(false)
    };
    const handleShow = () => {
        if (loggedIn){  
            setShow(true)
        }
        else{
            console.log('bruh :>>');
            alert('Please Login First');
        }
    };

    return (
        <>
            <AddIcon data-tip='Add Target' data-place='right' onClick={handleShow} className='icon'/>

            <Modal
                show={show}
                onHide={handleClose}
                keyboard={false}
                animation={false}   // Must set animation to false. Otherwise, react-bootstrap throws a deprecation warning.
            >
                <Modal.Header closeButton>
                    <Modal.Title>Create Target</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreate}>
                    <Modal.Body>

                        <Form.Group controlId="formTargetTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control placeholder='Name of Target' required type="text" defaultValue={titleInput} onChange={(e) => setTitleInput(e.target.value)} />
                            <Form.Text className='text-muted'>*required</Form.Text>
                        </Form.Group>

                        <Form.Group controlId="formTargetNotes">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control placeholder='Additional text about your target' as="textarea" rows="3" defaultValue={notesInput} onChange={(e) => setNotesInput(e.target.value)} />
                        </Form.Group>

                        {/* Perhaps change to text input for better input filtering */}
                        <Form.Group controlId="formWeeklyTargetTime">
                            <Form.Label>Weekly Target Time (hrs)</Form.Label>
                            <Form.Control placeholder='i.e. 3' required type="number" defaultValue={weeklyTargetTimeInput} onChange={(e) => setWeeklyTargetTimeInput(e.target.value)} />
                            <Form.Text className='text-muted'>*required. Must be &ge; 0</Form.Text>
                        </Form.Group>

                    </Modal.Body>
                    <Modal.Footer>
                        {feedback}
                        <Button variant="primary" type="submit">
                            Create
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default TargetCreateModal;