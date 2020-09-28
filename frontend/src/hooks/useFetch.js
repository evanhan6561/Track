import { useState, useEffect } from "react";

// Reuseable fetch structure from Ben Awad's Youtube
// Abort Controller Info: https://dev.to/pallymore/clean-up-async-requests-in-useeffect-hooks-90h
export const useFetch = (url, extraOptions) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        // Default options can't be initialized in method definition b/c each call
        // triggers infinite rerenders.
        let defaultOptions = {
            credentials: 'include',
            signal: signal
        };

        let options = Object.assign(defaultOptions, extraOptions);

        const callAPI = async () => {
            try {
                const response = await fetch(url, options);
                const responseJSON = await response.json();
                setData(responseJSON);
                setLoading(false);
            } catch (error) {
                // Aborting throws an error. We can can ignore the console log with the below code if desired.
                // if (!controller.signal.aborted){
                //     console.log(error);
                // }
                console.log(error);
            }
        }

        callAPI(url);

        // Clean up function
        return () => {
            console.log('Aborting!');
            controller.abort();
        }
    }, [url, extraOptions]);
    // url, options, controller

    return { data, loading };
}

export default useFetch;