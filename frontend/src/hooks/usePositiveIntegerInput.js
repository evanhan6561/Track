import React, {useState} from 'react';
import { Form, Button } from 'react-bootstrap';

/**
 * Returns a reusable input that makes use of input:text rather than input:number to ensure that users can only enter
 * positive integer values.
 * 
 * Empty inputs will return NaN
 * 
 * @param {Object} settings - An object containing the mandatory data to construct the input HTML
 */
function usePositiveIntegerInput(settings){
    const [intString, setIntString] = useState('');
    
    // Checks if a string is composed entirely of integers or blank
    function isValidIntegerInput(input) {
        if (input === ''){
            return true;
        }

        return /^[1-9]\d*$/.test(input);
    }

    // Make sure only numbers are ever entered
    const handleChange = (e) => {
        if (isValidIntegerInput(e.target.value)) {
            setIntString(e.target.value)
        }
    }

    let inputHTML = (
        // <Form.Group controlId={`integer-input-${settings.label}`}>
        //     <Form.Label>{settings.label}</Form.Label>
        //     <Form.Control type="text" value={intString} onChange={handleChange}/>
        // </Form.Group>
        <Form.Control type="text" value={intString} onChange={handleChange} placeholder={settings.placeholder}/>
    )
    
    // A blank input returns NaN, make sure to account for that
    let integer = Number.parseInt(intString);
    return [integer, inputHTML];
}
 
export default usePositiveIntegerInput;