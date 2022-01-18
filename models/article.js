const mongoose = require('mongoose')
const slugify = require('slugify')

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    markdown: {
        type: String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    cleanBody: {
        type: String,
        required:true  
    },
    filename: {
        type: String,
        required: true,
        unique: true
    },
    contentType: {
        type: String,
        required: true,
    },
    imageBase64: {
        type: String,
        required: true,
    }
})

articleSchema.pre('validate', function (next) {
    if(this.title) {
        this.slug = slugify(this.title, {lower: true, strict: true})
    }
    if(this.markdown){
        this.cleanBody = this.markdown
    }
    next()
})

module.exports = mongoose.model('Article', articleSchema)
