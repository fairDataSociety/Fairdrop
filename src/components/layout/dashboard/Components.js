import { DEVICE_SIZE } from '../../../theme/theme'
import styled from 'styled-components/macro'

export const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  box-sizing: border-box;

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    flex-direction: column;
  }
`

export const Content = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
  overflow: auto;

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    width: 100%;
  }
`

export const Tooltip = styled.div`
  z-index: 199;
`
