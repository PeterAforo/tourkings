import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizePackageImages, sanitizeUnsplashImageUrl } from "@/lib/site-content-defaults";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const destination = await db.destination.findUnique({
      where: { slug },
      include: {
        packages: {
          where: { active: true },
          include: { destination: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!destination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    const packages = destination.packages.map((p) => ({
      ...p,
      images: sanitizePackageImages(p.images),
    }));

    return NextResponse.json({
      destination: {
        ...destination,
        imageUrl: destination.imageUrl
          ? sanitizeUnsplashImageUrl(destination.imageUrl)
          : null,
        packages,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch destination" }, { status: 500 });
  }
}
