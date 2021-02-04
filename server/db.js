var mysql = require('mysql');
const dbconfig = require('./dbconfig');
const get = require('lodash/get');
const fs = require('fs');

const query = (sql, res) => {
    var connection = mysql.createConnection(dbconfig);
    connection.connect()

    connection.query(sql, function (err, rows, fields) {
        if (err) {
            fs.appendFileSync('log.txt', `ERROR: ${err}\n`);
            throw err
        }
        const data = {
            statusCode: 200,
            data: rows
        }
        res.json(data);
    });

    connection.end()
}

const queryStatus = (res) => {
    var connection = mysql.createConnection(dbconfig);
    connection.connect()

    connection.query('SELECT * FROM `status`;', function (err, results, fields) {
        if (err) {
            fs.appendFileSync('log.txt', `ERROR: ${err}\n`);
            throw err
        }
        const date = new Date();
        const dateResponse = {
            key: "CURRENT_TIMESTAMP",
            value: date.toString()
        }
        results.push(dateResponse);
        const data = {
            statusCode: 200,
            data: results
        }
        res.json(data);
    });

    connection.end()
}

const queryCount = (res) => {
    var connection = mysql.createConnection(dbconfig);
    connection.connect()

    connection.query(`SELECT COUNT(*) FROM entries`, function (err, rows, fields) {
        if (err) {
            fs.appendFileSync('log.txt', `ERROR: ${err}\n`);
            throw err
        }
        const data = {
            statusCode: 200,
            data: get(rows, '0.COUNT(*)', 0)
        }
        res.json(data);
    });

    connection.end()
}

const setLastUpdateTime = () => {
    var connection = mysql.createConnection(dbconfig);
    connection.connect();
    const date = new Date();
    connection.query(`UPDATE \`status\` SET \`value\`="${date.toString()}" WHERE \`key\`='lastUpdate'`, function (err, rows, fields) {
        if (err) {
            fs.appendFileSync('log.txt', `ERROR: ${err}\n`);
            throw err
        }
    });
    connection.end()
}

module.exports = {
    query,
    queryStatus,
    queryCount,
    setLastUpdateTime
};
