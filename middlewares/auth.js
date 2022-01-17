
function isAuth (req, res, next) {
    console.log(req.session.isAuth)
    if (req.session.isAuth) {
        next()
    } else {
        res.redirect('/articles')
    }
}


module.exports = isAuth