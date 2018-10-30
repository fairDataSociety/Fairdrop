import MitchellsBestCandidate from './MitchellsBestCandidate'

class DMist{

  mistSpot(className, color1, color2, color3, locationX, locationY, delay){

    let mistParent = document.getElementsByClassName(className)[0];

    let x = mistParent.clientHeight * (locationX/100);
    let y = mistParent.clientHeight * (locationY/100);

    let mistStyle = `
      background: -webkit-radial-gradient(
        center center, 
        50% 50%, 
        ${color1} 0%, 
        ${color2} 90%, 
        ${color3} 100%);
      animation: dfmist 6s infinite;
      background-position: ${x}px ${y}px;
      animation-delay: ${delay}s;
    `;

    let mist = document.createElement('div');
    mist.setAttribute('style', mistStyle);
    mist.setAttribute('class', 'df-mist-spot');
    mistParent.append(mist);

  }

  mist(className){
    let mistCoordinates = new MitchellsBestCandidate();
    for (var i = mistCoordinates.length - 1; i >= 0; i--) {
      this.mistSpot(className, 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0)', mistCoordinates[i][0], mistCoordinates[i][1], i*2);
    }       
  }
}


export default DMist;