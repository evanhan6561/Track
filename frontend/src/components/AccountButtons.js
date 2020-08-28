import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import LoginModal from '../modals/LoginModal';
import RegisterModal from '../modals/RegisterModal';
import { fetchCall } from '../utils';
import { Button } from 'react-bootstrap';

const AccountButtons = () => {
    const { loggedIn, setLoggedIn } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            // API Call to logout
            let url = process.env.REACT_APP_API_HOST + "/api/logout";
            let options = { method: 'POST' };
            let respJSON = await fetchCall(url, options);

            // Set state to logged out if API call returns successful
            if (respJSON.success) {
                setLoggedIn(false);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            {loggedIn ?
                <Button variant='secondary' onClick={handleLogout}>Logout</Button>
                :
                (<><LoginModal /><RegisterModal /></>)
            }
        </div>
    );
}

export default AccountButtons;