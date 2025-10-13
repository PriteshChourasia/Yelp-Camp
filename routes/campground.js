const express = require('express');
const router = express.Router({ mergeParams: true });
const campground = require('../models/campground');
const catchAsync = require('../utils/CatchAsync');
const { campgroundSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError.js');

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

router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findById(id);
    res.render('campgrounds/edit', { camp });
}));

router.get('/new', catchAsync(async (req, res) => {
    res.render('campgrounds/new');
}));

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { camp });
}));

router.post('/', validateCampForm, catchAsync(async (req, res, next) => {
    const camp = new campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}));

router.put('/:id', validateCampForm, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));


module.exports = router;