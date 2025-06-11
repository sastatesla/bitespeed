import express from "express"
import identityRoute from "./identity.route"
import docsRoute from "./docs.route"
import config from "../configs/config"

const router = express.Router()

// Define route configs
const defaultRoutes = [
	{
		name: "identityRoute",
		path: "/identity",
		route: identityRoute
	}
]

const devRoutes = [
	{
		name: "docsRoute",
		path: "/docs",
		route: docsRoute
	}
]



// Mount development-only routes with debug logs
if (config.env === "development") {
	devRoutes.forEach(({name, path, route}) => {
		try {
			console.log(`[Mounting dev route] ${name} at path: ${path}`)
			router.use(path, route)
		} catch (err) {
			console.error(`❌ Failed to mount ${name} at path: ${path}`)
			console.error(err)
		}
	})
}

export default router
