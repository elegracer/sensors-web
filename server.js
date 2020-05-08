const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.port || 8000;
const fs = require('fs');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

var file = null;

io.on('connection', (socket) => {
    console.log('connected');
    socket.on('disconnect', () => {
        console.log('disconnected');
    })

    socket.on('signal', (signal) => {
        if (signal == 'start_recording') {
            const date = new Date();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const minute = date.getMinutes();
            const filename = month + '_' + day + '_' + hour + '_' + minute + '.bin';
            file = fs.createWriteStream(filename);
            console.log('start recording data...');
        } else if (signal == 'stop_recording') {
            file.end();
            file = null;
            console.log('stop recording data...');
        }
        console.log('signal: ' + signal);
    });

    socket.on('data', (data) => {
        console.log('receiving binary data...');

        var uint8_buffer_view = new Uint8Array(data);
        var uint32_buffer_view = new Uint32Array(data);
        // console.log(uint32_buffer_view);
        console.log(uint8_buffer_view.length, uint32_buffer_view.length);
        console.log(uint32_buffer_view[uint32_buffer_view.length - 1]);
        if (file) {
            // file.write(data);
            file.write(uint8_buffer_view);
        }
    });
});

http.listen(port, () => {
    console.log('listening on ' + port);
});
