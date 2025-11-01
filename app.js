if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ quiet: true });
}


const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const expressError = require('./utils/ExpressError');
const campRoutes = require('./routes/campground.js');
const reviewRoutes = require('./routes/review.js');
const userRoutes = require('./routes/user.js');
const flash = require('connect-flash');
const passport = require('passport');
const localstrategy = require('passport-local');
const User = require('./models/user.js');
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
const app = express();
app.set('query parser', 'extended');


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// const dbUrl = 'mongodb://localhost:27017/yelp-camp'
const dbUrl = process.env.DB_URL;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});



app.use(session({
    store,
    name: 'session',
    secret: 'thisshouldbeagoodsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(sanitizeV5({ replaceWith: '_' }));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/",
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.maptiler.com/",
];

const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.maptiler.com/",
];

const connectSrcUrls = [
    "https://api.maptiler.com/",
];

const fontSrcUrls = [
    "https://fonts.gstatic.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/",
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dsktz2itx/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.loggedInUser = req.user;
    res.locals.success = req.flash('Success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campRoutes);
app.use('/campgrounds/:id/review', reviewRoutes);
app.use('/', userRoutes);



mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.listen(3000, () => {
    console.log('Listning to port 3000');
})

app.get('/', (req, res) => {
    res.render('home');
})

app.all(/(.*)/, (req, res, next) => {
    next(new expressError('Page not found', 404));
});

app.use((err, req, res, next) => {
    const { message = 'Something went wrong', status = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(status).render('error', { err });
})

