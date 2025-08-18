const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { user: UserModel } = require("../models");
const bcrypt = require('bcryptjs');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    try {
        const user = await UserModel.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true,
            scope: ['profile', 'email'],
        },
        async(req, accessToken, refreshToken, profile, done) => {
            try {
                // Cek apakah user sudah ada
                const existingUser = await UserModel.findOne({ where: { email: profile.emails[0].value } });

                if (existingUser) {
                    return done(null, existingUser);
                }

                // Buat user baru jika belum ada
                const newUser = await UserModel.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    provider: 'google',
                    // password: await bcrypt.hash(crypto.randomBytes(16).toString('hex')), // Password acak
                    role: 'customer', // Default role
                    is_verified: true, // Verifikasi otomatis
                    profile_image: profile.photos[0].value,
                });

                return done(null, newUser);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);