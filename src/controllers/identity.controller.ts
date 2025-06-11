import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import contactService from "../services/identity.service";

class IdentityController {
  constructor() {
    this.identify = this.identify.bind(this);
  }

  public async identify(req: Request, res: Response, next: NextFunction) {
    const apiResponse = new ApiResponse(res);
    let query: any = null;
    try {
      const DBconnector = await apiResponse.APITransactionBegin();
      query = DBconnector.query;

      const result = await contactService.identify(req.body);

      await apiResponse.APITransactionSucceed(query);
      return apiResponse.successResponse({
        message: "Contact identified successfully",
        data: result,
      });
    } catch (error: any) {
      if (query) {
        await apiResponse.APITransactionFailed(query);
      }
      next(error);
      return;
    }
  }
}

export default new IdentityController();