import { NextRequest, NextResponse } from "next/server";

interface IpApiResponse {
  query: string;
  status: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  message?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ip = searchParams.get("ip");

  try {
    // If no IP provided, use ip-api.com to get client IP
    const apiUrl = ip
      ? `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
      : `http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;

    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch IP information");
    }

    const data: IpApiResponse = await response.json();

    if (data.status === "fail") {
      return NextResponse.json(
        { error: data.message || "IP lookup failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ip: data.query,
      country: data.country || "",
      countryCode: data.countryCode || "",
      region: data.regionName || data.region || "",
      regionCode: data.region || "",
      city: data.city || "",
      postalCode: data.zip || "",
      latitude: data.lat || null,
      longitude: data.lon || null,
      timezone: data.timezone || "",
      isp: data.isp || "",
      organization: data.org || "",
      asn: data.as || "",
    });
  } catch (error) {
    console.error("IP lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup IP address" },
      { status: 500 }
    );
  }
}

