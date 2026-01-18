import('./src/models/Product.js')
    .then(() => console.log('PRODUCT SUCCESS'))
    .catch(err => {
        console.error('PRODUCT ERROR:');
        console.error(err);
    });
