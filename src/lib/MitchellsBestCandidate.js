class MitchellsBestCandidate{

  constructor(opts = {}){
    this.placedDots = []
    let sampleSize = opts.sampleSize || 10;
    return this.generateCoordinates(sampleSize);
  }

  placeNewDot() {
    var dot = this.generateBestDot();
    this.placedDots.push(dot);
    this.drawDot(dot);
  };

  generateRandomPosition() {
    return [
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 100)
    ];
  }

  getDistanceToNearestDot(dot) {
    var shortest;
    for (var i = this.placedDots.length - 1; i >= 0; i--) {
        var distance = this.getDistance(this.placedDots[i], dot);
        if (!shortest || distance < shortest) shortest = distance;
    }
    return shortest;
  }

  getDistance(dot1, dot2) {
    var xDistance = Math.abs(dot1[0] - dot2[0]),
        yDistance = Math.abs(dot1[1] - dot2[1]),
        distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    return Math.floor(distance);
  }

  generateBestDot(samples) {
    var bestDot, bestDotDistance;
    for (var i = 0; i < samples; i++) {
        var candidateDot = this.generateRandomPosition(),
            distance;
        if (this.placedDots.length) return candidateDot;
        distance = this.getDistanceToNearestDot(candidateDot);
        if (!bestDot || distance > bestDotDistance) {
            bestDot = candidateDot;
            bestDotDistance = distance;
        }
    }
    return bestDot;
  }

  generateCoordinates(sampleSize) {

    for (var i = sampleSize - 1; i >= 0; i--) {
        this.placedDots.push(this.generateBestDot(50));
    }

    return this.placedDots;

  }   

}

export default MitchellsBestCandidate;