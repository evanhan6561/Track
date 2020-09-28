import React, { useCallback } from 'react';
import { Form, Col } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import TargetEditModal from '../modals/TargetEditModal';
import TargetCreateModal from '../modals/TargetCreateModal';
import { useEffect, useState } from 'react';
// import ReactTooltip from 'react-tooltip';

const TargetSelect = ({ currentTarget, setCurrentTarget, targets, setTargets }) => {
    let [targetEntries, setTargetEntries] = useState(null);

    // Keep track of the most recently clicked target.
    const selectTarget = useCallback((e) => {
        let targetId = e.target.dataset.targetid;
        
        let chosenTarget = null;
        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            if (target._id === targetId){
                chosenTarget = target;
                break;
            }
        }

        setCurrentTarget(chosenTarget);
    }, [setCurrentTarget, targets]);


    // Generate JSX based on every target. We need to create both the checkboxes and their edit forms
    const generateJSX = useCallback((targets) => {
        // Only generate checkboxes if targets is not null
        if (!targets) {
            return []
        }

        // Construct two parallel arrays: one for the editForms, another for the checkboxes
        let editForms = targets.map(target => {
            let _id = target._id;
            let title = target.title;
            let notes = target.notes;
            let weeklyTargetTime = target.weeklyTargetTime;
            return <TargetEditModal setTargets={setTargets} key={uuidv4()} _id={_id} title={title} notes={notes} weeklyTargetTime={weeklyTargetTime} />
        });

        let checkBoxIndex = 0;
        if (currentTarget){
            // iterate through the checkboxes to find the one that matches. Mark it as checked.
            let currentTargetId = currentTarget._id;
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i];
                if (currentTargetId === target._id){
                    checkBoxIndex = i;
                    break;
                }
            }
        }

        let checkboxes = targets.map((target, index) => {
            let defaultProps = {
                key: uuidv4(),
                type: 'radio',
                label: target.title,
                name: 'targetRadios',
                id: `targetRadios-${index + 1}`,
                onClick: selectTarget,
            }
            if (index === checkBoxIndex) {
                return (
                    <Form.Check
                        {...defaultProps}
                        data-targetid={target._id}

                        defaultChecked = 'true'
                    />
                )
            } else {
                return (
                    <Form.Check
                        {...defaultProps}
                        data-targetid={target._id}
                    />
                )
            }
        });

        // Wrap them together with some styling
        let combined = checkboxes.map((checkbox, index) => {
            const form = editForms[index];

            return (
                <div key={uuidv4()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {checkbox}
                    {form}
                </div>
            )
        })

        return combined;
    }, [selectTarget, setTargets, currentTarget])

    // const checkboxes = generateJSX(targets);

    // Only generate target select list if targets is rerendered
    useEffect(() => {
        setTargetEntries(generateJSX(targets));
    }, [targets, generateJSX]);

    return (
        <Form>
            <fieldset>
                <Form.Group>
                    <Form.Label as="legend" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>Targets:</div>
                        <TargetCreateModal targets={targets} setTargets={setTargets} setCurrentTarget={setCurrentTarget}/>

                    </Form.Label>
                    <Col sm={15}>
                        {targetEntries}
                    </Col>
                </Form.Group>
            </fieldset>
        </Form>

    );
}

export default TargetSelect;