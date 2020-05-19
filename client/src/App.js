import React from 'react';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            entries: []
        }
    }

    componentDidMount() {
        fetch('http://www.midnighttrain.adamdill.com/entries')
            .then(response => response.json())
            .then(result => {
                this.setState({entries: result.data});
            });
    }

    render() {
        const entries = this.state.entries.map((value, index) => {
            return (
                <li key={index} className="list-group-item d-flex justify-content-between">
                    <div>{value.time}</div>
                    <small>{((value.duration/1000)/60).toFixed(2)}</small>
                </li>
            );
        })
        return (
            <>
                <header className="container">
                    <h1>Midnight Train</h1>
                </header>
                <main className="container">
                    <ul className="list-group">{entries}</ul>
                </main>
            </>
        );
    }
}
 
export default App;