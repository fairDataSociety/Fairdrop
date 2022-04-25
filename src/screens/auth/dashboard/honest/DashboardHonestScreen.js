import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { DEVICE_SIZE } from '../../../../theme/theme'
import { Box, Text, TableFiles } from '../../../../components'
import myHonesInbox from './assets/myHonestInbox.svg'
import { useMailbox } from '../../../../hooks/mailbox/useMailbox'
import { toast } from 'react-toastify'
import WorkingLayout from '../../../../components/layout/working/WorkingLayout'
import { MyHonestInbox } from './components/MyHonestInbox'
import Utils from '../../../../services/Utils'

const Container = styled(Box)`
  height: 100%;
  box-sizing: border-box;
`

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

const StyledMyHonestInbox = styled(MyHonestInbox)`
  margin-top: 40px;
  margin-bottom: 30px;
`

const DashboardHonestScreen = () => {
  const [{ received }, { getReceivedMessages }] = useMailbox()
  const [isFetchingMessages, setIsFetchingMessages] = useState(true)

  const messagesAdapted = useMemo(() => {
    return received.filter(Utils.isAnonymousMessage).sort((a, b) => {
      return b?.hash?.time - a?.hash?.time
    })
  }, [received])

  useEffect(() => {
    getReceivedMessages()
      .then(() => {
        setIsFetchingMessages(false)
      })
      .catch(() => {
        toast.error('🔥 Something went wrong while trying to retrieve your sent files :(')
        setIsFetchingMessages(false)
      })
  }, [])

  if (isFetchingMessages && messagesAdapted.length === 0) {
    return <WorkingLayout headline="We are getting your data..." />
  }

  return (
    <Container direction="column" gap="12px">
      {messagesAdapted.length > 0 ? (
        <TableFiles messages={messagesAdapted} hideFrom onClick={() => console.log('Click')}>
          <StyledMyHonestInbox />
        </TableFiles>
      ) : (
        <>
          <StyledMyHonestInbox />
          <Content gap="48px" margin="100px 0 0" padding="0 48px" vAlign="center">
            <Image src={myHonesInbox} />
            <Box className="content-text" direction="column" gap="16px">
              <Text className="content-title" size="xl" weight="600" variant="black">
                What is My honest inbox about?
              </Text>
              <Text size="ml" weight="300" variant="black">
                {
                  "It's your personal inbox to receive files anonimously from anyone. Simply copy your personal url and share it with your community."
                }
              </Text>
            </Box>
          </Content>
        </>
      )}
    </Container>
  )
}

export default React.memo(DashboardHonestScreen)
