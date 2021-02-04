const express = require('express');
const bodyParser = require('body-parser');
const get = require('lodash/get');
const {query, queryStatus, queryCount, setLastUpdateTime} = require('./db');
const app = express();
const port = 3000;

const fs = require('fs');

app.use((req, res, next) => {
    res.append('Cache-Control', 'no-cache');
    next();
});

app.get('/entries/count', (req, res) => {
    queryCount(res);
});

app.get('/entries', (req, res) => {
    const offset = '0';
    const limit = `${Number.MAX_SAFE_INTEGER}`;
    query(`SELECT * FROM entries ORDER BY time DESC LIMIT ${offset}, ${limit};`, res);
});

app.get('/entries/:offset', (req, res) => {
    const offset = get(req.params, 'offset', '0');
    const limit = `${Number.MAX_SAFE_INTEGER}`;
    query(`SELECT * FROM entries ORDER BY time DESC LIMIT ${offset}, ${limit};`, res);
});

app.get('/entries/:offset/:limit', (req, res) => {
    const offset = get(req.params, 'offset', '0');
    const limit = get(req.params, 'limit', `${Number.MAX_SAFE_INTEGER}`);
    query(`SELECT * FROM entries ORDER BY time DESC LIMIT ${offset}, ${limit};`, res);
});

var jsonParser = bodyParser.json({ type: 'application/json' } );

app.post('/entries/add', jsonParser, (req, res) => {
    query(`INSERT INTO entries (time, duration) VALUES (${req.body.time}, ${req.body.duration})`, res);
});

app.get('/status', (req, res) => {
    queryStatus(res);
});

app.post('/status/temperature', jsonParser, (req, res) => {
    fs.appendFileSync('log.txt', `req.body: ${JSON.stringify(req.body)}\n`);
    setLastUpdateTime();
    query(`UPDATE \`status\` SET \`value\`=${JSON.stringify(req.body)} WHERE \`key\`='temperature'`, res);
});

app.post('/status/dht', jsonParser, (req, res) => {
    query(`UPDATE \`status\` SET \`value\`='${JSON.stringify(req.body)}' WHERE \`key\`='dht'`, res);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});