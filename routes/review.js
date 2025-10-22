const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReviewForm, isLoggedIn, isReviewAuthor } = require('../middleware.js');
const reviews = require('../controllers/reviews.js')

router.post('/', isLoggedIn, validateReviewForm, reviews.createReview)

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, reviews.deleteReview)

module.exports = router;