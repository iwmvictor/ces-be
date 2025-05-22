import { Get, Route, Tags, Request, Security, Middlewares } from "tsoa";
import { StatisticService } from "../services/StatisticService";
import { Request as ExpressRequest } from "express";
import { roles } from "../utils/roles";
import { checkRole } from "../middlewares";
@Tags("Statistic")
@Route("/api/statistic")
export class StatisticController {
  @Security("jwt")
  @Get("/citizen/{year}/current")
  @Middlewares(checkRole(roles.CITIZEN))
  public getCitizenStatisticsByMonth(
    year: number,
    @Request() req: ExpressRequest,
  ) {
    return StatisticService.getCitizenStatisticsByMonth(year, req);
  }

  @Security("jwt")
  @Get("/organization/{year}/current")
  @Middlewares(checkRole(roles.ORGANIZATION))
  public getOrganizationStatisticsByMonth(
    year: number,
    @Request() req: ExpressRequest,
  ) {
    return StatisticService.getOrganizationStatisticsByMonth(year, req);
  }

  @Get("/admin/{year}")
  public getAdminStatisticsByMonth(year: number) {
    return StatisticService.getAdminStatisticsByMonth(year);
  }
}
