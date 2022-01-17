const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const session = require('express-session')
const Admin = require('../models/admin')
const saltRounds = 10
const { check, validationResult } = require('express-validator')

router.get('/login', function (req, res) {
    let errors = null
    res.render('admin/login',  { errors : errors})
})

router.get('/register', function (req, res) {
    let errors = null
    res.render('admin/register', { errors : errors})
})

router.post('/register', [
    check('username')
        .exists()
        .isLength({ min: 3 })
        .withMessage('The username must be more than 3 characters'),
    check('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('The email is not valid'),
    check('password')
        .isLength({ min: 5 })
        .withMessage('The password must be more than five characters')
], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.render('admin/register', { errors: errors.array() })
    }

    const check1 = await Admin.find();

    if (check1) {
        return res.redirect('/articles')   
    }

    const admin = new Admin({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    })

    try {
        const admins = await admin.save()
        req.session.isAuth = true
        req.session.user = admin
        console.log(req.session.isAuth)
        return res.redirect('/articles')
    } catch (error) {
        return res.json(error)
    }
})

router.post('/login', async function (req, res) {
    try {
        const admin = await Admin.findOne({ username: req.body.username });
        if (admin) {
            const auth = await bcrypt.compare(req.body.password, admin.password)
            if (auth) {
                req.session.isAuth = true
                req.session.user = admin
                return res.redirect('/articles')
            } else {
                return res.render('admin/login', { errors: 'password is incorrect' })
            }
        } else {
            return res.render('admin/login', { errors: 'user does not exist' })
        }
    } catch (err) {
        res.json(err)
    }
});

router.get('/logout', function (req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.json(err)
        }
    })
    res.locals.user = null
    return res.redirect('/articles')
})

module.exports = router