// src/middlewares/errorHandler.ts
import {Request, Response, NextFunction} from "express"

export const errorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const statusCode = err.statusCode || 500
	const errorCode = err.errorCode || "INTERNAL_SERVER_ERROR"

	res.status(statusCode).json({
		success: false,
		message: err.message || "Internal Server Error",
		error_code: errorCode,
		stack: process.env.NODE_ENV === "production" ? undefined : err.stack
	})
}
