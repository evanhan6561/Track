import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { fetchCall } from '../utils';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import ReactTooltip from 'react-tooltip';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

const footerStyling = {
    display: 'flex',
    justifyContent: 'space-between'
}

function TargetEditModal({setTargets, _id, title, notes, weeklyTargetTime }) {
    // State logic
    const [titleInput, setTitleInput] = useState(title);
    const [notesInput, setNotesInput] = useState(notes);
    const [weeklyTargetTimeInput, setWeeklyTargetTimeInput] = useState(weeklyTargetTime);

    const [success, setSuccess] = useState(null);


    // API Response message
    let feedback = null;
    if (success === true){
        feedback = <div style={{color: 'green'}}>Target Successfully altered.</div>
    }else if (success === false){
        feedback = <div style={{color: 'red'}}>Failed to alter Target.</div>
    }

    const handleEdits = async (e) => {
        e.preventDefault();

        let url = process.env.REACT_APP_API_HOST + '/api/targets/' + _id;
        let data = JSON.stringify({
            title: titleInput,
            notes: notesInput,
            weeklyTargetTime: weeklyTargetTimeInput
        });
        let options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: data
        }
        let response = await fetchCall(url, options);
        console.log('Edit Target response :>> ', response);

        // Update local state. Create a copy to trigger rerender. Replace the edited target.
        if (response.success) {
            setSuccess(true);
            setTargets(targets => {
                let copy = targets.map( target => {
                    if (target._id === _id){
                        return response.target;
                    }else{
                        return target;
                    }
                })
                return copy;
            });
        }else{
            setSuccess(false);
        }
    }

    const handleDelete = async () => {
        let url = process.env.REACT_APP_API_HOST + '/api/targets/' + _id;
        let options = {
            method: 'DELETE'
        }
        let response = await fetchCall(url, options);
        console.log('Delete Target response :>> ', response);

        // Filter out the deleted target locally.
        if (response.success){
            setSuccess(true);
            setTargets(targets => targets.filter(target => target._id !== _id));
        }else{
            setSuccess(false);
        }
    }

    // Modal Logic
    const [show, setShow] = useState(false);

    // Reset the values to the original props after closing
    const handleClose = () => {
        setTitleInput(title);
        setNotesInput(notes);
        setWeeklyTargetTimeInput(weeklyTargetTime);
        setShow(false);
    };
    const handleShow = () => setShow(true);

    return (
        <>
            <ReactTooltip/>
            <EditOutlinedIcon className='icon' data-tip='Edit Target' data-place='right' onClick={handleShow} fontSize='small'/>

            <Modal
                show={show}
                onHide={handleClose}
                keyboard={false}
                animation={false}   // Must set animation to false. Otherwise, react-bootstrap throws a deprecation warning.
            >
                <Modal.Header closeButton>
                    <Modal.Title>Target View</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEdits}>
                    <Modal.Body>

                        <Form.Group controlId="formTargetTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" defaultValue={titleInput} onChange={(e) => setTitleInput(e.target.value)} />
                            <Form.Text className='text-muted'>*required</Form.Text>
                        </Form.Group>

                        <Form.Group controlId="formTargetNotes">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control as="textarea" rows="3" defaultValue={notesInput} onChange={(e) => setNotesInput(e.target.value)} />
                        </Form.Group>

                        {/* Perhaps change to text input for better input filtering */}
                        <Form.Group controlId="formWeeklyTargetTime">
                            <Form.Label>Weekly Target Time (hrs)</Form.Label>
                            <Form.Control type="number" defaultValue={weeklyTargetTimeInput} onChange={(e) => setWeeklyTargetTimeInput(e.target.value)} />
                            <Form.Text className='text-muted'>*required. Must be &ge; 0</Form.Text>
                        </Form.Group>

                    </Modal.Body>
                    <Modal.Footer style={footerStyling}>
                        <ReactTooltip/>
                        <Button variant='danger' data-tip='Delete Target Forever' data-place='bottom' onClick={handleDelete}>
                            <DeleteForeverIcon  />
                        </Button>

                        {feedback}

                        <Button variant="primary" type="submit">
                            Save Changes
                        </Button>
                    </Modal.Footer>

                </Form>

            </Modal>
        </>
    );
}

export default TargetEditModal;