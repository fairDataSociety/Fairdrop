// import React, { Component } from 'react';
// import DTransfer from '../services/Dtransfer';

// let DT = new DTransfer('http://swarm-gateways.net/')

// class DWallet extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       walletIsSelected: false,
//       walletIsUnlocked: false,
//       selectedWalletFileName: "",
//       unlockWalletMessage: this.unlockWalletMessage(0),
//       unlockWalletError: false,
//       selectedWalletJSON: null,
//     }

//     this.handleSelectWallet = this.handleSelectWallet.bind(this);
//     this.handleFileChange = this.handleFileChange.bind(this);
//     this.handleUnlockWallet = this.handleUnlockWallet.bind(this);

//   }

//   unlockWalletMessage(message){
//     switch(message) {
//       case 0:
//           return "Please select your wallet V3 json file then enter your password to link your wallet.";
//       case 1:
//           return "Please enter your password to finish linking your wallet.";
//       case 2:
//           return "Wallet unlocked.";
//       default:
//           return message;
//     }
//   }

//   handleSelectWallet(e){
//     e.preventDefault();    
//     this.refs.dtWalletFileInput.click();
//   }

//   handleFileChange(e){
//     e.preventDefault();
//     if(this.refs.dtWalletFileInput.files.length > 0){
//       let file = this.refs.dtWalletFileInput.files[0]; 
//       this.readFile(file).then((fileContents)=>{
//         this.setState({
//           walletIsSelected: true,
//           selectedWalletFileName: this.refs.dtWalletFileInput.files[0].name,
//           unlockWalletMessage: this.unlockWalletMessage(1),          
//           selectedWalletJSON: fileContents
//         });
//       });
//     }else{
//       this.setState({
//         walletIsSelected: false,
//         selectedWalletFileName: "",
//         unlockWalletMessage: this.unlockWalletMessage(0)
//       });      
//     }
//   }

//   handleUnlockWallet(e){
//     e.preventDefault();
//     let decryptedWallet = DT.decryptWallet(this.state.selectedWalletJSON, this.refs.dtPasswordInput.value);
//     if(decryptedWallet.error === undefined){
//       this.setState({
//         walletIsUnlocked: true,
//         unlockWalletError: false,
//         unlockWalletMessage: this.unlockWalletMessage(2),
//       });
//       this.props.setDecryptedWallet(decryptedWallet);
//     }else{
//       this.setState({
//         walletIsUnlocked: false,
//         unlockWalletError: true,
//         unlockWalletMessage: this.unlockWalletMessage("Sorry! " + decryptedWallet.error + ", please try again!")
//       });
//     }
//     this.refs.dtPasswordInput.value = "";
//   }

//   handleDeleteWallet(e){
//     e.preventDefault();    
//     this.setState({
//       walletIsUnlocked: false,
//       unlockWalletMessage: this.unlockWalletMessage(0)
//     });
//     this.props.setDecryptedWallet(false);
//   }

//   readFile(file, password) {
//     return new Promise((resolve, reject)=>{
//       var fr = new FileReader();
//       fr.onload = (e)=>{
//         resolve(fr.result);
//       }

//       fr.readAsText(file); 
//     })
//   }


//   render() {
//     return (
//       <div>
//       <form>
//         <p className="dt-wallet-message">{this.state.unlockWalletMessage}</p>
//         {this.state.walletIsUnlocked && 
//           <div>
//             <p className="dt-wallet-filename">{this.state.selectedWalletFileName}</p>
//             <button id="dt-delete-wallet-button" className="dt-delete-wallet-button" onClick={this.handleDeleteWallet} /><label>Delete Wallet</label>
//           </div>
//         }
//         {!this.state.walletIsUnlocked && 
//           <div>
//               <button id="dt-select-wallet-button" className="dt-toggle-button" onClick={this.handleSelectWallet} /><label>Select Your Wallet</label>          
//               <input id="dt-hidden-file-input" autoComplete="off" className="dt-hidden-file-input" type="file" onChange={this.handleFileChange} ref="dtWalletFileInput"/>
//               <p className="dt-wallet-filename">{this.state.selectedWalletFileName}</p>
//               <input id="dt-password-input" autoComplete="off" className="dt-password-input" type="password" ref="dtPasswordInput" />
//               <button id="dt-unlock-wallet-button" className="dt-unlock-wallet-button" onClick={this.handleUnlockWallet} /><label>Unlock Your Wallet</label>
//           </div>
//         }
//       </form>
//       </div>
//     );
//   }
// }

// export default DWallet;