const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const campground = require('./models/campground');
const review = require('./models/review.js');
const catchAsync = require('./utils/CatchAsync');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const expressError = require('./utils/ExpressError');
const ExpressError = require('./utils/ExpressError');

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.listen(3000, () => {
    console.log('Listning to port 3000');
})

const validateCampForm = (req, res, next) => {
    const body = req.body;
    const { error } = campgroundSchema.validate(body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

const validateReviewForm = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findById(id);
    res.render('campgrounds/edit', { camp });
}));

app.get('/campgrounds/new', catchAsync(async (req, res) => {
    res.render('campgrounds/new');
}));

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findById(id).populate('reviews');
    // console.log(camp.reviews)
    res.render('campgrounds/show', { camp });
}));

app.post('/campgrounds', validateCampForm, catchAsync(async (req, res, next) => {
    const camp = new campground(req.body);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}));

app.put('/campgrounds/:id', validateCampForm, catchAsync(async (req, res) => {
    const { id } = req.params;
    const cam = req.body;
    const camp = await campground.findByIdAndUpdate(id, cam);
    res.redirect(`/campgrounds/${id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/review', validateReviewForm, async (req, res) => {
    const newReview = new review(req.body.review);
    const camp = await campground.findById(req.params.id);
    camp.reviews.push(newReview);
    await camp.save();
    await newReview.save();
    res.redirect(`/campgrounds/${req.params.id}`)
})

app.delete('/campgrounds/:id/review/:reviewId', async (req, res) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
})

app.all(/(.*)/, (req, res, next) => {
    next(new expressError('Page not found', 404));
});

app.use((err, req, res, next) => {
    const { message = 'Something went wrong', status = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(status).render('error', { err });
})

