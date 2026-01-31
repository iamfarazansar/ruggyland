import { AbstractPaymentProvider } from "@medusajs/framework/utils";
import { Logger } from "@medusajs/framework/types";
import Razorpay from "razorpay";
import crypto from "crypto";
import { MedusaError } from "@medusajs/framework/utils";
import type {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  PaymentSessionStatus,
  DeletePaymentInput,
  DeletePaymentOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/framework/types";
import { BigNumber, PaymentActions } from "@medusajs/framework/utils";

type Options = {
  key_id: string;
  key_secret: string;
  webhook_secret?: string;
  auto_capture?: boolean;
};

type InjectedDependencies = {
  logger: Logger;
};

class RazorpayPaymentProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "razorpay";

  protected logger_: Logger;
  protected options_: Options;
  protected razorpay_: Razorpay;

  constructor(container: InjectedDependencies, options: Options) {
    super(container, options);

    this.logger_ = container.logger;
    this.options_ = {
      auto_capture: true,
      ...options,
    };

    this.razorpay_ = new Razorpay({
      key_id: this.options_.key_id,
      key_secret: this.options_.key_secret,
    });
  }

  /**
   * Convert amount to smallest currency unit (e.g., paise for INR).
   * Handles both primitive numbers and BigNumber-like objects.
   */
  private toSmallestUnit(amount: unknown): number {
    let numericValue: number;

    if (typeof amount === "number") {
      numericValue = amount;
    } else if (typeof amount === "string") {
      numericValue = parseFloat(amount);
    } else if (amount && typeof amount === "object") {
      // Handle BigNumber-like objects
      if ("numeric" in amount) {
        numericValue = (amount as { numeric: number }).numeric;
      } else if ("value" in amount) {
        numericValue = Number((amount as { value: unknown }).value);
      } else {
        numericValue = Number(amount);
      }
    } else {
      numericValue = Number(amount);
    }

    if (isNaN(numericValue)) {
      this.logger_.error(`Invalid amount value: ${JSON.stringify(amount)}`);
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Invalid payment amount"
      );
    }

    return Math.round(numericValue * 100);
  }

  /**
   * Build order notes object with both medusa_payment_session_id and legacy session_id
   */
  private buildOrderNotes(sessionId?: string): Record<string, string> {
    const notes: Record<string, string> = {};
    if (sessionId) {
      notes.medusa_payment_session_id = sessionId;
      notes.session_id = sessionId; // Legacy fallback
    }
    return notes;
  }

  /**
   * Attempt to patch Razorpay order notes via REST API.
   * Does not throw on failure - logs warning instead.
   */
  private async patchOrderNotes(
    orderId: string,
    notes: Record<string, string>
  ): Promise<void> {
    try {
      const auth = Buffer.from(
        `${this.options_.key_id}:${this.options_.key_secret}`
      ).toString("base64");

      const response = await fetch(
        `https://api.razorpay.com/v1/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger_.warn(
          `Failed to patch Razorpay order notes for ${orderId}: ${response.status} - ${errorText}`
        );
      }
    } catch (error: any) {
      this.logger_.warn(
        `Failed to patch Razorpay order notes for ${orderId}: ${error.message}`
      );
    }
  }

  /**
   * Resolve Medusa session ID from webhook payload, fetching order if needed.
   * Priority: order notes > payment notes > fetch order notes
   */
  private async resolveSessionIdFromWebhook(
    paymentEntity: any,
    orderEntity: any
  ): Promise<string> {
    // 1. Check order entity notes first (preferred source)
    const orderNotes = orderEntity?.notes;
    if (orderNotes?.medusa_payment_session_id) {
      return orderNotes.medusa_payment_session_id;
    }
    if (orderNotes?.session_id) {
      return orderNotes.session_id;
    }

    // 2. Fallback to payment entity notes
    const paymentNotes = paymentEntity?.notes;
    if (paymentNotes?.medusa_payment_session_id) {
      return paymentNotes.medusa_payment_session_id;
    }
    if (paymentNotes?.session_id) {
      return paymentNotes.session_id;
    }

    // 3. If payment has order_id but no notes in payload, fetch the order
    const razorpayOrderId = paymentEntity?.order_id;
    if (razorpayOrderId) {
      try {
        const fetchedOrder = await this.razorpay_.orders.fetch(razorpayOrderId);
        const fetchedNotes = fetchedOrder?.notes as Record<string, string>;
        if (fetchedNotes?.medusa_payment_session_id) {
          return fetchedNotes.medusa_payment_session_id;
        }
        if (fetchedNotes?.session_id) {
          return fetchedNotes.session_id;
        }
      } catch (error: any) {
        this.logger_.warn(
          `Failed to fetch Razorpay order ${razorpayOrderId} for session resolution: ${error.message}`
        );
      }
    }

    return "";
  }

  static validateOptions(options: Record<any, any>): void | never {
    if (!options.key_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay key_id is required"
      );
    }
    if (!options.key_secret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay key_secret is required"
      );
    }
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    try {
      const { amount, currency_code } = input;
      const sessionId = input.data?.session_id as string | undefined;

      // If this is an update with Razorpay payment response data, preserve it
      if (input.data?.razorpay_payment_id && input.data?.razorpay_signature) {
        this.logger_.info("Updating payment session with Razorpay response data");
        return {
          id: input.data.razorpay_order_id as string,
          data: {
            ...input.data,
            key_id: this.options_.key_id,
          },
        };
      }

      // If we already have an order, don't create a new one
      if (input.data?.razorpay_order_id) {
        const existingOrderId = input.data.razorpay_order_id as string;
        this.logger_.info("Payment session already has Razorpay order ID");

        // If session_id is now available but wasn't before, try to patch order notes
        const existingSessionId = input.data?.medusa_payment_session_id as string;
        if (sessionId && !existingSessionId) {
          await this.patchOrderNotes(existingOrderId, this.buildOrderNotes(sessionId));
        }

        return {
          id: existingOrderId,
          data: {
            ...input.data,
            medusa_payment_session_id: sessionId,
            key_id: this.options_.key_id,
          },
        };
      }

      // Convert amount to smallest currency unit (paise for INR)
      const amountInSmallestUnit = this.toSmallestUnit(amount);

      this.logger_.info(`Creating Razorpay order: amount=${amountInSmallestUnit}, currency=${currency_code}`);

      const orderOptions = {
        amount: amountInSmallestUnit,
        currency: currency_code.toUpperCase(),
        receipt: `receipt_${Date.now()}`,
        notes: this.buildOrderNotes(sessionId),
      };

      const order = await this.razorpay_.orders.create(orderOptions);

      if (!order?.id) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Failed to create Razorpay order"
        );
      }

      return {
        id: order.id,
        data: {
          razorpay_order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          medusa_payment_session_id: sessionId,
          session_id: sessionId, // Legacy
          key_id: this.options_.key_id,
        },
      };
    } catch (error: any) {
      this.logger_.error("Razorpay initiatePayment error:", error);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to initiate Razorpay payment: ${error.message || error}`
      );
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    try {
      const razorpayOrderId = input.data?.razorpay_order_id as string;
      const razorpayPaymentId = input.data?.razorpay_payment_id as string;
      const razorpaySignature = input.data?.razorpay_signature as string;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Razorpay payment details are required for authorization"
        );
      }

      // Verify the payment signature: HMAC_SHA256(key_secret, order_id|payment_id)
      const generatedSignature = crypto
        .createHmac("sha256", this.options_.key_secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        throw new MedusaError(
          MedusaError.Types.UNAUTHORIZED,
          "Invalid Razorpay payment signature"
        );
      }

      // Fetch payment details
      const payment = await this.razorpay_.payments.fetch(razorpayPaymentId);

      if (payment.status === "captured") {
        return {
          data: {
            ...input.data,
            razorpay_payment_id: razorpayPaymentId,
            payment_status: payment.status,
          },
          status: "captured" as PaymentSessionStatus,
        };
      }

      return {
        data: {
          ...input.data,
          razorpay_payment_id: razorpayPaymentId,
          payment_status: payment.status,
        },
        status: "authorized" as PaymentSessionStatus,
      };
    } catch (error: any) {
      this.logger_.error("Razorpay authorizePayment error:", error);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to authorize Razorpay payment: ${error.message || error}`
      );
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    try {
      const razorpayPaymentId = input.data?.razorpay_payment_id as string;

      if (!razorpayPaymentId) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Razorpay payment ID is required for capture"
        );
      }

      // Fetch current payment status
      const payment = await this.razorpay_.payments.fetch(razorpayPaymentId);

      // If already captured, return success
      if (payment.status === "captured") {
        return {
          data: {
            ...input.data,
            payment_status: "captured",
          },
        };
      }

      // Capture the payment if authorized
      if (payment.status === "authorized") {
        const capturedPayment = await this.razorpay_.payments.capture(
          razorpayPaymentId,
          payment.amount,
          payment.currency
        );

        return {
          data: {
            ...input.data,
            payment_status: capturedPayment.status,
          },
        };
      }

      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Cannot capture payment in status: ${payment.status}`
      );
    } catch (error: any) {
      this.logger_.error("Razorpay capturePayment error:", error);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to capture Razorpay payment: ${error.message || error}`
      );
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    try {
      const razorpayPaymentId = input.data?.razorpay_payment_id as string;

      if (!razorpayPaymentId) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Razorpay payment ID is required for refund"
        );
      }

      // Convert amount to smallest currency unit
      const refundAmount = this.toSmallestUnit(input.amount);

      const refund = await this.razorpay_.payments.refund(razorpayPaymentId, {
        amount: refundAmount,
        speed: "normal",
        notes: {
          reason: "Customer refund request",
        },
      });

      return {
        data: {
          ...input.data,
          refund_id: refund.id,
          refund_status: refund.status,
        },
      };
    } catch (error: any) {
      this.logger_.error("Razorpay refundPayment error:", error);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to refund Razorpay payment: ${error.message || error}`
      );
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    // Razorpay doesn't support updating order amount once created
    // We must create a new order with the updated amount
    try {
      const { amount, currency_code } = input;
      const sessionId = (input.data?.medusa_payment_session_id ||
        input.data?.session_id) as string | undefined;

      // Convert amount to smallest currency unit (paise for INR)
      const amountInSmallestUnit = this.toSmallestUnit(amount);

      this.logger_.info(`Updating Razorpay order: amount=${amountInSmallestUnit}, currency=${currency_code}`);

      const orderOptions = {
        amount: amountInSmallestUnit,
        currency: currency_code.toUpperCase(),
        receipt: `receipt_${Date.now()}`,
        notes: this.buildOrderNotes(sessionId),
      };

      const order = await this.razorpay_.orders.create(orderOptions);

      return {
        data: {
          ...input.data,
          razorpay_order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          medusa_payment_session_id: sessionId,
          session_id: sessionId, // Legacy
        },
      };
    } catch (error: any) {
      this.logger_.error("Razorpay updatePayment error:", error);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to update Razorpay payment: ${error.message || error}`
      );
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    // Razorpay orders expire automatically if not paid
    return {
      data: input.data,
    };
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    try {
      const razorpayOrderId = input.data?.razorpay_order_id as string;
      const razorpayPaymentId = input.data?.razorpay_payment_id as string;

      if (razorpayPaymentId) {
        const payment = await this.razorpay_.payments.fetch(razorpayPaymentId);
        return {
          data: {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
          },
        };
      }

      if (razorpayOrderId) {
        const order = await this.razorpay_.orders.fetch(razorpayOrderId);
        return {
          data: {
            razorpay_order_id: razorpayOrderId,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
          },
        };
      }

      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay order or payment ID is required"
      );
    } catch (error: any) {
      this.logger_.error("Razorpay retrievePayment error:", error);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to retrieve Razorpay payment: ${error.message || error}`
      );
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    // Razorpay doesn't have a cancel order API
    // Orders expire automatically if not paid within the expiry time
    return {
      data: input.data,
    };
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    try {
      const razorpayPaymentId = input.data?.razorpay_payment_id as string;
      const razorpayOrderId = input.data?.razorpay_order_id as string;

      if (razorpayPaymentId) {
        const payment = await this.razorpay_.payments.fetch(razorpayPaymentId);

        switch (payment.status) {
          case "created":
            return { status: "pending" as PaymentSessionStatus };
          case "authorized":
            return { status: "authorized" as PaymentSessionStatus };
          case "captured":
            return { status: "authorized" as PaymentSessionStatus };
          case "refunded":
            return { status: "canceled" as PaymentSessionStatus };
          case "failed":
            return { status: "error" as PaymentSessionStatus };
          default:
            return { status: "pending" as PaymentSessionStatus };
        }
      }

      if (razorpayOrderId) {
        const order = await this.razorpay_.orders.fetch(razorpayOrderId);

        switch (order.status) {
          case "created":
            return { status: "pending" as PaymentSessionStatus };
          case "attempted":
            return { status: "pending" as PaymentSessionStatus };
          case "paid":
            return { status: "authorized" as PaymentSessionStatus };
          default:
            return { status: "pending" as PaymentSessionStatus };
        }
      }

      return { status: "pending" as PaymentSessionStatus };
    } catch (error: any) {
      this.logger_.error("Razorpay getPaymentStatus error:", error);
      return { status: "pending" as PaymentSessionStatus };
    }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    try {
      const { data, rawData, headers } = payload;

      // Verify webhook signature
      if (this.options_.webhook_secret) {
        const signature = headers?.["x-razorpay-signature"] as string;

        if (!signature) {
          this.logger_.error("Missing Razorpay webhook signature");
          return {
            action: PaymentActions.FAILED,
            data: {
              session_id: "",
              amount: new BigNumber(0),
            },
          };
        }

        const rawBodyString =
          typeof rawData === "string" ? rawData : rawData?.toString("utf8") || "";

        const expectedSignature = crypto
          .createHmac("sha256", this.options_.webhook_secret)
          .update(rawBodyString)
          .digest("hex");

        if (expectedSignature !== signature) {
          this.logger_.error("Invalid Razorpay webhook signature");
          return {
            action: PaymentActions.FAILED,
            data: {
              session_id: "",
              amount: new BigNumber(0),
            },
          };
        }
      }

      const event = data as any;
      const eventType = event?.event;
      const paymentEntity = event?.payload?.payment?.entity;
      const orderEntity = event?.payload?.order?.entity;

      // Resolve session ID: order notes first, then payment notes, then fetch order
      const sessionId = await this.resolveSessionIdFromWebhook(
        paymentEntity,
        orderEntity
      );

      // Amount comes from Razorpay in smallest unit (paise), convert to major units
      const amount = new BigNumber(
        (paymentEntity?.amount || orderEntity?.amount || 0) / 100
      );

      const payloadData = {
        session_id: sessionId,
        amount,
      };

      switch (eventType) {
        case "payment.authorized":
          return {
            action: PaymentActions.AUTHORIZED,
            data: payloadData,
          };

        case "payment.captured":
          return {
            action: PaymentActions.SUCCESSFUL,
            data: payloadData,
          };

        case "payment.failed":
          return {
            action: PaymentActions.FAILED,
            data: payloadData,
          };

        case "refund.created":
        case "refund.processed":
          return {
            action: PaymentActions.SUCCESSFUL,
            data: payloadData,
          };

        default:
          this.logger_.info(`Unhandled Razorpay webhook event: ${eventType}`);
          return {
            action: PaymentActions.NOT_SUPPORTED,
            data: payloadData,
          };
      }
    } catch (error: any) {
      this.logger_.error("Razorpay getWebhookActionAndData error:", error);
      return {
        action: PaymentActions.FAILED,
        data: {
          session_id: "",
          amount: new BigNumber(0),
        },
      };
    }
  }
}

export default RazorpayPaymentProviderService;
