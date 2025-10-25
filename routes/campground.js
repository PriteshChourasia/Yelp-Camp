const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/CatchAsync');
const campgrounds = require('../controllers/campgrounds.js');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage })

const { isLoggedIn, validateCampForm, isAuthor } = require('../middleware.js');

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampForm, catchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, catchAsync(campgrounds.renderNewForm));

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampForm, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;