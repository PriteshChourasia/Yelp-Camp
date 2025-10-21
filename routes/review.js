const express = require('express');
const router = express.Router({ mergeParams: true });
const campground = require('../models/campground');
const review = require('../models/review.js');
const { route } = require('./campground.js');
const { validateReviewForm, isLoggedIn, isReviewAuthor } = require('../middleware.js');

router.post('/', isLoggedIn, validateReviewForm, async (req, res) => {
    const camp = await campground.findById(req.params.id);
    const newReview = new review(req.body.review);
    newReview.author = req.user._id;
    camp.reviews.push(newReview);
    await camp.save();
    await newReview.save();
    req.flash('Success', 'Successfully created review');
    res.redirect(`/campgrounds/${req.params.id}`)
})

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, async (req, res) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await review.findByIdAndDelete(reviewId);
    req.flash('Success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
})

module.exports = router;