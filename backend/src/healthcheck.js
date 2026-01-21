import http from 'http';

const options = {
    host: 'localhost',
    port: 5000,
    timeout: 2000,
    path: '/api/v1/health' // Assuming we have this route, or just /
};

const request = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});

request.on('error', (err) => {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
});

request.end();
