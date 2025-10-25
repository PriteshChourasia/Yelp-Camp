const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const review = require('./review');

const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_100')
})

const campgroundSchema = Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [imageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

campgroundSchema.post('findOneAndDelete', async function (camp) {
    await review.deleteMany({ _id: { $in: camp.reviews } })
})

module.exports = mongoose.model('Campground', campgroundSchema);
