export const uploadFile = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }
    res.status(200).json({
        status: 'success',
        data: {
            url: `/uploads/${req.file.filename}`,
            filename: req.file.filename
        }
    });
};
