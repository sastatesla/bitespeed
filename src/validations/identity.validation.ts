import Joi from "joi"
import {password} from "./custom.validation"

const identity = {
  body: Joi.object({
    email: Joi.string().email().allow(''),
    phoneNumber: Joi.string().allow('')
  })
  .or('email', 'phoneNumber')
  .messages({
    'object.missing': 'At least one of email or phoneNumber is required. Both cannot be empty.'
  })
}

export default {
	identity,
}
