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
  const authHeader = req.headers.get("Authorization");

  if (!backendUrl) {
    return NextResponse.json(
      { message: "Missing MEDUSA_BACKEND_URL configuration" },
      { status: 500 },
    );
  }

  const authorization = secretKey ? `Bearer ${secretKey}` : authHeader;

  if (!authorization) {
    return NextResponse.json(
      { message: "Missing authentication" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();

    // Call Medusa Admin API to create fulfillment
    const res = await fetch(
      `${backendUrl}/admin/orders/${orderId}/fulfillments`,
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
    console.error("Error creating fulfillment:", error);
    return NextResponse.json(
      { message: "Failed to create fulfillment" },
      { status: 500 },
    );
  }
}
