class DFileData {
  constructor(attrs){
    // if(attrs.order === undefined) throw new Error('order must be defined');
    if(attrs.swarmhash === undefined) throw new Error('from must be defined');
    if(attrs.filename === undefined) throw new Error('from must be defined');
    if(attrs.mime === undefined) throw new Error('from must be defined');
    if(attrs.size === undefined) throw new Error('from must be defined');

    this.swarmhash = attrs.swarmhash
    this.filename = attrs.filename
    this.mime = attrs.mime
    this.size = attrs.size

    return this;
  }

  toJSON(){
    return {
      swarmhash: this.swarmhash,
      filename: this.filename,
      mime: this.mime,
      size: this.size
    }
  }
}

export default DFileData;