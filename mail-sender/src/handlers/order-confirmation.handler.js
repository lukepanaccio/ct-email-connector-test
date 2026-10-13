import GenericHandler from '../handlers/generic.handler.js';
import { logger } from '../utils/logger.utils.js';
import {
  getOrderAndCustomer,
  toEmailLineItem,
  buildOrderDetails,
} from '../utils/order-details.utils.js';

class OrderConfirmationHandler extends GenericHandler {
  constructor() {
    super();
  }

  async process(messageBody) {
    logger.info(JSON.stringify(messageBody));
    const senderEmailAddress = process.env.SENDER_EMAIL_ADDRESS;
    const templateId = process.env.ORDER_CONFIRMATION_TEMPLATE_ID;

    const { order, customer } = await getOrderAndCustomer(
      messageBody.resource.id
    );
    const orderDetails = buildOrderDetails(
      order,
      customer,
      order.lineItems.map(toEmailLineItem)
    );

    logger.info(
      `Ready to send order confirmation email of customer registration : customerEmail=${orderDetails.customerEmail}, orderNumber=${orderDetails.orderNumber}, customerMiddleName=${orderDetails.customerMiddleName}, customerCreationTime=${orderDetails.orderCreationTime}`
    );
    await super.sendMail(
      senderEmailAddress,
      orderDetails.customerEmail,
      templateId,
      orderDetails
    );
    logger.info(
      `Confirmation email of customer registration has been sent to ${orderDetails.customerEmail}.`
    );
  }
}
export default OrderConfirmationHandler;
