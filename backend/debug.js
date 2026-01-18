import('./src/server.js').catch(err => {
    console.error('CAUGHT ERROR:');
    console.error(err);
});
