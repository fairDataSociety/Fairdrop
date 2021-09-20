// Copyright 2019 The FairDataSociety Authors
// This file is part of the FairDataSociety library.
//
// The FairDataSociety library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The FairDataSociety library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the FairDataSociety library. If not, see <http://www.gnu.org/licenses/>.

import React from 'react'
import Text from '../../../components/atoms/text/Text'
import styles from './AboutTermsOfUsageScreen.module.css'

const AboutTermsOfUsageScreen = () => {
  return (
    <div className={styles.container}>
      <Text className={styles.headline} element="h1" size="l" weight="500" align="center">
        Terms of Usage
      </Text>

      <div className={styles.section}>
        <Text className={styles.p} align="center">
          Present clarification expressly states that the provided not for profit, Fairdrop platform, created by
          independent developers, offers ‘’BETA VERSION’’, experimental services and is known to contain possible bugs
          and stability issues. Testing is the only purpose behind using the platform and independent developers working
          on it disclaim any liability for data loss, damage, or loss of profits incurred through use of the beta
          platform. Likewise, the developers disclaim all express and implied warranties for the application under test
          and the tester uses the app at their own risk. Furthermore, all future beta updates are subject to the same
          terms.
        </Text>
      </div>

      <div className={styles.section}>
        <Text className={styles.p} align="center">
          Disclaimer of Liability and Warranties
        </Text>

        <Text className={styles.p} align="center">
          IN NO EVENT SHALL THE FAIRDROP PLATFORM OR ITS INDEPENDENT DEVELOPERS AND SUPPLIERS BE LIABLE FOR ANY DAMAGES
          WHATSOEVER (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF PROFITS, BUSINESS INTERRUPTION, LOSS OF
          INFORMATION) ARISING OUT OF THE USE OF OR INABILITY TO USE THE SOFTWARE, EVEN IF THE FAIRDROP PLATFORM
          PROVIDER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
        </Text>
      </div>

      <div className={styles.section}>
        <Text className={styles.p} align="center">
          Users Commitments
        </Text>

        <Text className={styles.p} align="center">
          By using Fairdrop Beta Release you agree to report any flaws, errors or imperfections discovered on the
          platform or other materials where the user – Beta Tester has been granted access to the Fairdrop Beta Release.
          The user understands that prompt and accurate reporting is the purpose of the Fairdrop Beta Release and
          undertakes to use best efforts to provide frequent reports on all aspects of the product both positive and
          negative and acknowledges that any improvements, modifications and changes arising from or in connection with
          the Beta Testers contribution to the Fairdrop Project, remain or become the exclusive property of the
          Disclosing Party.
        </Text>
      </div>

      <div className={styles.section}>
        <Text className={styles.p} align="center">
          Privacy
        </Text>

        <Text className={styles.p} align="center">
          Fairdrop platform collects no data of its users whatsoever. It traces no cookies and makes use of no
          analytical tools. The privacy policy applied by Fairdata society and thus Fairdrop platform is radical
          minimization of data.
        </Text>

        <Text className={styles.p} align="center">
          You agree and acknowledge that these Terms and Conditions may change from time to time and you will review
          them periodically.
        </Text>
      </div>
    </div>
  )
}

export default React.memo(AboutTermsOfUsageScreen)
