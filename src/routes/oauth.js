const router = require('express').Router();
const passport = require('passport');

// Rute untuk inisiasi login Google
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
    })
);

// Callback handler setelah autentikasi Google
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login',
        session: true,
    }),
    (req, res) => {
        // Generate JWT setelah login sukses
        const user = req.user;
        const token = jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET, { expiresIn: '7d' }
        );

        // Redirect ke frontend dengan token
        res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
    }
);

module.exports = router;