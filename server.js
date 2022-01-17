if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose')
const articleLoader = require('./routes/article');
const adminLoader = require('./routes/admin')
const app = express();
const methodOverride = require('method-override')
const path = require('path')
const bodyparser = require('body-parser')
const cookieparser = require('cookie-parser')
const session = require('express-session')
const mongoDBSession = require('connect-mongodb-session')(session)


mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true,useUnifiedTopology: true})

mongoose.connection.once('open', function () {
    console.log('connection has been mande')
}).on('error', function(error) {
    console.log('connection error', error)
})
const PORT = process.env.PORT || 3000;


const store = new mongoDBSession({
    uri: process.env.MONGO_URI,
    collection: 'mysessions',
})

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))

app.use(express.urlencoded({ extended: false}))
app.use(express.json())
app.use(cookieparser())
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine','ejs');

app.use((req, res, next) => {
    res.locals.user = req.session.isAuth
    next()
})

app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

app.use('/articles', articleLoader)

app.use('/admin', adminLoader)


app.listen(PORT , () => {
    console.log('port started');
})