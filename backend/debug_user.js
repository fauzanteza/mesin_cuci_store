import('./src/models/User.js')
    .then(() => console.log('USER SUCCESS'))
    .catch(err => {
        console.error('USER ERROR:');
        console.error(err);
    });
