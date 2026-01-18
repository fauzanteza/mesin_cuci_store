import('./src/models/index.js').then(() => console.log('success')).catch(err => {
    console.error('ERROR LOADING MODELS:');
    console.error(err);
});
