import 'reflect-metadata'
import { fixModuleAlias } from './helper/fix-module-alias'

fixModuleAlias(__dirname)

// !IMPORTANT: Do not remove above line, it should be the first line of the file
import * as dotenv from 'dotenv'
import session from 'express-session'
import passport = require('passport')
import express from 'express'
import GoogleStrategy from 'passport-google-oauth'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

let userProfile: GoogleStrategy.Profile | undefined = undefined

app.set('view engine', 'ejs')

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.get('/', function (req, res) {
  console.log('Incoming request')
  res.render('pages/auth')
})

passport.serializeUser(function (user, cb) {
  cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
  cb(null, obj)
})

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
passport.use(
  new GoogleStrategy.OAuth2Strategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile
      console.log('ACCESS TOKEN', accessToken)
      console.log('REFRESH TOKEN', refreshToken)
      console.log('USER PROFILE', userProfile)
      return done(null, userProfile)
    }
  )
)

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/error' }), function (req, res) {
  // Successful authentication, redirect success.
  res.redirect('/success')
})

app.get('/success', function (req, res) {
  console.log('USER PROFILE', userProfile)
  console.log('id:', userProfile?.id)
  res.render('pages/success', { user: userProfile })
})

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
})
