class DDrop{

  dropRing(className, locationX = false, locationY = false){

    let dropParent = document.getElementsByClassName(className)[0];

    let drop = document.createElement('div');
    if(locationX && locationY){
      let dropStyle = `
        top: ${locationY-((dropParent.clientHeight*1.5)/2)}px;
        left: ${locationX-((dropParent.clientWidth*1.5)/2)}px;
      `;
      drop.setAttribute('style', dropStyle);
    }else{
      let dropStyle = `
        top: ${((dropParent.clientHeight/2)-(dropParent.clientHeight*1.5)/2)}px;
        left: ${((dropParent.clientWidth/2)-(dropParent.clientWidth*1.5)/2)}px;
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
      if(i>6){
        clearInterval(dropInt);
      }
      this.dropRing(className, locationX, locationY);
    }, 311-(11*i));
  }

}

export default DDrop;