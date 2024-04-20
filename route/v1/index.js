const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const userController = require('../../controller/v1/userController');
const accountController = require('../../controller/v1/accountController');
const transactionController = require('../../controller/v1/transactionController');

let auth = (req, res, next) => {
    let { authorization } = req.headers;
    if (!authorization || !authorization.split(' ')[1]) {
        return res.status(401).json({
            status: false,
            message: 'token not provided!',
            data: null
        });
    }

    let token = authorization.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({
                status: false,
                message: err.message,
                data: null
            });
        }

        delete user.iat;
        req.user = user;
    
        next();
    });
};

router.post('/register', userController.store);
router.post('/login', userController.login);
router.get('/check-auth', auth, userController.checkauth);
router.get ('/users', userController.index);
router.get ('/users/:id', userController.show);

router.post('/make-accounts', accountController.store);
router.get ('/accounts', accountController.index);
router.get ('/accounts/:id', accountController.show);

router.post('/make-transactions', transactionController.store);
router.get ('/transactions', transactionController.index);
router.get ('/transactions/:transactionId', transactionController.show);


module.exports = router;