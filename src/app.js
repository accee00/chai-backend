import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

/// CORS:It’s a browser security mechanism that controls which 
/// websites are allowed to make requests to your backend server.
/// origin: URL allowed to access backend eg- https://myapp.com
/// credentials: true allows cookies, authorization headers, or SSL client certificates to be included in requests across origins.
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

/// limit: Maximum size of JSON body allowed (protects server)
/// express.json(): Middleware to parse JSON request bodies
/// (Converts the raw JSON string into a JavaScript object)
app.use(express.json({ limit: "16kb" }))

/// urlencoded: Converts the raw URL-encoded string into a JavaScript object
/// eg-: username=Harsh&password=123456
/// req.body = {
/// username: "Harsh",
/// password: "123456"
/// }
/// limit: Limits the maximum size of URL-encoded payload to 16 KB.
app.use(express.urlencoded({ extended: true, limit: "16kb" }))


app.use(express.static("public"))

/// cookieParser: Parses cookies sent by the client and makes them available in req.cookies
/// Lets you read cookies, set cookies, and use signed cookies.
app.use(cookieParser())


/// Import router

import userRouter from './routes/user.routes.js'

/// route declare
app.use("/api/v1/users", userRouter)


export { app }

