const campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = async (req, res) => {
    res.render('campgrounds/new');
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findById(id);
    if (!camp) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { camp });
}

module.exports.showCampground = async (req, res) => {
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
}

module.exports.createCampground = async (req, res, next) => {
    const camp = new campground(req.body.campground);
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    camp.author = req.user._id;
    await camp.save();
    req.flash('Success', 'Successfully created campground');
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findByIdAndUpdate(id, { ...req.body.campground });
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.images.push(...imgs);
    await camp.save();
    req.flash('Success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${id}`);
}
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    req.flash('Success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}