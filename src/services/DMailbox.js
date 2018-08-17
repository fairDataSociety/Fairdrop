import DEns from './DEns.js';

class Mailbox {
  constructor(attrs){
    // if(attrs.order === undefined) throw new Error('order must be defined');
    if(attrs.subdomain === undefined) throw new Error('subdomain must be defined');
    if(attrs.wallet === undefined) throw new Error('wallet must be defined');

    this.order = attrs.order;
    this.subdomain = attrs.subdomain;
    this.wallet = attrs.wallet;

    return this;
  }
}

class DMailbox {

  constructor(){
    this.mailboxes = this.getAll();
  }

  create(subdomain, password){
    if(
      this.isMailboxNameValid(subdomain) === true
    ){
      return this.isMailboxNameAvailable(subdomain).then((response)=>{
        return DEns.createSubdomain(password).then((wallet)=>{
          let mailbox = new Mailbox({
            // order: this.getAll().length + 1,
            subdomain: subdomain,
            wallet: wallet
          });
          this.mailboxes.push(mailbox);
          this.saveAll();
          return mailbox;
        });
      })
    }else{
      return new Promise((resolve, reject)=>reject(false));
    }
  }

  get(subdomain){
    let results = this.getAll().filter(mailbox => mailbox.subdomain === subdomain);
    if(results.length === 1){
      return results[0];
    }else if(results.length === 0){
      return false;
    }else{
      throw new Error('there should only be one result per subdomain')
    }
  }

  getAll(){
    if(localStorage.getItem('mailboxes') === null){
      return [];
    }else{
      return JSON.parse(localStorage.getItem('mailboxes'));
    }
  }

  saveAll(){
    localStorage.setItem('mailboxes', JSON.stringify(this.mailboxes));
  }

  toJSON(){
    return {
      order: this.order,
      subdomain: this.subdomain,
      wallet: this.wallet
    }
  }

  isMailboxNameValid(mailboxName){
    // check to see if name conforms to eth subdomain restrictions
    if(mailboxName === undefined || mailboxName === false) return false;
    let pattern = /(bob|alic)/
    let matches = mailboxName.match(pattern)
    console.log(matches)
    if(matches !== null && matches.length > 1){
      return true;      
    }else{
      return false;
    }
  }

  isMailboxNameAvailable(mailboxName){
    // check to see whether mailbox already exists
    // or handle error if network/endpoint failure
    return new Promise((resolve, reject)=>{

      if(this.get(mailboxName) === false){
        resolve(true);
      }else{
        resolve(false);
      }

    });
  }

}

export default new DMailbox();
