import express from "express"
import identityRoute from "./identity.route"
import docsRoute from "./docs.route"
import config from "../configs/config"

const router = express.Router()

// Define route configs
const defaultRoutes = [
	{
		name: "identityRoute",
		path: "/bitespeed",
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


defaultRoutes.forEach(({ name, path, route }) => {
	try {
	 
		router.use(path,  route)
		console.log(`Mounted ${name} at path: ${path}`)
	} catch (err:any) {
	  throw new Error(`Failed to mount ${name} at path: ${path}. Error: ${err.message}`)
	}
  })

  if (config.env === "development") {
	devRoutes.forEach(({name, path, route}) => {
		try {
			router.use(path, route)
		} catch (err:any) {
			throw new Error(`Failed to mount ${name} at path: ${path}.Error: ${err.message}`)
		}
	})
}

export default router
