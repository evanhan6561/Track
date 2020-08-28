import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import {fetchCall} from '../utils'; 
import { useContext } from 'react';
import {AuthContext} from '../contexts/AuthContext';


function LoginModal() {
    const {setLoggedIn} = useContext(AuthContext);

    // Form Logic
    const [username, setUsername] = useState('test');       // To-Do: Change these default values to ''
    const [password, setPassword] = useState('password');

    // Modal Logic
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
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
            setLoggedIn(true);
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
                    <form>
                        <div>
                            <label htmlFor="login-form-username">Username:</label><br/>
                            <input type='text' value={username} onChange={(e) => { setUsername(e.target.value) }} id='login-form-username' />
                        </div>
                        <div>
                            <label htmlFor="login-form-password">Password:</label><br/>
                            <input type='text' value={password} onChange={(e) => { setPassword(e.target.value) }} id='"login-form-password"'/>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleLogin}>Login</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default LoginModal;