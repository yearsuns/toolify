import { MetadataRoute } from "next";
import { supportedLanguages } from "@/utils/locale";
import { tools } from "@/data/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://toolify-app.vercel.app";
  const currentDate = new Date();
  
  const urls: MetadataRoute.Sitemap = [];
  
  // Add homepage for each language
  supportedLanguages.forEach((lang) => {
    urls.push({
      url: `${baseUrl}/${lang}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(
          supportedLanguages.map((l) => [l, `${baseUrl}/${l}`])
        ),
      },
    });
  });
  
  // Add tool pages for each language
  tools.forEach((tool) => {
    supportedLanguages.forEach((lang) => {
      urls.push({
        url: `${baseUrl}/${lang}${tool.path}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            supportedLanguages.map((l) => [l, `${baseUrl}/${l}${tool.path}`])
          ),
        },
      });
    });
  });
  
  return urls;
}

