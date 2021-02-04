import React from 'react';
import moment from 'moment';
import {UPDATE_DELAY} from './App';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: {},
            temperatureType: 'c'
        }
        this.updateStatus = this.updateStatus.bind(this);
        this.handleTemperatureClick = this.handleTemperatureClick.bind(this);
    }

    componentDidMount() {
        this.updateStatus();
        setInterval(this.updateStatus, UPDATE_DELAY*(60*1000));
    }

    updateStatus() {
        fetch('http://midnighttrain.adamdill.com/status/')
            .then(response => response.json())
            .then(result => {
                const {data} = result;
                if (data) {
                    const newStatus = {};
                    data.forEach(item => newStatus[item.key] = item.value);
                    this.setState({status: newStatus});
                }
            });
    }

    celsiusToFahrenheit(c) {
        return (c * 9/5) + 32;
    }

    formatDegree(c) {
        if (!c) return null;

        const modifier = this.state.temperatureType === 'f'
            ? this.celsiusToFahrenheit
            : () => c;
        return `${Math.round(modifier(c))}&deg;${this.state.temperatureType.toUpperCase()}`;
    }

    isOnline(lastTime, currentTime) {
        if (!lastTime || !currentTime) return false;
        
        const last = moment(lastTime).add(UPDATE_DELAY, 'minute').format();
        const current = moment(currentTime).subtract(5, 's').format();
        return moment(lastTime).add(UPDATE_DELAY, 'minute')
                .isAfter(moment(currentTime).subtract(5, 's'));
    }
    
    handleTemperatureClick() {
        this.setState((prevState) => {
            return {temperatureType: prevState.temperatureType === 'f' ? 'c' : 'f'};
        })
    }

    renderStatus() {
        const {temperature, lastUpdate, CURRENT_TIMESTAMP} = this.state.status;
        const online = this.isOnline(lastUpdate, CURRENT_TIMESTAMP);
        const onlineText = online ? 'online' : 'offline';
        const onlineStyle = online ? 'badge-success' : 'badge-danger';
        const temperatureDisplay = (online) ? this.formatDegree(temperature) : null;

        return (
            <>
                <span className="small pointer"
                    dangerouslySetInnerHTML={{__html:temperatureDisplay}} 
                    onClick={this.handleTemperatureClick} />
                <span className={`badge ${onlineStyle} ml-2 p-2 text-uppercase`}>{onlineText}</span>
            </>
        )
    }

    render() { 
        return (
            <header>
                <div className="container d-flex justify-content-between">
                    <h1 className="d-inline-block">{this.props.title}</h1>
                    <div className="align-self-center text-right">{this.renderStatus()}</div>
                </div>
            </header>
        );
    }
}
 
export default Header;