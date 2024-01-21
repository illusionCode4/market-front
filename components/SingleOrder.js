import styled from 'styled-components';

import axios from 'axios';
import { useState } from 'react';

const StyledOrder = styled.div`
  margin: 10px 0;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  time {
    font-size: 1rem;
    font-weight: bold;
    color: #555;
  }
`;

const TrackingInfo = styled.div`
  width: 3rem;
  font-weight: bold;
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 5px;
  margin: 0;
  background-color: skyblue;
  color: white;
`;

const ProductRow = styled.div`
  span {
    color: #aaa;
  }
`;

const Address = styled.div`
  font-size: 0.8rem;
  line-height: 1rem;
  margin-top: 5px;
  color: #888;
`;

const IsConfirmed = styled.button`
  color: #fff;
  font-size: 14px;
  font-weight: bold; /* 设置文字加粗 */
  padding: 8px; /* 设置内边距 */
  border-radius: 8px; /* 设置圆边框 */
  background: linear-gradient(to right, gray, #000);
  margin: 0;
  border: none;
`;

const IsConfirmedButton = styled.button`
  color: #fff;
  font-weight: bold;
  font-size: 14px;

  padding: 8px; /* 调整按钮的内边距 */
  margin: 0;
  border: none;
  border-radius: 8px;
  background: linear-gradient(to right, #9c27b0, #673ab7);
  cursor: pointer;
  transition: background-color 0.3s ease; /* 添加过渡效果 */

  &:hover {
    background: linear-gradient(
      to right,
      #7b1fa2,
      #512da8
    ); /* 鼠标悬停时的渐变色 */
  }
`;

const Paid = styled.span`
  color: green;
  margin-top: 5px;
  margin-bottom: 0px;
`;

const NotPaid = styled.span`
  color: red;
  margin-top: 5px;
  margin-bottom: 0px;
`;

const Rowdiv = styled.div`
  display: flex;
  gap: 60px;
`;
const ButtonRowDiv = styled.div`
  display: flex;

  justify-content: space-between;

  width: 100%;
`;

const CancelButton = styled.button`
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  padding: 8px; /* 调整按钮的内边距 */
  margin: 0;
  border: none;
  border-radius: 8px;
  background: linear-gradient(to right, gray, #000);
  cursor: pointer;
  transition: background-color 0.3s ease; /* 添加过渡效果 */

  &:hover {
    background: linear-gradient(to right, gray, #bbb); /* 鼠标悬停时的渐变色 */
  }
`;

const Div = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;

export default function SingleOrder({ line_items, createdAt, ...rest }) {
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(rest.confirmed);
  const [isOrderCanceled, setIsOrderCanceled] = useState(rest.canceled);
  const handleConfirm = async (id) => {
    const res = await axios.post('/api/orders', {
      action: 'confirm',
      id,
      confirmed: true,
    });
    setIsOrderConfirmed(true);
    // console.log(res);
  };
  const handleCancel = async (id) => {
    const res = await axios.post('/api/orders', {
      action: 'cancel',
      id,
      canceled: true,
    });
    setIsOrderCanceled(true);
    // console.log(res);
  };
  return (
    <StyledOrder>
      <Rowdiv>
        <div>
          <time>{new Date(createdAt).toLocaleString('sv-SE')}</time>
          <Address>
            {rest.name}
            <br />
            {rest.email}
            <br />
            {rest.streetAddress}
            <br />
            {rest.postalCode} {rest.city}, {rest.country}
          </Address>
          {!rest.paid ? (
            <NotPaid>Not Paid</NotPaid>
          ) : isOrderCanceled ? (
            <Paid>Refunded</Paid>
          ) : (
            <Paid>Paid</Paid>
          )}
        </div>
        <div>
          {line_items.map((item) => (
            <ProductRow key={item._id}>
              <span>{item.quantity} x </span>
              {item.price_data.product_data.name}
            </ProductRow>
          ))}
        </div>
      </Rowdiv>
      {rest.paid && (
        <ButtonRowDiv>
          {!isOrderConfirmed && !isOrderCanceled && (
            <TrackingInfo>
              {rest.delivered ? '快递单号:' + rest.deliver : '待发货'}
            </TrackingInfo>
          )}

          <Div>
            {!isOrderCanceled &&
              (isOrderConfirmed ? (
                <IsConfirmed>Confirmed</IsConfirmed>
              ) : (
                <IsConfirmedButton onClick={() => handleConfirm(rest._id)}>
                  confirm receipt
                </IsConfirmedButton>
              ))}
          </Div>
        </ButtonRowDiv>
      )}
      <Div>
        {rest.paid ? (
          !isOrderConfirmed &&
          (isOrderCanceled ? (
            <IsConfirmed>Canceled</IsConfirmed>
          ) : (
            <CancelButton onClick={() => handleCancel(rest._id)}>
              cancel order
            </CancelButton>
          ))
        ) : (
          <IsConfirmed>Canceled</IsConfirmed>
        )}
      </Div>
    </StyledOrder>
  );
}
