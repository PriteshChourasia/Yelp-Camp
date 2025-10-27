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
const app = express();


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'thisshouldbeagoodsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());


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



mongoose.connect('mongodb://localhost:27017/yelp-camp');
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

