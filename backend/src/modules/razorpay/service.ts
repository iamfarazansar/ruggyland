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
        this.logger_.info("Payment session already has Razorpay order ID");
        return {
          id: input.data.razorpay_order_id as string,
          data: {
            ...input.data,
            key_id: this.options_.key_id,
          },
        };
      }

      // Razorpay expects amount in smallest currency unit (paise for INR)
      const amountInSmallestUnit = Math.round(
        new BigNumber(amount).numeric * 100
      );

      const orderOptions = {
        amount: amountInSmallestUnit,
        currency: currency_code.toUpperCase(),
        receipt: `receipt_${Date.now()}`,
        notes: {
          session_id: input.data?.session_id as string,
        },
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
          session_id: input.data?.session_id,
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

      // Verify the payment signature
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

      // Amount in smallest currency unit
      const refundAmount = Math.round(new BigNumber(input.amount).numeric * 100);

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
    // Razorpay doesn't support updating orders once created
    // We need to create a new order with updated amount
    try {
      const { amount, currency_code } = input;

      const amountInSmallestUnit = Math.round(
        new BigNumber(amount).numeric * 100
      );

      const orderOptions = {
        amount: amountInSmallestUnit,
        currency: currency_code.toUpperCase(),
        receipt: `receipt_${Date.now()}`,
        notes: {
          session_id: input.data?.session_id as string,
        },
      };

      const order = await this.razorpay_.orders.create(orderOptions);

      return {
        data: {
          ...input.data,
          razorpay_order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
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

      const sessionId =
        paymentEntity?.notes?.session_id ||
        orderEntity?.notes?.session_id ||
        "";

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
