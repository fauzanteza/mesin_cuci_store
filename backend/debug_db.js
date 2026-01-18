import('./src/config/database.js')
    .then(() => console.log('DB SUCCESS'))
    .catch(err => {
        console.error('DB ERROR:');
        console.error(err);
    });
