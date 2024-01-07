import { PropagateLoader } from 'react-spinners';
import styled from 'styled-components';

const Wrapper = styled.div`
  ${(props) =>
    props.fullWidth
      ? `
    display:block;
    display:flex;
    justify-content:center;
    margin-top:200px
  `
      : `
    border: 5xp solid blue;
  `}
`;

export default function Spinner({ fullWidth }) {
  return (
    <Wrapper fullWidth={fullWidth}>
      <PropagateLoader speedMultiplier={1} color={'#555'} />
    </Wrapper>
  );
}
