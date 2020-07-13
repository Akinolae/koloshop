const JWT = require('jsonwebtoken');

module.exports = {
    isAuthenticated: function (req, res, next) {
        const userHeader = req.header['validate'];
        if (typeof userHeader !== 'undefined') {
            const user = userHeader.split(' ');
            const token = user[1];
            req.token = token;
            next();
        } else {
            res.json({
                msg: 'an error occured.'
            });
        }
    },
}