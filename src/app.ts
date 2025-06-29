import express from "express"
import helmet from "helmet"
import compression from "compression"
import cors from "cors"
import passport from "passport"
import httpStatus from "http-status"
import config from "./configs/config"
// import morgan from "./configs/morgan"
import xss from "./middlewares/xss"
// import {jwtStrategy} from "./configs/passport"
import {authLimiter} from "./middlewares/rateLimiter"
import routes from "./routes"
import {ApiResponse} from "./utils/ApiResponse"
import {Request, Response, NextFunction} from "express"
import eventEmitter from "./utils/logging"

const app = express()
const port: number = parseInt(process.env.PORT as string) || 5002

import {ProvidersFactory} from "./utils/ProvidersFactory"
import { errorHandler } from "./middlewares/errorHandler"

const providersFactory = new ProvidersFactory()
;(async () => {
	try {
		const {prisma, release} = await providersFactory.transaction()
		await prisma.$connect()
		eventEmitter.emit("logging", "Provider Factory initialized successfully")
	} catch (error) {
		eventEmitter.emit("logging", `Failed to Intialize provider factory: ${error}`)
		process.exit(1) // Exit app if DB connection fails
	}
})()

// if (config.env !== "test") { 
// 	app.use(morgan.successHandler)
// 	app.use(morgan.errorHandler)
// }

// set security HTTP headers
app.use(helmet())

// parse json request body
app.use(express.json())

// parse urlencoded request body
app.use(express.urlencoded({extended: true}))

// sanitize request data
app.use(xss())

// gzip compression
app.use(compression())

app.use(cors())
app.options("*", cors())

// app.use(passport.initialize())
// passport.use("jwt", jwtStrategy)

// limit repeated failed requests to auth endpoints
if (config.env === "production") {
	app.use("/v1/auth", authLimiter)
}

// v1 api routes
app.use("/v1", routes)

app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: `Your server is up and running....${process.pid}`
	})
})

app.use(errorHandler)

// send back a 404 error for any unknown api request
app.use((req: Request, res: Response, next: NextFunction) => {
	const response = new ApiResponse(res)
	response.errorResponse({
		statusCode: 404,
		message: "Not found"
	})
})

app.listen(port, async () => {
	// get redis client
	eventEmitter.emit("logging", `Server is up and running on port: ${port}`)
})

export default app
