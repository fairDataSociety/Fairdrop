import React from 'react'
import styled from 'styled-components/macro'
import { DEVICE_SIZE } from '../../../../theme/theme'
import { Box, Text, ClipboardInput, TableFiles } from '../../../../components'
import myHonesInbox from './myHonestInbox.svg'

const Content = styled(Box)`
  position: relative;

  @media (max-width: ${DEVICE_SIZE.LAPTOP}) {
    flex-direction: column;
  }
`

const Image = styled.img`
  width: 310px;
  height: 200px;
`

const mockData = [
  {
    to: 'porlocual',
    from: 'mancas',
    hash: {
      address: '6f7545405f2d6bb27eb538487080d48c106077611b633993090b43d88ba6b6ef',
      file: { name: 'MicrosoftTeams-image.png', type: 'image/png', size: 5513 },
      time: 1645613738695,
      iv: '0x01c52bfa9bac75d124a40856e8992625',
      meta: { name: 'MicrosoftTeams-image.png', type: 'image/png', size: 5513 },
    },
  },
  {
    to: 'porlocual',
    from: 'porlocual',
    hash: {
      address: 'e196ff19a29b3f159d3beb37df60c8519683c0dc0e98bf4bbdd4bee1b45c6a4a',
      file: { name: '--nadal.png', type: 'image/png', size: 102321 },
      time: 1645613505080,
      iv: '0x95b36da29abfea0bff2157d6401ed485',
      meta: { name: '--nadal.png', type: 'image/png', size: 102321 },
    },
  },
]

const DashboardHonestScreen = () => {
  return (
    <Box padding="40px 24px" direction="column" gap="12px">
      <Text className="title" size="ml" weight="600" variant="black">
        Your Personal URL
      </Text>
      <ClipboardInput value="blablabla.com" />

      {mockData.length > 0 ? (
        <Box margin="58px 0 0" fitWidth>
          <TableFiles messages={mockData} hideFrom onClick={() => console.log('Click')} />
        </Box>
      ) : (
        <Content gap="48px" margin="100px 0 0" padding="0 48px" vAlign="center">
          <Image src={myHonesInbox} />
          <Box className="content-text" direction="column" gap="16px">
            <Text className="content-title" size="xl" weight="600" variant="black">
              What is My honest inbox about?
            </Text>
            <Text size="ml" weight="300" variant="black">
              {
                // eslint-disable-next-line quotes
                "It's your personal inbox to receive files anonimously from anyone. Simply copy your personal url and share it with your community."
              }
            </Text>
          </Box>
        </Content>
      )}
    </Box>
  )
}

export default React.memo(DashboardHonestScreen)
