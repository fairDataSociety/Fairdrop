import { DEVICE_SIZE } from '../../../theme/theme'
import styled from 'styled-components/macro'

export const Container = styled.div`
  width: 100%;
  height: 100%;
  @media (min-width: ${DEVICE_SIZE.TABLET}) {
    display: flex;
    align-items: flex-start;
    box-sizing: border-box;
  }
`

export const Content = styled.div`
  flex: 1;
  height: 100%;
  overflow: auto;
`

export const Tooltip = styled.div`
  z-index: 199;
`
