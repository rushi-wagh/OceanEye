import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/ApiError.js";
import { reportInclude } from "./report.service.js";


const ALLOWED_TRANSITIONS = {
  VERIFIED: ["SUBMITTED", "PENDING_AUTHORITY"],
  REJECTED: ["SUBMITTED", "PENDING_AUTHORITY"],
  RESOLVED: ["VERIFIED"],
  CLOSED: ["RESOLVED"],
};

const actionInclude = {
  authority: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

const reportWithActionsInclude = {
  ...reportInclude,
  authorityActions: {
    include: actionInclude,
    orderBy: {
      createdAt: "desc",
    },
  },
};

const createAuthorityAction = async (authorityId, reportId, action, remarks) => {
  if (!authorityId) {
    throw new ApiError(401, "Authority ID is required");
  }

  if (!reportId) {
    throw new ApiError(401, "Report ID is required");
  }

  if (!action) {
    throw new ApiError(401, "Authority action is required");
  }

  if (!remarks) {
    throw new ApiError(401, "Remarks are required");
  }

  const allowedFrom = ALLOWED_TRANSITIONS[action];

  if (!allowedFrom) {
    throw new ApiError(400, `Unknown authority action: ${action}`);
  }

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.report.updateMany({
      where: {
        id: reportId,
        status: { in: allowedFrom },
      },
      data: {
        status: action,
        currentAuthorityId: authorityId,
      },
    });

    if (count === 0) {
      const current = await tx.report.findUnique({
        where: { id: reportId },
        select: { status: true },
      });

      if (!current) {
        throw new ApiError(404, "Report not found");
      }

      throw new ApiError(
        409,
        `Cannot ${action.toLowerCase()} a report that is ${current.status}. ` +
          `Allowed from: ${allowedFrom.join(", ")}.`,
      );
    }

    // Same transaction: the audit row exists if and only if the status moved.
    const authorityAction = await tx.authorityAction.create({
      data: {
        reportId,
        authorityId,
        action,
        remarks,
      },
      include: actionInclude,
    });

    const report = await tx.report.findUnique({
      where: { id: reportId },
      include: reportWithActionsInclude,
    });

    return { authorityAction, report };
  });
};

export { ALLOWED_TRANSITIONS, createAuthorityAction };