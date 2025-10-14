const express = require('express');
const router = express.Router({ mergeParams: true });
const campground = require('../models/campground');
const review = require('../models/review.js');
const { reviewSchema } = require('../schemas.js');
const { route } = require('./campground.js');


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

router.post('/', validateReviewForm, async (req, res) => {
    const camp = await campground.findById(req.params.id);
    const newReview = new review(req.body.review);
    // console.log(newReview);
    console.log(req.params);
    console.log(camp);
    camp.reviews.push(newReview);
    await camp.save();
    await newReview.save();
    req.flash('Success', 'Successfully created review');
    res.redirect(`/campgrounds/${req.params.id}`)
})

router.delete('/:reviewId', async (req, res) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await review.findByIdAndDelete(reviewId);
    req.flash('Success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
})

module.exports = router;