const express = require('express');
const cors = require('cors');
const { Pool } = require('pg')

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'password',
  port: 5432,
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

app.post('/signup', (req, res) => {
    console.log('req post', req.body);
    pool.connect((err, client, done) => {
        if (err) throw err
        client.query('INSERT INTO users(uid, players, colors, userimg) VALUES ($1, $2, $3, $4)', [req.body.uid, JSON.stringify(req.body.players), JSON.stringify(req.body.colors), req.body.userImg], (err, res) => {
            done();
            if (err) {
                console.log(err.stack);
            } else {
                console.log(res.rows);
            }
        });
    });
    res.send('Sign Up Complete.');
});
////////////

app.post('/updatePlayersColors', (req, res) => {
    console.log('req post', req.body);
    pool.connect((err, client, done) => {
        if (err) throw err
        client.query('UPDATE users SET players = $2, colors = $3 WHERE UID = $1', [req.body.uid, JSON.stringify(req.body.players), JSON.stringify(req.body.colors)], (err, res) => {
            done();
            if (err) {
                console.log(err.stack);
            } else {
                console.log(res.rows);
            }
        });
    });
    res.send('Update Complete.');
});

////////////

app.post('/updateUserImg', (req, res) => {
    console.log('req post', req.body);
    pool.connect((err, client, done) => {
        if (err) throw err
        client.query('UPDATE users SET userimg = $2 WHERE UID = $1', [req.body.uid, req.body.userImg], (err, res) => {
            done();
            if (err) {
                console.log(err.stack);
            } else {
                console.log(res.rows);
            }
        });
    });
    res.send('Update Complete.');
});

////////////
app.get('/getuser', (req, res) => {
    console.log('req get', req.query);
    pool.connect((err, client, done) => {
        if (err) throw err
        client.query('SELECT * FROM users WHERE uid=$1', [req.query.uid], (err, res2) => {
            done();
            if (err) {
                console.log(err.stack);
            } else {
                res.send({
                    players: JSON.parse(res2.rows[0].players),
                    colors: JSON.parse(res2.rows[0].colors),
                    userImg: res2.rows[0].userimg
                });
            }
        });
    });
});

app.listen(PORT, () => console.log('Server started on port', PORT));