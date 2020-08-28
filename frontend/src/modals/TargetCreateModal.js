import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import AddIcon from '@material-ui/icons/Add';

import {fetchCall} from '../utils';

function TargetCreateModal({setTargets}) {
    // Form Logic
    const [titleInput, setTitleInput] = useState('');
    const [notesInput, setNotesInput] = useState('');
    const [weeklyTargetTimeInput, setWeeklyTargetTimeInput] = useState(null);  // Should be an integer >= 1

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
            setTargets(targets => {
                let copy = targets.map(target => target);
                copy.push(response.target);
                return copy;
            });
        }else{
            // Todo: Tell the user if an error occurs with something red.
        }
    }

    // Modal Logic
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <AddIcon onClick={handleShow} className='icon'/>

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
                            <Form.Control type="text" defaultValue={titleInput} onChange={(e) => setTitleInput(e.target.value)} />
                        </Form.Group>

                        <Form.Group controlId="formTargetNotes">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control as="textarea" rows="3" defaultValue={notesInput} onChange={(e) => setNotesInput(e.target.value)} />
                        </Form.Group>

                        {/* Perhaps change to text input for better input filtering */}
                        <Form.Group controlId="formWeeklyTargetTime">
                            <Form.Label>Weekly Target Time (hrs)</Form.Label>
                            <Form.Control type="number" defaultValue={weeklyTargetTimeInput} onChange={(e) => setWeeklyTargetTimeInput(e.target.value)} />
                        </Form.Group>

                    </Modal.Body>
                    <Modal.Footer>
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