import express from "express"
import validate from "../middlewares/validate"
import {identityController} from "../controllers"
import {identityValidation} from "../validations"
// import auth from "../middlewares/auth"

const router = express.Router()

router.post(
	"/identity",
	validate(identityValidation.identity),
)


export default router
