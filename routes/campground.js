const express = require('express');
const router = express.Router({ mergeParams: true });
const campground = require('../models/campground');
const catchAsync = require('../utils/CatchAsync');

const { isLoggedIn, validateCampForm, isAuthor } = require('../middleware.js');

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findById(id);
    if (!camp) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { camp });
}));

router.get('/new', isLoggedIn, catchAsync(async (req, res) => {
    res.render('campgrounds/new');
}));

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!camp) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp });
}));

router.post('/', isLoggedIn, validateCampForm, catchAsync(async (req, res, next) => {
    const camp = new campground(req.body.campground);
    camp.author = req.user._id;
    await camp.save();
    req.flash('Success', 'Successfully created campground');
    res.redirect(`/campgrounds/${camp._id}`);
}));

router.put('/:id', isLoggedIn, isAuthor, validateCampForm, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('Success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    req.flash('Success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}));


module.exports = router;