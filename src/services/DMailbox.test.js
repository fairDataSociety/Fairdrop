import DMailbox from './DMailbox';

it('should persist mailbox', ()=>{
  new DMailbox().createSubdomain('bobby').then((mailbox)=>{
    expect(mailbox.subdomain).toEqual('bobby');
  });

  let mb = new DMailbox().get('bobby');

  expect(mb.subdomain).toEqual('bobby');
});