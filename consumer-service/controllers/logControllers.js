const { z } = require("zod");
const db = require("../db/db");

const searchSchema = z.object({
  level: z.string().optional(),
  service: z.string().optional(),
});

const handleSearch = async (req, res) => {
  try {
    const level =
      typeof req.query.level === "string" ? req.query.level.trim() : "";
    const service =
      typeof req.query.service === "string" ? req.query.service.trim() : "";

    const parseResult = searchSchema.safeParse({ level, service });
    if (!parseResult.success) {
      return res.status(400).json({
        status: false,
        message: "bad request",
      });
    }

    if (!level && !service) {
      return res.status(400).json({
        status: false,
        message: "provide level or service",
      });
    }

    const conditions = [];
    const params = [];
    if (level) {
      params.push(level);
      conditions.push(`level = $${params.length}`);
    }
    if (service) {
      params.push(service);
      conditions.push(`service = $${params.length}`);
    }

    const whereClause = conditions.length
      ? ` WHERE ${conditions.join(" AND ")}`
      : "";
    const result = await db.query(`SELECT * FROM logs${whereClause}`, params);
    const rows = result.rows ?? [];

    return res.status(200).json({
      status: true,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { handleSearch };
