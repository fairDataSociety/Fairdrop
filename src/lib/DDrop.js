class DDrop{

  dropRing(className, locationX = false, locationY = false){

    let dropParent = document.getElementsByClassName(className)[0];

    let drop = document.createElement('div');

    if(locationX && locationY){
      let dropStyle = `
        top: ${locationY-(dropParent.clientHeight/2)}px;
        left: ${locationX-(dropParent.clientWidth/2)}px;
      `;
      drop.setAttribute('style', dropStyle);    
    }

    drop.setAttribute('class', 'df-drop-ring');
    dropParent.append(drop);

  }

  drop(className, locationX, locationY){
    var i = 0;
    let dropInt = setInterval(()=>{
      i = i+1;
      if(i>4){
        clearInterval(dropInt);
      }
      this.dropRing(className, locationX, locationY);
    }, 277);
  }

}

export default DDrop;