const mongoose = require('mongoose');
const seed = require('./seedHelpers');
const cities = require('./cities');

const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const SeedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const price = Math.floor(Math.random() * 20) + 10;
        const randDes = rand(seed.descriptors);
        const randPla = rand(seed.places);
        const randCit = rand(cities);
        const camp = new Campground({
            author: '68f71094059b4654c4936181',
            title: `${seed.descriptors[randDes]} ${seed.places[randPla]}`,
            location: `${cities[randCit].city},  ${cities[randCit].state}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae ratione vero veritatis quibusdam quidem quo voluptatibus dignissimos atque doloremque quam! In deserunt illo aut voluptates iste hic eligendi explicabo aperiam? Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae ratione vero veritatis quibusdam quidem quo voluptatibus dignissimos atque do',
            image: `https://picsum.photos/400?random=${Math.random()}`,
            price
        })
        await camp.save();
    }
}

SeedDb().then(() => {
    db.close();
})

const rand = (i) => {
    const rando = Math.floor(Math.random() * i.length);
    return rando
}

