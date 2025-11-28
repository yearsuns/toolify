import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidLanguage, defaultLanguage, getLanguageFromPath, removeLanguageFromPath } from "@/utils/locale";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip static resources and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap") ||
    pathname.includes("/.well-known/") // Skip .well-known requests (Chrome DevTools, etc.)
  ) {
    return NextResponse.next();
  }
  
  // Extract language from path
  const pathLanguage = getLanguageFromPath(pathname);
  
  // If path doesn't have language prefix, redirect to path with language prefix
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  
  if (!isValidLanguage(firstSegment)) {
    // Prioritize reading language preference from cookie, if not available try browser language detection, finally use default language
    const cookieLanguage = request.cookies.get("language")?.value;
    let language: string = defaultLanguage;
    
    if (isValidLanguage(cookieLanguage)) {
      // Use language preference saved in cookie
      language = cookieLanguage;
    } else {
      // Try to detect language from browser Accept-Language header
      const acceptLanguage = request.headers.get("accept-language");
      if (acceptLanguage) {
        // Parse Accept-Language header, e.g.: "en-US,en;q=0.9,zh-CN;q=0.8"
        const languages = acceptLanguage
          .split(",")
          .map((lang) => lang.split(";")[0].trim().toLowerCase().split("-")[0]);
        
        // Find first supported language
        for (const lang of languages) {
          if (isValidLanguage(lang)) {
            language = lang;
            break;
          }
        }
      }
    }
    
    // Build new URL
    const newPath = `/${language}${pathname === "/" ? "" : pathname}`;
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    
    // Redirect to path with language prefix
    const response = NextResponse.redirect(url);
    
    // Set language cookie
    response.cookies.set("language", language, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });
    
    // Set path to response header for server components to use (extract language from path)
    response.headers.set("x-pathname", newPath);
    
    return response;
  }
  
  // Path already has language prefix, continue processing
  const response = NextResponse.next();
  
  // Update cookie (if language changed)
  const cookieLanguage = request.cookies.get("language")?.value;
  if (cookieLanguage !== pathLanguage) {
    response.cookies.set("language", pathLanguage, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });
  }
  
  // Set path to response header for not-found.tsx to use
  response.headers.set("x-pathname", pathname);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt
     * - sitemap files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap).*)",
  ],
};

