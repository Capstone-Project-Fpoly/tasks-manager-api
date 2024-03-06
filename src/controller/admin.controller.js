const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const analyticsDataClient = new BetaAnalyticsDataClient();
class AdminController {
  async index(req, res) {
    const [response] = await analyticsDataClient.runReport({
      property: "properties/6522057001",
      dateRanges: [
        {
          startDate: "2020-03-31",
          endDate: "today",
        },
      ],
      dimensions: [
        {
          name: "city",
        },
      ],
      metrics: [
        {
          name: "activeUsers",
        },
      ],
    });

    console.log("Report result:");
    response.rows.forEach((row) => console.log(row));
  }
}
module.exports = new AdminController();
