class DMailbox {

  constructor(gateway){

  }

  isMailboxNameValid(mailboxName){
    // check to see if name conforms to eth subdomain restrictions
    let pattern = /bob.+/
    let matches = mailboxName.match(pattern)
    if(matches !== null && matches.length === 1){
      return true;      
    }else{
      return false;
    }
  }

  isMailboxNameAvailable(mailboxName){
    // check to see whether mailbox already exists
    // or handle error if network/endpoint failure
    return new Promise((resolve, reject)=>{
      if(mailboxName === 'bobby'){
        resolve(true);
      }else{
        resolve(false);
      }
    });
  }

}

export default DMailbox;
