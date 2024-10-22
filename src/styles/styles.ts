import styled, { css } from 'styled-components'

export const HomeContainer = styled.div<{ $primary?: boolean }>`
height: calc(100vh - 200px);
`

// Navbar
export const NavbarContainer = styled.nav<{ $primary?: boolean }>`
display: flex;
justify-content: center;
align-items: center;
width: 100%;
height: 200px;
border-radius: 0 0 2rem 2rem;
box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.15);
background-color: rgba(255, 255, 255, .5);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
position: sticky;
top: 0;
transition: .3s;

&>span {
  font-size: 72px;
  font-weight: bold;
  color: #417BE8;
}

@media (max-width: 400px) {
  height: 80px;

  &>span {
    font-size: 32px;
  }
}

@media (prefers-color-scheme: dark) {
  background-color: #2F2F2F;
  transition: .3s;
}
`

// Order
export const OrderFlex = styled.div<{ $primary?: boolean }>`
display: flex;
flex-direction: column;
gap: 1rem;
width: 100%;
max-height: 90%;
padding: .5rem;
overflow-y: auto;

&::-webkit-scrollbar {
  display: none;
}
`

export const OrderCardFlex = styled.button<{ $primary?: string }>`
display: flex;
justify-content: space-between;
align-items: center;
background-color: white;
border: unset;
width: 100%;
height: max-content;
border-radius: .5rem;
padding: 1rem;
box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
border-bottom: 5px inset transparent;
color: black;
transition: .3s;
cursor: pointer;

&>div:nth-child(1) {
display: flex;
flex-direction: column;
align-items: start;
gap: .5rem;

&>svg {
  font-size: 18px;
}

&>h5 {
  font-weight: bold;
  margin-bottom: unset;
}
}

&>div:nth-child(1)>div:nth-child(2) {
  display: flex;
  align-items: center;
  gap: .5rem;
}

${props => props.$primary === '1' ?
    css`
    border-radius: .5rem .5rem 0 0;
    border-bottom-color: #EEA436;
    transition: .3s;
`
    :
    props.$primary === '2' &&
    css`
    border-radius: .5rem .5rem 0 0;
    border-bottom-color: #32D360;
    transition: .3s;
`
  }

&:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transition: .3s;
}

&:focus {
  outline: unset;
}

@media (prefers-color-scheme: dark) {
  background-color: #4A4A4A;
  color: #fff;

  ${props => props.$primary === '1' ?
    css`
    border-radius: .5rem .5rem 0 0;
    border-bottom-color: #FDEBD0;
    transition: .3s;
`
    :
    props.$primary === '2' &&
    css`
    border-radius: .5rem .5rem 0 0;
    border-bottom-color: #D5F5E3;
    transition: .3s;
`
  }
}
`

// Queue
export const QueueContainer = styled.section<{ $primary?: boolean }>`
margin: 3rem 2rem 2rem 2rem;
height: max-content;

&>span {
  font-size: 42px;
  font-weight: bold;
  margin: 3rem 0 0 0;
}
`

export const QueueFlex = styled.div<{ $primary?: boolean }>`
display: flex;
flex-direction: column;
gap: 1rem;
padding: .5rem;
`

export const QueueCard = styled.button<{ $primary?: string }>`
display: flex;
justify-content: space-between;
align-items: center;
background-color: white;
border: unset;
width: 100%;
height: max-content;
border-radius: .5rem;
padding: 1rem;
box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
border-bottom: 5px inset transparent;
color: black;
transition: .3s;
cursor: pointer;

&>div:nth-child(1) {
display: flex;
flex-direction: column;
align-items: start;
gap: 1rem;
}

&>div:nth-child(1)>div:nth-child(1) {
  display: flex;
  align-items: center;
  gap: .5rem;

  &>svg {
    font-size: 24px;
  }

  &>h3 {
    margin-bottom: unset;
  }
}

&:focus {
  outline: unset;
}

&>span {
  font-size: 14px;
}

${props => props.$primary === '1' ?
    css`
    border-radius: .5rem .5rem 0 0;
    border-bottom-color: #EEA436;
    transition: .3s;
`
    :
    props.$primary === '2' ?
      css`
    border-radius: .5rem .5rem 0 0;
    border-bottom-color: #32D360;
    transition: .3s;
`
      :
      props.$primary === '3' &&
      css`
    border-radius: .5rem .5rem 0 0;
    border-bottom-color: #E74C3C;
    transition: .3s;
`
  }

@media (prefers-color-scheme: dark) {
  background-color: #4A4A4A;
  color: #fff;

  ${props => props.$primary === '1' ?
    css`
    border-radius: .5rem .5rem 0 0;
    border-bottom-color: #FDEBD0;
    transition: .3s;
`
    :
    props.$primary === '2' ?
      css`
    border-radius: .5rem .5rem 0 0;
    border-bottom-color: #D5F5E3;
    transition: .3s;
`
      :
      props.$primary === '3' &&
      css`
    border-radius: .5rem .5rem 0 0;
    border-bottom-color: #EABFBB;
    transition: .3s;
`
  }
}
`

/* Loading */
export const LoadingFlex = styled.div<{ $primary?: string }>`
display: flex;
flex-direction: column;
align-items: end;
justify-content: space-between;
gap: .3rem;
height: ${props => props.$primary === '1' ? '50px' : 'unset'};
`

/* No data */
export const NodataFlex = styled.div<{ $primary?: boolean }>`
display: flex;
align-items: center;
justify-content: center;
flex-direction: column;
height: 100%;

&>span {
  font-size: 42px;
   font-size: 42px;
  display: inline-block;
  padding: 20px 30px;
  // border: 2px solid #4A90E2; 
  border-radius: 20px; 
  background: linear-gradient(145deg, #ffffff, #f5f5f5); 
  color: #338; 
  box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.5); 
  text-align: center;
  // font-weight: bold;
}

${props => props.$primary && css`
  margin-top: 30%;
`}
`

export const NodataImg = styled.div<{ $primary?: boolean }>`
svg {
  max-width: 600px;
  max-height: 600px;
  width: 600px;
  height: 600px;
  animation: fadeop .3s linear;
}

@keyframes fadeop {
  from {
    opacity: 0;
    transform: scale(.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
`

/* wait */
export const TopOfWaiting = styled.section<{ $primary?: boolean }>`
display: flex;
justify-content: center;
align-items: center;
flex-direction: column;
height: max-content;
width: 100%;

${props => props.$primary && css`
  margin: 3rem 0 1.5rem 0;
`}

&>svg {
  max-height: 400px;
  overflow: hidden;
}

&>span {
  font-size: 32px;
}
`

export const Reorder = styled.button`
display: flex;
justify-content: center;
align-items: center;
position: absolute;
bottom: 50px;
right: 50px;
width: 80px;
height: 80px;
border-radius: 50%;
border: none;
background-color: #417BE8;

&:hover {
  background-color: #3260B7;
  transform: scale(1.15);
  transition: .3s;
}

&:focus {
  outline: none;
}

&>svg {
  font-size: 40px;
  color: white;
}
`

export const BinlowFlex = styled.div`
display: flex;
flex-direction: column;
gap: 1rem;

&>div:nth-child(1) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
`

export const DispensingOrder = styled.div`

`