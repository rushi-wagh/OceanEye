import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { assignReportToAuthority } from "../services/report.service.js";
import { createReport } from "../services/report.service.js";
import { deleteReport } from "../services/report.service.js";
import { getPublicNearbyReports } from "../services/report.service.js";
import { getReports } from "../services/report.service.js";
import { getSingleReport } from "../services/report.service.js";
import { updateReport } from "../services/report.service.js";
import { getPublicHotspots } from "../intelligence/hotspot.service.js";

const create = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const reportData = req.body;
  const { title, description, latitude, longitude } = req.body;

  if (!userId) {
    throw new ApiError(401, "User ID is required");
  }

  if (
    !title ||
    !description ||
    latitude === undefined ||
    longitude === undefined
  ) {
    throw new ApiError(
      401,
      "Title, description, latitude and longitude are required",
    );
  }

  const report = await createReport(userId, reportData);

  return res
    .status(201)
    .json(new ApiResponse(201, "Report created successfully", { report }));
});

const getAll = asyncHandler(async (req, res) => {
  const user = req.user;
  const { status } = req.query;
  const { scope } = req.query;

  
  const reports = scope === "public" ? await getReports(user, status, scope) : await getReports(user, status);

  return res
    .status(200)
    .json(new ApiResponse(200, "Reports fetched successfully", { reports }));
});

const getNearby = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius } = req.query;

  if (latitude === undefined || longitude === undefined) {
    throw new ApiError(401, "Latitude and longitude are required");
  }

  const reports = await getPublicNearbyReports({
    latitude,
    longitude,
    radius,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Nearby reports fetched successfully", { reports }));
});

const getOne = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id: reportId } = req.params;
  const { scope } = req.query;

  if (!user) {
    throw new ApiError(401, "User is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  const report = await getSingleReport(user, reportId, scope);

  return res
    .status(200)
    .json(new ApiResponse(200, "Report fetched successfully", { report }));
});

const update = asyncHandler(async (req, res) => {
  const user = req.user;
  const reportData = req.body;
  const { id: reportId } = req.params;

  if (!user) {
    throw new ApiError(401, "User is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  const report = await updateReport(user, reportId, reportData);

  return res
    .status(200)
    .json(new ApiResponse(200, "Report updated successfully", { report }));
});

const remove = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id: reportId } = req.params;

  if (!user) {
    throw new ApiError(401, "User is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  await deleteReport(user, reportId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Report deleted successfully", null));
});

const assignMe = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id: reportId } = req.params;

  if (!user) {
    throw new ApiError(401, "User is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  const report = await assignReportToAuthority(user, reportId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Report assigned successfully", { report }));
});


const getHotspots = asyncHandler(async (req, res) => {
  const hotspots = await getPublicHotspots();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Public hotspots fetched successfully",
        { hotspots },
      ),
    );
});

export { assignMe, create, getAll, getNearby, getOne, remove, update, getHotspots };
