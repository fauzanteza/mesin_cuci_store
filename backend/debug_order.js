import('./src/models/Order.js')
    .then(() => console.log('ORDER SUCCESS'))
    .catch(err => {
        console.error('ORDER ERROR:');
        console.error(err);
    });
