import React from 'react';
import './css/App.css';
import Layout from './components/Layout';

async function test(){
    let data = JSON.stringify({num: (new Date()).getTime()});
    let response = await fetch('/api/test', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: data
    })

    let responseJSON = await response.json();
    console.log(responseJSON);
}

function App() {
    test();
    return (
        <div className="App">
            <Layout />
        </div>
    );
}

export default App;
