class DMessage {
  constructor(attrs){
    // if(attrs.order === undefined) throw new Error('order must be defined');
    if(attrs.to === undefined) throw new Error('to must be defined');
    if(attrs.from === undefined) throw new Error('from must be defined');
    if(attrs.swarmhash === undefined) throw new Error('from must be defined');
    if(attrs.filename === undefined) throw new Error('from must be defined');
    if(attrs.mime === undefined) throw new Error('from must be defined');
    if(attrs.size === undefined) throw new Error('from must be defined');

    this.order = attrs.order;
    this.subdomain = attrs.subdomain;
    this.wallet = attrs.wallet;

    this.to = attrs.to
    this.from = attrs.from
    this.swarmhash = attrs.swarmhash
    this.filename = attrs.filename
    this.mime = attrs.mime
    this.size = attrs.size

    return this;
  }

  toJSON(){
    return {
      to: this.to,
      from: this.from,
      swarmhash: this.swarmhash,
      filename: this.filename,
      mime: this.mime,
      size: this.size
    }
  }
}

export default DMessage;