import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import {fetchCall} from '../utils'; 

function RegisterModal() {
    // Form Logic
    const [username, setUsername] = useState('');      
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(null);

    let feedback = null;
    if (success === true){
        feedback = <div style={{color: 'green'}}>Registration Successful</div>
    }else if (success === false){
        feedback = <div style={{color: 'red'}}>Registration Failed. Likely username is already taken.</div>
    }

    // Modal Logic
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setSuccess(null);
        setShow(false);
    };
    const handleShow = () => {setShow(true)};


    const handleRegistration = async () => {
        let url = process.env.REACT_APP_API_HOST + '/api/register';
        let data = JSON.stringify({
            username: username,
            password: password
        });
        let options = {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: data
        }
        let json = await fetchCall(url, options);
        // To-Do: Integrate loading into callFetch
        if (json.success){
            console.log('Successfully Registered', json);
            setSuccess(true);
        }else{
            setSuccess(false);
        }
    }

    return (
        <>  
            <Button variant="secondary" onClick={handleShow}>
                Register
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                keyboard={false}
                animation={false}   // Must set animation to false. Otherwise, react-bootstrap throws a deprecation warning.
            >
                <Modal.Header closeButton>
                    <Modal.Title>Register</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div>
                            <label htmlFor="register-form-username">Username:</label><br/>
                            <input type='text' value={username} onChange={(e) => { setUsername(e.target.value) }} id='register-form-username' />
                        </div>
                        <div>
                            <label htmlFor="register-form-password">Password:</label><br/>
                            <input type='text' value={password} onChange={(e) => { setPassword(e.target.value) }} id='register-form-password'/>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    {feedback}
                    <Button variant="primary" onClick={handleRegistration}>Register</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default RegisterModal;