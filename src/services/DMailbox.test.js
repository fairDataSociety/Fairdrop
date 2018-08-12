import DMailbox from './DMailbox';

it('should persist mailbox', ()=>{
  new DMailbox().create('bobby').then((mailbox)=>{
    expect(mailbox.subdomain).toEqual('bobby');
  });

  let mb = new DMailbox().get('bobby');

  expect(mb.subdomain).toEqual('bobby');
});