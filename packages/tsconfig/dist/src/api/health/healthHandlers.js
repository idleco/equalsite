import { asyncHandler } from "../../middleware/asyncHandler";
export const showHealth = asyncHandler((_request, response) => {
    return response.json({
        ok: true,
    });
});
//# sourceMappingURL=healthHandlers.js.map