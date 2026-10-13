import { getOrderById, getCustomerById } from '../client/query.client.js';
import CustomError from '../errors/custom.error.js';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants.js';
import { convertMoneyToText } from './money.utils.js';
import { addImageSizeSuffix } from './image.utils.js';
import { IMAGE_SIZE_SMALL } from '../constants/image.constants.js';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CUSTOMER_NAME = 'Customer';

export async function getOrderAndCustomer(orderId) {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new CustomError(
      HTTP_STATUS_BAD_REQUEST,
      `Unable to get order details with order ID ${orderId}`
    );
  }
  const customer = order.customerId
    ? await getCustomerById(order.customerId)
    : undefined;
  return { order, customer };
}

export function toEmailLineItem(lineItem) {
  const image = lineItem.variant.images[0];
  return {
    productName: lineItem.name[DEFAULT_LOCALE],
    productQuantity: lineItem.quantity,
    productSku: lineItem.variant.sku,
    productImage: image ? addImageSizeSuffix(image.url, IMAGE_SIZE_SMALL) : '',
    productSubTotal: convertMoneyToText(lineItem.totalPrice),
  };
}

export function buildOrderDetails(order, customer, orderLineItems) {
  return {
    orderNumber: order.orderNumber || '',
    customerEmail: order.customerEmail || customer?.email,
    customerFirstName: customer?.firstName || DEFAULT_CUSTOMER_NAME,
    customerMiddleName: customer?.middleName || '',
    customerLastName: customer?.lastName || '',
    orderCreationTime: order.createdAt,
    orderState: order.orderState,
    orderShipmentState: order.shipmentState,
    orderTotalPrice: convertMoneyToText(order.totalPrice),
    orderTaxedPrice: order.taxedPrice
      ? convertMoneyToText(order.taxedPrice)
      : '',
    orderLineItems,
  };
}
