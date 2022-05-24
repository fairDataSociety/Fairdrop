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

export const routes = {
  root: '/',
  upload: {
    home: '/',
    flow: '/flow',
  },
  login: '/login',
  register: '/register',
  mailbox: {
    avatar: '/avatar',
    dashboard: '/mailbox',
    received: '/mailbox/received',
    sent: '/mailbox/sent',
    stored: '/mailbox/stored',
    consents: '/mailbox/consents',
    mailboxHones: '/mailbox/honest',
    honest: '/honest/:ens',
  },
  about: {
    root: '/about',
    fairdrop: '/about/fairdrop',
    fds: '/about/fair-data-society',
    faq: '/about/faq',
    terms: '/about/terms',
    bugs: '/about/bugs',
  },
  settings: {
    home: '/settings',
    import: '/settings/import',
    export: '/settings/export',
  },
  downloads: {
    single: '/download/:address/:name',
    multiple: '/download/list/:address',
  },
}
