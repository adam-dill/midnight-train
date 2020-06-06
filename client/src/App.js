import React from 'react';
import last from 'lodash-es/last';
import Suncalc from 'suncalc';
import IniniteScroll from 'react-infinite-scroll-component';
import moment from 'moment';

// TODO: make values set from the POST.
const LAT  = 43.038902;
const LONG = -87.906471;
const REQUEST_LEN = 50;

const UPDATE_DELAY = 1;
const TOLERANCE = 5;

class App extends React.Component {
    currentRequest=0;
    totalRecords=0;
    constructor(props) {
        super(props);
        this.state = {
            entries: [],
            hasMore: true,
            status: {},
            temperatureType: 'c'
        }
        this.updateStatus = this.updateStatus.bind(this);
        this.fetchMoreData = this.fetchMoreData.bind(this);
        this.handleTemperatureClick = this.handleTemperatureClick.bind(this);
    }

    componentDidMount() {
        fetch('http://www.midnighttrain.adamdill.com/entries/count')
            .then(response => response.json())
            .then(result => {
                const {data} = result;
                this.totalRecords = parseInt(data);
                this.fetchMoreData();
            });
        this.updateStatus();
        setInterval(this.updateStatus, UPDATE_DELAY*(60*1000));
    }

    updateStatus() {
        fetch('http://www.midnighttrain.adamdill.com/status/')
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

    fetchMoreData() {
        const offset = REQUEST_LEN * this.currentRequest;
        fetch(`http://www.midnighttrain.adamdill.com/entries/${offset}/${REQUEST_LEN}`)
            .then(response => response.json())
            .then(result => {
                this.currentRequest++;
                const entries = this.normalizeEntries(result.data.map(value => this.processEntry(value)));
                const hasMore = (offset + REQUEST_LEN) < this.totalRecords;
                this.setState(previousState => {
                    return { 
                        entries: previousState.entries.concat(entries),
                        hasMore
                    };
                });
            });
    }

    processEntry(entry) {
        const date = new Date(entry.time.replace(/-/g, '/'));
        const day = date.toDateString();
        const time = this.formatTime(date);
        return {
            date,
            day,
            time,
            duration: ((entry.duration/1000)/60)
        }
    }

    formatTime(date) {
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }

    normalizeEntries(entries) {
        // if the entry is less than 3 minutes from the previous entry + previous duration...
        // combine them.
        let returnValue = [];
        entries.forEach(entry => {
            const lastEntry = last(returnValue);
            if (lastEntry) {
                const inTolerance = moment(entry.date)
                    .add(parseFloat(entry.duration)*60, 's')
                    .add(TOLERANCE, 'm')
                    .isAfter(moment(lastEntry.date));
                if (inTolerance) {
                    const newDuration = (moment(lastEntry.date)
                        .add(parseFloat(lastEntry.duration)*60, 's')
                        .diff(moment(entry.date)) / 1000 / 60).toFixed(2);
                    returnValue.pop();
                    entry.duration = newDuration;
                }
            }
            returnValue.push(entry);
        })
        return returnValue;
    }

    orderTimes(times) {
        const list = Object.keys(times).map(value => {
            const time = this.formatTime(times[value]);
            return {
                date: times[value],
                time,
                key: value,
            };
        }).sort((a, b) => (a.date > b.date) ? 1 : -1);
        return list;
    }

    splitDays(entryList) {
        let returnValue = [];
        entryList.forEach(element => {
            let lastElement = last(returnValue);
            if (lastElement === undefined || element.day !== lastElement.day) {
                lastElement = {
                    day: element.day,
                    entries: [],
                    suncalc: this.orderTimes(Suncalc.getTimes(element.date, LAT, LONG))
                };
                returnValue.push(lastElement);
            }
            const filtered = lastElement.suncalc.filter(value => {
                return element.date > value.date
            });
            const lastOne = last(filtered);
            let timeOfDay = last(lastElement.suncalc).key;
            if (lastOne) {
                timeOfDay = lastOne.key;
            }
            lastElement.entries.push({
                time: element.time,
                duration: element.duration,
                timeOfDay,
            });
        });
        return returnValue;
    }
    
    renderDay(dayObject, index) {
        const entries = dayObject.entries.map((entry, index) => this.renderEntry(entry, index));
        return(
            <li key={index} className="card border-dark mb-3">
                <div className="card-header">{dayObject.day}</div>
                <div className="card-body text-dark">
                    <ul className="list-group">{entries}</ul>
                </div>
            </li>
        );
    }

    renderEntry(entry, index) {
        const format = value => (value < 10) ? `0${value}` : `${value}`;
        const minutes = Math.floor(entry.duration);
        const seconds = Math.floor(((entry.duration - minutes) * 1000) / 60);
        const display = (minutes !== 0)
            ? `${minutes} min ${format(seconds)} sec`
            : `${format(seconds)} sec`;
        return (
            <li key={index} className={`list-group-item d-flex justify-content-between ${entry.timeOfDay}`}>
                <div>{entry.time}</div>
                <small> {display}</small>
            </li>
        );
    }

    renderLoader() {
        return (
            <div className="d-flex justify-content-center loading-container">
                <div className="spinner-grow text-info text-center mx-4" role="status"></div>
                <div className="spinner-grow text-info text-center mx-4" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <div className="spinner-grow text-info text-center mx-4" role="status"></div>
            </div>   
        )
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
        
        return moment(lastTime).add(UPDATE_DELAY, 'minute')
                .isAfter(moment(currentTime));
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
        const dayData = this.splitDays(this.state.entries);
        const days = dayData.map((day, index) => {
            return this.renderDay(day, index);
        });
        
        return (
            <>
                <header className="container d-flex justify-content-between">
                    <h1 className="d-inline-block">Midnight Train</h1>
                    <div className="align-self-center text-right">{this.renderStatus()}</div>
                </header>
                <main className="container">
                    <IniniteScroll dataLength={days.length}
                        next={this.fetchMoreData}
                        hasMore={this.state.hasMore}
                        loader={this.renderLoader()}
                        endMessage={
                            <p className="text-center">
                                <b>Yay! You have seen it all</b>
                            </p>
                        }>
                        <ul className="list-group">{days}</ul>
                    </IniniteScroll>
                </main>
            </>
        );
    }
}
 
export default App;