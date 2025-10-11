const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const review = require('./review');

const campgroundSchema = Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
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
