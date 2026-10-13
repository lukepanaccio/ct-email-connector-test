import GenericHandler from '../handlers/generic.handler.js';
import { logger } from '../utils/logger.utils.js';
import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants.js';
import {
  getOrderAndCustomer,
  toEmailLineItem,
  buildOrderDetails,
} from '../utils/order-details.utils.js';

class OrderRefundHandler extends GenericHandler {
  constructor() {
    super();
  }

  async process(messageBody) {
    logger.info(JSON.stringify(messageBody));
    const senderEmailAddress = process.env.SENDER_EMAIL_ADDRESS;
    const templateId = process.env.ORDER_REFUND_TEMPLATE_ID;

    const orderId = messageBody.resource.id;
    const { order, customer } = await getOrderAndCustomer(orderId);
    const returnedLineItemIds = order.returnInfo
      .flatMap((returnInfo) => returnInfo.items)
      .map((item) => item.lineItemId);
    const returnedLineItems = order.lineItems
      .filter((lineItem) => returnedLineItemIds.includes(lineItem.id))
      .map(toEmailLineItem);

    if (returnedLineItems.length === 0) {
      throw new CustomError(
        HTTP_STATUS_BAD_REQUEST,
        `No returned line item is found for order ${orderId}`
      );
    }

    const orderDetails = buildOrderDetails(order, customer, returnedLineItems);
    logger.info(
      `Ready to send order state change email : customerEmail=${orderDetails.customerEmail}, orderNumber=${orderDetails.orderNumber}, customerMiddleName=${orderDetails.customerMiddleName}, customerCreationTime=${orderDetails.orderCreationTime}`
    );
    await super.sendMail(
      senderEmailAddress,
      orderDetails.customerEmail,
      templateId,
      orderDetails
    );
    logger.info(
      `Order state change email has been sent to ${orderDetails.customerEmail}.`
    );
  }
}
export default OrderRefundHandler;
