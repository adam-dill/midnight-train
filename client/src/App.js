import React from 'react';
import last from 'lodash-es/last';
import Suncalc from 'suncalc';
import moment from 'moment';
import Header from './Header';

// TODO: make values set from the POST.
const LAT  = 43.038902;
const LONG = -87.906471;
const REQUEST_LEN = 50;

export const UPDATE_DELAY = 1;

class App extends React.Component {
    currentRequest=0;
    totalRecords=0;
    constructor(props) {
        super(props);
        this.state = {
            entries: [],
            hasMore: true
        }
        
        this.fetchMoreData = this.fetchMoreData.bind(this);
    }

    componentDidMount() {
        fetch('http://midnighttrain.adamdill.com/entries/count')
            .then(response => response.json())
            .then(result => {
                const {data} = result;
                this.totalRecords = parseInt(data);
                this.fetchMoreData();
            });
        
    }

    fetchMoreData() {
        const offset = REQUEST_LEN * this.currentRequest;
        fetch(`http://midnighttrain.adamdill.com/entries/${offset}/${REQUEST_LEN}`)
            .then(response => response.json())
            .then(result => {
                this.currentRequest++;
                const entries = result.data.map(value => this.processEntry(value));
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
        const date = moment(entry.time).utcOffset(4);
        const day = date.format("ddd, MMMM Do");
        const time = date.format("h:mm a");
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
        const seconds = Math.floor(60 * (entry.duration - minutes));
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

    render() {
        const dayData = this.splitDays(this.state.entries);
        const days = dayData.map((day, index) => {
            return this.renderDay(day, index);
        });
        
        return (
            <>
                <Header title="Midnight Train" />
                <main className="container">
                    <ul className="list-group mt-5 pt-5">{days}</ul>
                    <div className="d-flex justify-content-center mb-5">
                        <button className="btn btn-primary" onClick={this.fetchMoreData}>Load More</button>
                    </div>
                </main>
            </>
        );
    }
}
 
export default App;