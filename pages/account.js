import Header from '@/components/Header';
import Center from '@/components/Center';
import { signIn, signOut, useSession } from 'next-auth/react';
import Button from '@/components/Button';
import styled from 'styled-components';
import WhiteBox from '@/components/WhiteBox';
import { RevealWrapper } from 'next-reveal';
import Input from '@/components/Input';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import ProductBox from '@/components/ProductBox';
import Tabs from '@/components/Tabs';
import SingleOrder from '@/components/SingleOrder';

const ColsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  margin: 40px 0;
  p {
    margin: 5px;
  }
`;

const CityHolder = styled.div`
  display: flex;
  gap: 5px;
`;

const WishedProductsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
`;

export default function AccountPage() {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [country, setCountry] = useState('');
  const [addressLoaded, setAddressLoaded] = useState(true);
  const [wishlistLoaded, setWishlistLoaded] = useState(true);
  const [orderLoaded, setOrderLoaded] = useState(true);
  const [wishedProducts, setWishedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Orders');
  const [orders, setOrders] = useState([]);
  const [SignUp, setSignUp] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);

  console.log(session);

  async function logout() {
    await signOut({
      callbackUrl: process.env.NEXT_PUBLIC_URL,
    });
  }

  async function login(email, password) {
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (res.status === 200) {
      setIsLogin(true);
      setSignUp(false);
      console.log(res);
    }
  }
  function saveAddress() {
    const data = { name, email, city, streetAddress, postalCode, country };
    axios.put('/api/address', data);
  }

  async function createAccount(email, password) {
    const data = { email, password };
    const res = await axios.put('/api/register', data);
    if (res.status === 200) {
      setSignUp(false);
    } else {
      return;
    }
  }

  function change() {
    setSignUp((prev) => !prev);
    setUserEmail('');
    setUserPassword('');
  }

  useEffect(() => {
    if (!session) {
      return;
    }
    setIsLogin(true);
    setAddressLoaded(false);
    setWishlistLoaded(false);
    setOrderLoaded(false);
    axios.get('/api/address').then((response) => {
      setName(response.data?.name || '');
      setEmail(response.data?.email || '');
      setCity(response.data?.city || '');

      setPostalCode(response.data?.postalCode);
      setStreetAddress(response.data?.streetAddress);
      setCountry(response.data?.country);
      setAddressLoaded(true);
      // console.log(country);
    });
    axios.get('/api/wishlist').then((response) => {
      setWishedProducts(response.data.map((wp) => wp.product));
      setWishlistLoaded(true);
    });
    axios.get('/api/orders').then((response) => {
      setOrders(response.data);
      // console.log(orders);
      setOrderLoaded(true);
    });
  }, [session]);
  function productRemovedFromWishlist(idToRemove) {
    setWishedProducts((products) => {
      return [...products.filter((p) => p._id.toString() !== idToRemove)];
    });
  }
  return (
    <>
      <Header />
      <Center>
        <ColsWrapper>
          <div>
            <RevealWrapper delay={0}>
              <WhiteBox>
                <Tabs
                  tabs={['Orders', 'Wishlist']}
                  active={activeTab}
                  onChange={setActiveTab}
                />
                {activeTab === 'Orders' && (
                  <>
                    {!orderLoaded && <Spinner fullWidth={true} />}
                    {orderLoaded && (
                      <div>
                        {isLogin ? (
                          orders.length > 0 ? (
                            orders.map((o) => <SingleOrder {...o} />)
                          ) : (
                            <p>nothing here</p>
                          )
                        ) : (
                          <p>登录查看订单</p> //Login to see your orders
                        )}
                      </div>
                    )}
                  </>
                )}
                {activeTab === 'Wishlist' && (
                  <>
                    {!wishlistLoaded && <Spinner fullWidth={true} />}
                    {wishlistLoaded && (
                      <>
                        <WishedProductsGrid>
                          {wishedProducts.length > 0 &&
                            wishedProducts.map((wp) => (
                              <ProductBox
                                key={wp._id}
                                {...wp}
                                wished={true}
                                onRemoveFromWishlist={
                                  productRemovedFromWishlist
                                }
                              />
                            ))}
                        </WishedProductsGrid>
                        {wishedProducts.length === 0 && (
                          <>
                            {session && <p>Your wishlist is empty</p>}
                            {!session && (
                              <p>Login to add products to your wishlist</p>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </WhiteBox>
            </RevealWrapper>
          </div>
          <div>
            <RevealWrapper delay={100}>
              <WhiteBox>
                <h2>
                  {session
                    ? 'Account details'
                    : SignUp
                    ? '创建账户' //Create account
                    : '登录'}
                </h2>
                {!addressLoaded && <Spinner fullWidth={true} />}
                {addressLoaded && session && (
                  <>
                    <Input
                      type='text'
                      placeholder='Name'
                      value={name}
                      name='name'
                      onChange={(ev) => setName(ev.target.value)}
                    />
                    <Input
                      type='text'
                      placeholder='Email'
                      value={email}
                      name='email'
                      onChange={(ev) => setEmail(ev.target.value)}
                    />
                    <CityHolder>
                      <Input
                        type='text'
                        placeholder='City'
                        value={city}
                        name='city'
                        onChange={(ev) => setCity(ev.target.value)}
                      />
                      <Input
                        type='text'
                        placeholder='Postal Code'
                        value={postalCode}
                        name='postalCode'
                        onChange={(ev) => setPostalCode(ev.target.value)}
                      />
                    </CityHolder>
                    <Input
                      type='text'
                      placeholder='Street Address'
                      value={streetAddress}
                      name='streetAddress'
                      onChange={(ev) => setStreetAddress(ev.target.value)}
                    />
                    <Input
                      type='text'
                      placeholder='Country'
                      value={country}
                      name='country'
                      onChange={(ev) => setCountry(ev.target.value)}
                    />
                    <Button black block onClick={saveAddress}>
                      Save
                    </Button>
                    <hr />
                  </>
                )}
                {session && (
                  <Button primary onClick={logout}>
                    登出
                  </Button>
                )}
                {!session && SignUp && (
                  <>
                    <Input
                      type='text'
                      placeholder='Email'
                      value={userEmail}
                      name='userEmail'
                      onChange={(ev) => setUserEmail(ev.target.value)}
                    />

                    <Input
                      type='password'
                      placeholder='Password'
                      value={userPassword}
                      name='userPassword'
                      onChange={(ev) => setUserPassword(ev.target.value)}
                    />
                    <Button
                      login
                      onClick={() => createAccount(userEmail, userPassword)}
                    >
                      创建
                    </Button>
                  </>
                )}
                {!session && !SignUp && (
                  <>
                    <Input
                      type='text'
                      placeholder='Email'
                      value={userEmail}
                      name='userEmail'
                      onChange={(ev) => setUserEmail(ev.target.value)}
                    />

                    <Input
                      type='password'
                      placeholder='Password'
                      value={userPassword}
                      name='userPassword'
                      onChange={(ev) => setUserPassword(ev.target.value)}
                    />
                    <Button
                      login
                      onClick={() => login(userEmail, userPassword)}
                    >
                      登录
                    </Button>
                  </>
                )}
                <Button sm onClick={change}>
                  {!isLogin && (SignUp ? 'Login' : 'Create account')}
                </Button>
              </WhiteBox>
            </RevealWrapper>
          </div>
        </ColsWrapper>
      </Center>
    </>
  );
}
