import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import {fetchCall} from '../utils'; 
import { useContext } from 'react';
import {AuthContext} from '../contexts/AuthContext';


function LoginModal() {
    const {setLoggedIn} = useContext(AuthContext);

    // Form Logic
    const [username, setUsername] = useState('test');       // To-Do: Change these default values to ''
    const [password, setPassword] = useState('password');
    const [success, setSuccess] = useState(null);


    // API Response message
    let feedback = null;
    if (success === true){
        feedback = <div style={{color: 'green'}}>Login Successful</div>
    }else if (success === false){
        feedback = <div style={{color: 'red'}}>Login Failed. Likely invalid username or password.</div>
    }

    // Modal Logic
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setSuccess(null);
        setShow(false)
    };
    const handleShow = () => setShow(true);

    const handleLogin = async () => {
        let url = process.env.REACT_APP_API_HOST + '/api/login';
        let body = JSON.stringify({
            username: username,
            password: password
        });
        let options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: body,
        }
        let json = await fetchCall(url, options);
        if (json.loggedIn){
            setSuccess(true);
            setLoggedIn(true);
        }else{
            setSuccess(false);
        }
    }

    return (
        <>  
            <Button variant="primary" onClick={handleShow}>
                Login
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                keyboard={false}
                animation={false}   // Must set animation to false. Otherwise, react-bootstrap throws a deprecation warning.
            >
                <Modal.Header closeButton>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId='login-form-username'>
                            <Form.Label>Username</Form.Label>
                            <Form.Control type='text' value={username} onChange={(e) => { setUsername(e.target.value) }}/>
                        </Form.Group>
                        <Form.Group controlId='login-form-password'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type='text' value={password} onChange={(e) => { setPassword(e.target.value) }}/>
                        </Form.Group>

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {feedback}
                    <Button variant="primary" onClick={handleLogin}>Login</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default LoginModal;