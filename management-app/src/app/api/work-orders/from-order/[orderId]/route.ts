import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    process.env.MEDUSA_BACKEND_URL;
  const secretKey = process.env.MEDUSA_SECRET_API_KEY;

  // If no secret key, try to get the auth token from the request
  const authHeader = req.headers.get("Authorization");

  if (!backendUrl) {
    return NextResponse.json(
      { message: "Missing MEDUSA_BACKEND_URL configuration" },
      { status: 500 },
    );
  }

  // Use secret key if available, otherwise pass through the auth header
  const authorization = secretKey ? `Bearer ${secretKey}` : authHeader;

  if (!authorization) {
    return NextResponse.json(
      { message: "Missing authentication" },
      { status: 401 },
    );
  }

  try {
    // Parse request body for priority
    let body = {};
    try {
      body = await req.json();
    } catch {
      // No body provided, use defaults
    }

    const res = await fetch(
      `${backendUrl}/admin/work-orders/from-order/${orderId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error creating work orders:", error);
    return NextResponse.json(
      { message: "Failed to create work orders" },
      { status: 500 },
    );
  }
}
