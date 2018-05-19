import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import { getSecret } from './secrets';
import Comment from './models/comment';

// create instances
const app = express();
const router = express.Router();

// set port
const API_PORT = process.env.API_PORT || 3001;

// db config -- set your URI from mLab in secrets.js
mongoose.connect(getSecret('dbUri'));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// configure the API to use bodyParser
// and look for JSON data in the request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// set the route path & initialize the API
router.get('/', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

// GET comments
router.get('/comments', (req, res) => {
    Comment.find((err, comments) => {
        if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
        return res.json({
            success: true,
            data: comments
        });
    });
});

// POST comments
router.post('/comments', (req, res) => {
    const comment = new Comment();
    // body parser lets us use the req.body
    const { author, text } = req.body; // destructuring
    if (!author || !text) {
        // we should throw an error. we can do this check on the front end
        return res.json({
            success: false,
            error: 'You must provide an author and comment'
        });
    }
    comment.author = author;
    comment.text = text;
    comment.save(err => {
        if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
        return res.json({ success: true });
    });
});

// PUT comment
router.put('/comments/:commentId', (req, res) => {
    const { commentId } = req.params;
    if (!commentId) {
        return res.json({ success: false, error: 'No comment id provided' });
    }
    Comment.findById(commentId, (error, comment) => {
        if (error) return res.json({ success: false, error });
        const { author, text } = req.body;
        if (author) comment.author = author;
        if (text) comment.text = text;
        comment.save(error => {
            if (error) return res.json({ success: false, error });
            return res.json({ success: true });
        });
    });
});

// DELETE comment
router.delete('/comments/:commentId', (req, res) => {
    const { commentId } = req.params;
    if (!commentId) {
        return res.json({ success: false, error: 'No comment id provided' });
    }
    Comment.remove({ _id: commentId }, (error, comment) => {
        if (error) return res.json({ success: false, error });
        return res.json({ success: true });
    });
});
// use router configuration
app.use('/api', router);

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));
