import React, { useRef, useState } from 'react';
import { Overlay, Button, Tooltip } from 'react-bootstrap';


const OverlayTriggerExample = () => {

    const [show, setShow] = useState(false);
    const target = useRef(null);

    return (
        <>
            {/* <Button variant="danger" ref={target} onClick={() => setShow(!show)} onMouseEnter={() => setShow(true)} onMouseOut={() => setShow(false)}>
                Click me to see
            </Button>
            <Overlay target={target.current} show={show} placement="right" transition={false} onMouseEnter={() => console.log('entered thing')}>
                {({ placement, arrowProps, show: _show, popper, props }) => (
                    <div
                        {...props}
                        style={{
                            backgroundColor: 'rgba(255, 100, 100, 0.85)',
                            padding: '2px 10px',
                            color: 'white',
                            borderRadius: 3,
                            ...props.style,
                        }}
                    >
                        Bruh
                    </div>
                )}

            </Overlay> */}

            <Button ref={target} onClick={() => setShow(!show)}>
                Click me!
            </Button>
            <Overlay target={target.current} show={show} placement="right">
                {(props) => (
                    <Tooltip id="overlay-example" {...props}>
                        My Tooltip
                    </Tooltip>
                )}
            </Overlay>
        </>
    );
}

export default OverlayTriggerExample;