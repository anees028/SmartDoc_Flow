const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/appConfig');

exports.login = (req, res) => {
    const { username, password } = req.body;
    
    // Mock User Check
    if (username === 'admin' && password === 'admin') {
        const token = jwt.sign({ name: username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
};