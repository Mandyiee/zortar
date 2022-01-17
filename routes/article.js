const express = require('express')
const Article = require('./../models/article')
const router = express.Router()
const store = require('../middlewares/upload')
const fs = require('fs')
const isAuth = require('../middlewares/auth')
const { randomInt } = require('crypto')

router.get('/',async (req,res)=> {
    const articles = await Article.find().sort({ createdAt : 'desc'})
    res.render('articles/index', {articles: articles})
})

router.get('/new', isAuth, (req, res) => {
    
    res.render('articles/new', {article: new Article})
})

router.get('/edit/:id', isAuth, async (req, res) => {
    const article = await Article.findById(req.params.id)
    res.render('articles/edit', {article: article})
})


router.get('/:slug', async (req, res) => {
    const article =await Article.findOne({slug: req.params.slug})
    if( article == null) {
        res.redirect('/')
    }
    res.render('articles/show', {article: article})
})

router.post('/', store.single('image'), isAuth, async (req,res) => {
    console.log(req.body)
    const file = req.file
    if (!file) {
        const error = new Error('please choose file')
        error.httpStatusCode = 400
        return error
    }
    let img = fs.readFileSync(file.path)
    let encode_image = img.toString('base64')
    
    const article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
        filename: file.originalname,
        contentType: file.mimetype,
        imageBase64: encode_image
    })
            
        try {
         let  articles = await article.save();
           res.redirect(`articles/${articles.slug}`)
        } catch(e) {
           res.render(`articles/new`, { article: article})
        }
})

router.put('/:id', store.single('image'), isAuth, async (req, res) => {
    const file = req.file
    if (!file) {
        const error = new Error('please choose file')
        error.httpStatusCode = 400
        return error
    }
    let img = fs.readFileSync(file.path)
    let encode_image = img.toString('base64')

    const article = await Article.findById(req.params.id)
     article.title =req.body.title
        article.description = req.body.description
        article.markdown = req.body.markdown
        article.filename = file.originalname
        article.contentType = file.mimetype
        article.imageBase64 = encode_image
            
        try {
         let  articles = await article.save();
           res.redirect(`/articles/${article.slug}`)
        } catch(e) {
           res.render(`articles/edit`, { article: article})
        }
})


router.delete('/:id', isAuth, async (req, res) => {
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/articles')
})


module.exports = router
