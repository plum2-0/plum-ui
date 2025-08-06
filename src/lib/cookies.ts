/**
 * Client-side cookie utilities
 */

/**
 * Get projectId from cookies in browser environment
 */
export function getProjectIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const projectCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("project_id=")
  );

  if (!projectCookie) return null;

  return projectCookie.split("=")[1];
}

/**
 * Get projectId from request cookies in server environment
 */
export function getProjectIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  const projectCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("project_id=")
  );

  if (!projectCookie) return null;

  return projectCookie.split("=")[1];
}

/**
 * Get brandId from cookies in browser environment
 */
export function getBrandIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const brandCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("brand_id=")
  );

  if (!brandCookie) return null;

  return brandCookie.split("=")[1];
}

/**
 * Get brandId from request cookies in server environment
 */
export function getBrandIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  const brandCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("brand_id=")
  );

  if (!brandCookie) return null;

  return brandCookie.split("=")[1];
}
