const mongoose = require('mongoose');
const seed = require('./seedHelpers');
const cities = require('./cities');
const dbUrl = process.env.DB_URL;

const Campground = require('../models/campground');


// mongoose.connect('mongodb://localhost:27017/yelp-camp');
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const SeedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 400; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const randDes = rand(seed.descriptors);
        const randPla = rand(seed.places);
        const randCit = rand(cities);
        const camp = new Campground({
            author: '68f71094059b4654c4936181',
            title: `${seed.descriptors[randDes]} ${seed.places[randPla]}`,
            location: `${cities[randCit].city},  ${cities[randCit].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae ratione vero veritatis quibusdam quidem quo voluptatibus dignissimos atque doloremque quam! In deserunt illo aut voluptates iste hic eligendi explicabo aperiam? Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae ratione vero veritatis quibusdam quidem quo voluptatibus dignissimos atque do',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dsktz2itx/image/upload/v1761373716/YelpCamp/epp0hzpc2cowtgcqm7z0.jpg',
                    filename: 'YelpCamp/epp0hzpc2cowtgcqm7z0'
                },
                {
                    url: 'https://res.cloudinary.com/dsktz2itx/image/upload/v1761373717/YelpCamp/fyn2jx7kbki0klgdoj0b.jpg',
                    filename: 'YelpCamp/fyn2jx7kbki0klgdoj0b'
                },
                {
                    url: 'https://res.cloudinary.com/dsktz2itx/image/upload/v1761373718/YelpCamp/lx7xnubzwmodu2krprpv.jpg',
                    filename: 'YelpCamp/lx7xnubzwmodu2krprpv'
                },
                {
                    url: 'https://res.cloudinary.com/dsktz2itx/image/upload/v1761373728/YelpCamp/wj21ofbapuifyr5dytzr.jpg',
                    filename: 'YelpCamp/wj21ofbapuifyr5dytzr'
                }
            ]
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

