const ExpressError = require('./utils/ExpressError.js');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const campground = require('./models/campground');
const review = require('./models/review.js');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You need to login first');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateCampForm = (req, res, next) => {
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

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const foundcampground = await campground.findById(id);
    if (!foundcampground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do edit this campground');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const foundReview = await review.findById(reviewId);
    if (!foundReview.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do delete this review');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReviewForm = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}