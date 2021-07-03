const express = require('express');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const nocache = require('nocache');
const get = require('lodash/get');
const {query, queryStatus, queryCount, setLastUpdateTime, queryToday} = require('./db');
const app = express();
const port = 3000;


app.use(nocache());
fs.ensureFileSync('log.txt');

app.get('/entries/count', (req, res) => {
    queryCount(res);
});

const getLimit = (req) => {
    return {
        offset: get(req.params, 'offset', '0'),
        limit: get(req.params, 'limit', `${Number.MAX_SAFE_INTEGER}`)
    }
}

app.get('/entries', (req, res) => {
    const {offset, limit} = getLimit(req);
    query(`SELECT * FROM entries ORDER BY time DESC LIMIT ${offset}, ${limit};`, res);
});

app.get('/entries/today', (req, res) => {
    queryToday(`SELECT * from entries where time >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 12 HOUR);`, res);
})

app.get('/entries/:offset', (req, res) => {
    const {offset, limit} = getLimit(req);
    query(`SELECT * FROM entries ORDER BY time DESC LIMIT ${offset}, ${limit};`, res);
});

app.get('/entries/:offset/:limit', (req, res) => {
    const {offset, limit} = getLimit(req);
    query(`SELECT * FROM entries ORDER BY time DESC LIMIT ${offset}, ${limit};`, res);
});

var jsonParser = bodyParser.json({ type: 'application/json' } );

app.post('/entries/add', jsonParser, (req, res) => {
    query(`INSERT INTO entries (time, duration) VALUES ('${req.body.time}', '${req.body.duration}')`, res);
});

app.get('/status', (req, res) => {
    queryStatus(res);
});

app.post('/status/temperature', jsonParser, (req, res) => {
    setLastUpdateTime();
    query(`UPDATE \`status\` SET \`value\`=${req.body.temperature} WHERE \`key\`='temperature'`, res);
});

app.post('/status/dht', jsonParser, (req, res) => {
    const date = new Date();
    req.body.timestamp = date.toString();
    query(`UPDATE \`status\` SET \`value\`='${JSON.stringify(req.body)}' WHERE \`key\`='dht'`, res);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});