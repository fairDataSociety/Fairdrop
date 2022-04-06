import { DEVICE_SIZE } from '../../../theme/theme'
import styled from 'styled-components/macro'

export const Container = styled.div`
  @media (min-width: ${DEVICE_SIZE.TABLET}) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-start;
    box-sizing: border-box;
  }
`

export const Content = styled.div`
  flex: 1;
  padding: 24px 40px 24px 24px;
  height: 100%;
  overflow: auto;
`

export const Tooltip = styled.div`
  z-index: 199;
`
